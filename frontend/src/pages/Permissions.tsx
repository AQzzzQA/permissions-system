import { useEffect, useState } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Select,
  message,
  Tag,
  Space,
  Card,
  Row,
  Col,
  Input,
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  CheckOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { permissionsAPI, usersAPI, rolesAPI } from '../services/api';
import { Permission, User, Role } from '../types';

const { Option } = Select;

const Permissions: React.FC = () => {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [checkModalVisible, setCheckModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [checkForm] = Form.useForm();
  const [checkResult, setCheckResult] = useState<any>(null);

  useEffect(() => {
    fetchPermissions();
    fetchUsers();
    fetchRoles();
  }, []);

  const fetchPermissions = async (filters?: any) => {
    setLoading(true);
    try {
      const response = await permissionsAPI.list(filters);
      setPermissions(response.permissions || []);
    } catch (error: any) {
      message.error(error.response?.data?.error || '获取权限列表失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await usersAPI.list();
      setUsers(response.users || []);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await rolesAPI.list();
      setRoles(response.roles || []);
    } catch (error) {
      console.error('Failed to fetch roles:', error);
    }
  };

  const handleCreate = () => {
    form.resetFields();
    setModalVisible(true);
  };

  const handleDelete = async (permissionId: string) => {
    try {
      await permissionsAPI.delete(permissionId);
      message.success('权限已删除');
      fetchPermissions();
    } catch (error: any) {
      message.error(error.response?.data?.error || '删除权限失败');
    }
  };

  const handleCreatePermission = async () => {
    try {
      const values = await form.validateFields();
      await permissionsAPI.create(values);
      message.success('权限已创建');
      setModalVisible(false);
      fetchPermissions();
    } catch (error: any) {
      message.error(error.response?.data?.error || '创建权限失败');
    }
  };

  const handleCheckPermission = async () => {
    try {
      const values = await checkForm.validateFields();
      const response = await permissionsAPI.check(values);
      setCheckResult(response);
    } catch (error: any) {
      message.error(error.response?.data?.error || '权限检查失败');
    }
  };

  const columns = [
    {
      title: '资源类型',
      dataIndex: 'resource_type',
      key: 'resource_type',
      render: (type: string) => {
        const typeMap: any = {
          workspace: '工作空间',
          session: '会话',
          skill: '技能',
          channel: '频道',
          config: '配置',
        };
        return <Tag color="blue">{typeMap[type] || type}</Tag>;
      },
    },
    {
      title: '资源 ID',
      dataIndex: 'resource_id',
      key: 'resource_id',
      render: (id: string) => id || '全局',
    },
    {
      title: '用户',
      dataIndex: 'user',
      key: 'user',
      render: (user: User) => user?.username || '-',
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (role: Role) => role?.name || '-',
    },
    {
      title: '操作',
      dataIndex: 'actions',
      key: 'actions',
      render: (actions: string[]) => (
        <Space wrap>
          {actions?.map((action) => (
            <Tag key={action} color="green">
              {action}
            </Tag>
          ))}
        </Space>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => new Date(date).toLocaleString('zh-CN'),
    },
    {
      title: '操作',
      key: 'actions',
      render: (_: any, record: Permission) => (
        <Button
          type="link"
          size="small"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleDelete(record.id)}
        >
          删除
        </Button>
      ),
    },
  ];

  return (
    <div>
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={24}>
          <Card
            title="权限检查"
            extra={
              <Button type="primary" icon={<CheckOutlined />} onClick={() => setCheckModalVisible(true)}>
                检查权限
              </Button>
            }
          >
            {checkResult && (
              <div>
                <Tag
                  color={checkResult.hasPermission ? 'green' : 'red'}
                  icon={checkResult.hasPermission ? <CheckOutlined /> : <DeleteOutlined />}
                  style={{ fontSize: 16, padding: '8px 16px' }}
                >
                  {checkResult.hasPermission ? '有权限' : '无权限'}
                </Tag>
              </div>
            )}
          </Card>
        </Col>
      </Row>

      <Card
        title="权限列表"
        extra={
          <Space>
            <Select
              placeholder="筛选资源类型"
              style={{ width: 150 }}
              onChange={(value) => fetchPermissions({ resource_type: value })}
              allowClear
            >
              <Option value="workspace">工作空间</Option>
              <Option value="session">会话</Option>
              <Option value="skill">技能</Option>
              <Option value="channel">频道</Option>
              <Option value="config">配置</Option>
            </Select>
            <Select
              placeholder="筛选用户"
              style={{ width: 150 }}
              onChange={(value) => fetchPermissions({ user_id: value })}
              showSearch
              optionFilterProp="children"
              allowClear
            >
              {users.map((user) => (
                <Option key={user.id} value={user.id}>
                  {user.username}
                </Option>
              ))}
            </Select>
            <Select
              placeholder="筛选角色"
              style={{ width: 150 }}
              onChange={(value) => fetchPermissions({ role_id: value })}
              allowClear
            >
              {roles.map((role) => (
                <Option key={role.id} value={role.id}>
                  {role.name}
                </Option>
              ))}
            </Select>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
              创建权限
            </Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={permissions}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title="创建权限"
        open={modalVisible}
        onOk={handleCreatePermission}
        onCancel={() => setModalVisible(false)}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="resource_type"
            label="资源类型"
            rules={[{ required: true, message: '请选择资源类型' }]}
          >
            <Select placeholder="选择资源类型">
              <Option value="workspace">工作空间</Option>
              <Option value="session">会话</Option>
              <Option value="skill">技能</Option>
              <Option value="channel">频道</Option>
              <Option value="config">配置</Option>
            </Select>
          </Form.Item>
          <Form.Item name="resource_id" label="资源 ID（可选）">
            <Input placeholder="留空表示全局权限" />
          </Form.Item>
          <Form.Item
            name="user_id"
            label="用户（可选）"
            tooltip="用户或角色必须指定其中一个"
          >
            <Select placeholder="选择用户" allowClear>
              {users.map((user) => (
                <Option key={user.id} value={user.id}>
                  {user.username}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="role_id"
            label="角色（可选）"
            tooltip="用户或角色必须指定其中一个"
          >
            <Select placeholder="选择角色" allowClear>
              {roles.map((role) => (
                <Option key={role.id} value={role.id}>
                  {role.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="actions"
            label="操作"
            rules={[{ required: true, message: '请选择操作' }]}
          >
            <Select mode="multiple" placeholder="选择操作">
              <Option value="read">读取</Option>
              <Option value="write">写入</Option>
              <Option value="delete">删除</Option>
              <Option value="admin">管理</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="检查权限"
        open={checkModalVisible}
        onOk={handleCheckPermission}
        onCancel={() => setCheckModalVisible(false)}
        width={600}
      >
        <Form form={checkForm} layout="vertical">
          <Form.Item
            name="workspaceId"
            label="工作空间 ID"
            rules={[{ required: true, message: '请输入工作空间 ID' }]}
          >
            <Input placeholder="输入工作空间 ID" />
          </Form.Item>
          <Form.Item
            name="resource_type"
            label="资源类型"
            rules={[{ required: true, message: '请选择资源类型' }]}
          >
            <Select placeholder="选择资源类型">
              <Option value="workspace">工作空间</Option>
              <Option value="session">会话</Option>
              <Option value="skill">技能</Option>
              <Option value="channel">频道</Option>
              <Option value="config">配置</Option>
            </Select>
          </Form.Item>
          <Form.Item name="resource_id" label="资源 ID（可选）">
            <Input placeholder="留空表示全局权限" />
          </Form.Item>
          <Form.Item
            name="required_actions"
            label="需要的操作"
            rules={[{ required: true, message: '请选择操作' }]}
          >
            <Select mode="multiple" placeholder="选择操作">
              <Option value="read">读取</Option>
              <Option value="write">写入</Option>
              <Option value="delete">删除</Option>
              <Option value="admin">管理</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Permissions;
