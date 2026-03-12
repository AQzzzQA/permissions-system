import { useEffect, useState } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  message,
  Popconfirm,
  Tag,
  Space,
  Card,
  Drawer,
  Row,
  Col,
  Divider,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  TeamOutlined,
  UserOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { workspacesAPI, rolesAPI } from '../services/api';
import { Workspace, Role } from '../types';

const { Option } = Select;

const Workspaces: React.FC = () => {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [membersDrawerVisible, setMembersDrawerVisible] = useState(false);
  const [editingWorkspace, setEditingWorkspace] = useState<Workspace | null>(null);
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [form] = Form.useForm();
  const [memberForm] = Form.useForm();

  useEffect(() => {
    fetchWorkspaces();
    fetchRoles();
  }, []);

  const fetchWorkspaces = async () => {
    setLoading(true);
    try {
      const response = await workspacesAPI.list();
      setWorkspaces(response.workspaces || []);
    } catch (error: any) {
      message.error(error.response?.data?.error || '获取工作空间列表失败');
    } finally {
      setLoading(false);
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

  const fetchMembers = async (workspaceId: string) => {
    try {
      const response = await workspacesAPI.getMembers(workspaceId);
      setMembers(response.members || []);
    } catch (error: any) {
      message.error(error.response?.data?.error || '获取成员列表失败');
    }
  };

  const handleCreate = () => {
    setEditingWorkspace(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (workspace: Workspace) => {
    setEditingWorkspace(workspace);
    form.setFieldsValue(workspace);
    setModalVisible(true);
  };

  const handleDelete = async (workspaceId: string) => {
    try {
      await workspacesAPI.delete(workspaceId);
      message.success('工作空间已删除');
      fetchWorkspaces();
    } catch (error: any) {
      message.error(error.response?.data?.error || '删除工作空间失败');
    }
  };

  const handleViewMembers = (workspace: Workspace) => {
    setSelectedWorkspace(workspace);
    fetchMembers(workspace.id);
    setMembersDrawerVisible(true);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();

      if (editingWorkspace) {
        await workspacesAPI.update(editingWorkspace.id, values);
        message.success('工作空间已更新');
      } else {
        await workspacesAPI.create(values);
        message.success('工作空间已创建');
      }

      setModalVisible(false);
      fetchWorkspaces();
    } catch (error: any) {
      message.error(error.response?.data?.error || '操作失败');
    }
  };

  const handleAddMember = async () => {
    try {
      const values = await memberForm.validateFields();
      await workspacesAPI.addMember(selectedWorkspace!.id, values);
      message.success('成员已添加');
      memberForm.resetFields();
      fetchMembers(selectedWorkspace!.id);
    } catch (error: any) {
      message.error(error.response?.data?.error || '添加成员失败');
    }
  };

  const handleRemoveMember = async (userId: string) => {
    try {
      await workspacesAPI.removeMember(selectedWorkspace!.id, userId);
      message.success('成员已移除');
      fetchMembers(selectedWorkspace!.id);
    } catch (error: any) {
      message.error(error.response?.data?.error || '移除成员失败');
    }
  };

  const handleUpdateMemberRole = async (userId: string, roleId: string) => {
    try {
      await workspacesAPI.updateMember(selectedWorkspace!.id, userId, roleId);
      message.success('角色已更新');
      fetchMembers(selectedWorkspace!.id);
    } catch (error: any) {
      message.error(error.response?.data?.error || '更新角色失败');
    }
  };

  const workspaceColumns = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      render: (text: string) => text || '-',
    },
    {
      title: '所有者',
      dataIndex: 'owner',
      key: 'owner',
      render: (owner: any) => owner?.username || '-',
    },
    {
      title: '成员数',
      dataIndex: 'member_count',
      key: 'member_count',
      render: (_: any, record: Workspace) => record.members?.length || 0,
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => new Date(date).toLocaleDateString('zh-CN'),
    },
    {
      title: '操作',
      key: 'actions',
      render: (_: any, record: Workspace) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<TeamOutlined />}
            onClick={() => handleViewMembers(record)}
          >
            成员
          </Button>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除此工作空间吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const memberColumns = [
    {
      title: '用户',
      dataIndex: 'user',
      key: 'user',
      render: (user: any) => user?.username || '-',
    },
    {
      title: '邮箱',
      dataIndex: 'user',
      key: 'email',
      render: (user: any) => user?.email || '-',
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (role: Role, record: any) => (
        <Select
          value={role?.id}
          style={{ width: 150 }}
          onChange={(value) => handleUpdateMemberRole(record.user_id, value)}
        >
          {roles.map((r) => (
            <Option key={r.id} value={r.id}>
              {r.name}
            </Option>
          ))}
        </Select>
      ),
    },
    {
      title: '加入时间',
      dataIndex: 'joined_at',
      key: 'joined_at',
      render: (date: string) => new Date(date).toLocaleDateString('zh-CN'),
    },
    {
      title: '操作',
      key: 'actions',
      render: (_: any, record: any) => (
        <Popconfirm
          title="确定要移除此成员吗？"
          onConfirm={() => handleRemoveMember(record.user_id)}
          okText="确定"
          cancelText="取消"
        >
          <Button type="link" size="small" danger icon={<DeleteOutlined />}>
            移除
          </Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <div>
      <Card
        title="工作空间列表"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            创建工作空间
          </Button>
        }
      >
        <Table
          columns={workspaceColumns}
          dataSource={workspaces}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={editingWorkspace ? '编辑工作空间' : '创建工作空间'}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => setModalVisible(false)}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="名称"
            rules={[{ required: true, message: '请输入工作空间名称' }]}
          >
            <Input placeholder="请输入工作空间名称" />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={4} placeholder="请输入描述" />
          </Form.Item>
        </Form>
      </Modal>

      <Drawer
        title={`${selectedWorkspace?.name} - 成员管理`}
        open={membersDrawerVisible}
        onClose={() => setMembersDrawerVisible(false)}
        width={800}
      >
        <div style={{ marginBottom: 16 }}>
          <Form layout="inline" form={memberForm}>
            <Form.Item
              name="email"
              rules={[{ required: true, message: '请输入用户邮箱' }]}
            >
              <Input placeholder="用户邮箱" style={{ width: 200 }} />
            </Form.Item>
            <Form.Item
              name="role_id"
              rules={[{ required: true, message: '请选择角色' }]}
            >
              <Select placeholder="选择角色" style={{ width: 150 }}>
                {roles.map((role) => (
                  <Option key={role.id} value={role.id}>
                    {role.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item>
              <Button type="primary" onClick={handleAddMember}>
                添加成员
              </Button>
            </Form.Item>
          </Form>
        </div>

        <Table
          columns={memberColumns}
          dataSource={members}
          rowKey="id"
          pagination={false}
        />
      </Drawer>
    </div>
  );
};

export default Workspaces;
