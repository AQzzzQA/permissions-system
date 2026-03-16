import { Table, Button } from 'antd'

const RoleManagement = () => {
  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: '角色名称', dataIndex: 'name', key: 'name' },
    { title: '角色编码', dataIndex: 'code', key: 'code' },
    { title: '描述', dataIndex: 'description', key: 'description' },
    { title: '权限', dataIndex: 'permissions', key: 'permissions', render: (perms) => perms.join(', ') }
  ]

  const data = [
    { id: 1, name: '超级管理员', code: 'superadmin', description: '拥有所有权限', permissions: ['all'] },
    { id: 2, name: '管理员', code: 'admin', description: '管理权限', permissions: ['users:read', 'users:write'] },
    { id: 3, name: '普通用户', code: 'user', description: '普通用户权限', permissions: ['users:read'] }
  ]

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2>角色管理</h2>
        <Button type="primary">新增角色</Button>
      </div>

      <Table columns={columns} dataSource={data} rowKey="id" />
    </div>
  )
}

export default RoleManagement
