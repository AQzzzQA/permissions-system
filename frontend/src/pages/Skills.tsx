import React, { useState, useEffect } from 'react';
import {
  Card,
  List,
  Button,
  Modal,
  Form,
  Input,
  Space,
  message,
  Tag,
  Progress,
  Tabs,
  Divider,
  Table,
  Tooltip,
  Popconfirm,
  Badge
} from 'antd';
import {
  AppstoreAddOutlined,
  DeleteOutlined,
  SettingOutlined,
  HistoryOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  LoadingOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

const SkillsPage: React.FC = () => {
  const [workspaceId] = useState('workspace-123'); // 实际中从路由参数获取
  const [skills, setSkills] = useState<any[]>([]);
  const [installedSkills, setInstalledSkills] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [installModalVisible, setInstallModalVisible] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState<any>(null);
  const [installForm] = Form.useForm();
  const [logModalVisible, setLogModalVisible] = useState(false);
  const [installLogs, setInstallLogs] = useState<any[]>([]);

  // 加载技能列表
  const loadSkills = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/skills/workspace/${workspaceId}/skills`);
      const data = await response.json();
      if (data.success) {
        setSkills(data.skills);
      }
    } catch (error) {
      message.error('加载技能列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 加载已安装技能
  const loadInstalledSkills = async () => {
    try {
      const response = await fetch(`/api/skills/workspace/${workspaceId}/skills`);
      const data = await response.json();
      if (data.success) {
        setInstalledSkills(data.skills.filter((skill: any) => skill.installed));
      }
    } catch (error) {
      message.error('加载已安装技能失败');
    }
  };

  // 加载安装日志
  const loadInstallLogs = async () => {
    try {
      const response = await fetch(`/api/skills/workspace/${workspaceId}/skills/logs`);
      const data = await response.json();
      if (data.success) {
        setInstallLogs(data.logs);
      }
    } catch (error) {
      message.error('加载安装日志失败');
    }
  };

  useEffect(() => {
    loadSkills();
    loadInstalledSkills();
  }, [workspaceId]);

  const handleInstallClick = (skill: any) => {
    setSelectedSkill(skill);
    installForm.resetFields();
    setInstallModalVisible(true);
  };

  const handleInstall = async () => {
    try {
      const values = await installForm.validateFields();
      setLoading(true);
      
      const response = await fetch(`/api/skills/workspace/${workspaceId}/skills`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          skillId: selectedSkill.id,
          version: selectedSkill.version,
          config: values.config || {}
        }),
      });

      const data = await response.json();
      if (data.success) {
        message.success('技能安装成功');
        setInstallModalVisible(false);
        loadSkills();
        loadInstalledSkills();
      } else {
        message.error(data.error || '安装失败');
      }
    } catch (error: any) {
      message.error(error.message || '安装失败');
    } finally {
      setLoading(false);
    }
  };

  const handleUninstall = async (skillId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/skills/workspace/${workspaceId}/skills/${skillId}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (data.success) {
        message.success('技能卸载成功');
        loadSkills();
        loadInstalledSkills();
      } else {
        message.error(data.error || '卸载失败');
      }
    } catch (error: any) {
      message.error(error.error || '卸载失败');
    } finally {
      setLoading(false);
    }
  };

  const handleViewLogs = () => {
    loadInstallLogs();
    setLogModalVisible(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge status="success" text="成功" />;
      case 'failed':
        return <Badge status="error" text="失败" />;
      case 'pending':
        return <Badge status="processing" text="进行中" />;
      default:
        return <Badge status="default" text={status} />;
    }
  };

  const getActionButtons = (record: any) => {
    if (record.installed) {
      return (
        <Space size="small">
          <Tooltip title="查看配置">
            <Button
              type="text"
              icon={<SettingOutlined />}
              onClick={() => {
                // 实际中会打开配置模态框
                message.info('配置功能开发中');
              }}
            />
          </Tooltip>
          <Popconfirm
            title="确定要卸载这个技能吗？"
            onConfirm={() => handleUninstall(record.id)}
            okText="确认"
            cancelText="取消"
          >
            <Tooltip title="卸载">
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      );
    } else {
      return (
        <Button
          type="primary"
          icon={<AppstoreAddOutlined />}
          onClick={() => handleInstallClick(record)}
        >
          安装
        </Button>
      );
    }
  };

  const columns: ColumnsType<any> = [
    {
      title: '技能名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: any) => (
        <div>
          <div>{text}</div>
          <div style={{ fontSize: '12px', color: '#999' }}>
            作者: {record.author} | 版本: {record.version}
          </div>
        </div>
      ),
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      render: (text: string) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: '评分',
      dataIndex: 'rating',
      key: 'rating',
      render: (value: number) => (
        <Space>
          <div>{value}</div>
          <div style={{ fontSize: '12px' }}>
            {value >= 4.5 ? <CheckCircleOutlined style={{ color: 'green' }} /> : <ExclamationCircleOutlined style={{ color: 'orange' }} />}
          </div>
        </Space>
      ),
    },
    {
      title: '安装状态',
      dataIndex: 'installed',
      key: 'installed',
      render: (value: boolean) => value ? <Badge status="success" text="已安装" /> : <Badge status="default" text="未安装" />,
    },
    {
      title: '下载量',
      dataIndex: 'download_count',
      key: 'download_count',
    },
    {
      title: '操作',
      key: 'action',
      render: getActionButtons,
    },
  ];

  const logColumns: ColumnsType<any> = [
    {
      title: '技能名称',
      dataIndex: 'skill_name',
      key: 'skill_name',
    },
    {
      title: '操作',
      dataIndex: 'action',
      key: 'action',
      render: (text: string) => {
        const actionMap = {
          install: '安装',
          uninstall: '卸载',
          update: '更新',
          rollback: '回滚'
        };
        return actionMap[text as keyof typeof actionMap] || text;
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: getStatusBadge,
    },
    {
      title: '版本',
      dataIndex: 'version',
      key: 'version',
    },
    {
      title: '操作用户',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: '时间',
      dataIndex: 'installed_at',
      key: 'installed_at',
      render: (text: string) => new Date(text).toLocaleString(),
    },
  ];

  const items = [
    {
      key: 'skills',
      label: (
        <span>
          <AppstoreAddOutlined />
          可用技能
        </span>
      ),
      children: (
        <Card>
          <Table
            columns={columns}
            dataSource={skills}
            rowKey="id"
            loading={loading}
            pagination={{
              total: skills.length,
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
            }}
          />
        </Card>
      ),
    },
    {
      key: 'installed',
      label: (
        <span>
          <CheckCircleOutlined />
          已安装技能
        </span>
      ),
      children: (
        <Card>
          <List
            dataSource={installedSkills}
            renderItem={(item) => (
              <List.Item
                actions={[
                  <Button key="config" type="link" icon={<SettingOutlined />}>
                    配置
                  </Button>,
                  <Popconfirm
                    key="delete"
                    title="确定要卸载这个技能吗？"
                    onConfirm={() => handleUninstall(item.id)}
                    okText="确认"
                    cancelText="取消"
                  >
                    <Button type="link" danger icon={<DeleteOutlined />}>
                      卸载
                    </Button>
                  </Popconfirm>
                ]}
              >
                <List.Item.Meta
                  title={item.name}
                  description={item.description}
                />
                <div>
                  <Tag color="blue">{item.category}</Tag>
                  <span style={{ marginLeft: 8 }}>版本: {item.installedVersion}</span>
                </div>
              </List.Item>
            )}
          />
        </Card>
      ),
    },
    {
      key: 'logs',
      label: (
        <span>
          <HistoryOutlined />
          安装日志
        </span>
      ),
      children: (
        <Card>
          <Button type="primary" icon={<HistoryOutlined />} onClick={handleViewLogs}>
            查看日志
          </Button>
          <Table
            style={{ marginTop: 16 }}
            columns={logColumns}
            dataSource={installLogs}
            rowKey="id"
            pagination={{
              total: installLogs.length,
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
            }}
          />
        </Card>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card title="技能管理">
        <Tabs defaultActiveKey="skills" items={items} />
      </Card>

      <Modal
        title="安装技能"
        open={installModalVisible}
        onCancel={() => setInstallModalVisible(false)}
        onOk={handleInstall}
        confirmLoading={loading}
      >
        <Form form={installForm} layout="vertical">
          <Form.Item name="config">
            <Input.TextArea
              rows={4}
              placeholder="技能配置（JSON 格式，可选）"
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="安装日志"
        open={logModalVisible}
        onCancel={() => setLogModalVisible(false)}
        footer={null}
        width="80%"
        style={{ top: 20 }}
      >
        <Table
          columns={logColumns}
          dataSource={installLogs}
          rowKey="id"
          pagination={{
            total: installLogs.length,
            pageSize: 20,
            showSizeChanger: true,
            showQuickJumper: true,
          }}
        />
      </Modal>
    </div>
  );
};

export default SkillsPage;