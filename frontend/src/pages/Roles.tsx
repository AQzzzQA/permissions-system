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
  Checkbox,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  LockOutlined,
  KeyOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { rolesAPI, permissionsAPI } from '../services/api';
import { Role, SCOPE_OPTIONS, SCOPE_GROUPS } from '../types';

const { Option } = Select;

const Roles: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [permissionsDrawerVisible, setPermissionsDrawerVisible] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [rolePermissions, setRolePermissions] = useState<any[]>([]);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const response = await rolesAPI.list();
      setRoles(response.roles || []);
    } catch (error: any) {
      message.error(error.response?.data?.error || '获取角色列表失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchRolePermissions = async (roleId: string) => {
    try {
      const response = await permissionsAPI.getRolePermissions(roleId);
      setRolePermissions(response.permissions || []);
    } catch (error) {
      console.error('Failed to fetch role permissions:', error);
    }
  };

  const handleCreate = () => {
    setEditingRole(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (role: Role) => {
    setEditingRole(role);
    form.setFieldsValue({
      ...role,
      scopes: role.scopes,
    });
    setModalVisible(true);
  };

  const handleDelete = async (roleId: string) => {
    try {
      await rolesAPI.delete(roleId);
      message.success('角色已删除');
      fetchRoles();
    } catch (error: any) {
      message.error(error.response?.data?.error || '删除角色失败');
    }
  };

  const handleViewPermissions = (role: Role) => {
    setSelectedRole(role);
    fetchRolePermissions(role.id);
    setPermissionsDrawerVisible(true);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();

      if (editingRole) {
        await rolesAPI.update(editingRole.id, values);
        message.success('角色已更新');
      } else {
        await rolesAPI.create(values);
        message.success('角色已创建');
      }

      setModalVisible(false);
      fetchRoles();
    } catch (error: any) {
      message.error(error.response?.data?.error || '操作失败');
    }
  };

  const columns = [
    {
      title: '角色名称',
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
      title: '权限数量',
      dataIndex: 'scopes',
      key: 'scopes',
      render: (scopes: string[]) => scopes?.length || 0,
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
      render: (_: any, record: Role) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<KeyOutlined />}
            onClick={() => handleViewPermissions(record)}
          >
            权限
          </Button>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          {record.id !== 'role-owner' && record.id !== 'role-admin' && record.id !== 'role-member' && record.id !== 'role-viewer' && (
            <Popconfirm
              title="确定要删除此角色吗？"
              onConfirm={() => handleDelete(record.id)}
              okText="确定"
              cancelText="取消"
            >
              <Button type="link" size="small" danger icon={<DeleteOutlined />}>
                删除
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card
        title="角色列表"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            创建角色
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={roles}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={editingRole ? '编辑角色' : '创建角色'}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => setModalVisible(false)}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="角色名称"
            rules={[{ required: true, message: '请输入角色名称' }]}
          >
            <Input placeholder="请输入角色名称" />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={3} placeholder="请输入描述" />
          </Form.Item>
          <Form.Item label="权限作用域">
            <Form.Item name="scopes" noStyle>
              <Select mode="multiple" placeholder="选择权限作用域" style={{ width: '100%' }}>
                {SCOPE_OPTIONS.map((scope) => (
                  <Option key={scope.value} value={scope.value}>
                    {scope.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Form.Item>
        </Form>
      </Modal>

      <Drawer
        title={`${selectedRole?.name} - 权限详情`}
        open={permissionsDrawerVisible}
        onClose={() => setPermissionsDrawerVisible(false)}
        width={600}
      >
        <div style={{ marginBottom: 16 }}>
          <Tag color="blue" icon={<LockOutlined />}>
            {selectedRole?.name}
          </Tag>
        </div>

        {SCOPE_GROUPS.map((group) => (
          <div key={group.label} style={{ marginBottom: 16 }}>
            <h4 style={{ marginBottom: 8 }}>{group.label}</h4>
            <Space wrap>
              {group.options.map((scope) => {
                const hasPermission = selectedRole?.scopes?.includes(scope);
                return (
                  <Tag
                    key={scope}
                    color={hasPermission ? 'green' : 'default'}
                    icon={hasPermission ? <LockOutlined /> : undefined}
                  >
                    {SCOPE_OPTIONS.find((s) => s.value === scope)?.label || scope}
                  </Tag>
                );
              })}
            </Space>
          </div>
        ))}

        <Divider />

        <h4>详细权限</h4>
        <Table
          dataSource={rolePermissions}
          rowKey="id"
          pagination={false}
          size="small"
          columns={[
            {
              title: '资源类型',
              dataIndex: 'resource_type',
              key: 'resource_type',
            },
            {
              title: '操作',
              dataIndex: 'actions',
              key: 'actions',
              render: (actions: string[]) => actions?.join(', ') || '-',
            },
          ]}
        />
      </Drawer>
    </div>
  );
};

export default Roles;
