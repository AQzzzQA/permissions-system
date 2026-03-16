import { Table, Button } from 'antd'

const PermissionManagement = () => {
  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: '权限名称', dataIndex: 'name', key: 'name' },
    { title: '权限编码', dataIndex: 'code', key: 'code' },
    { title: '分类', dataIndex: 'category', key: 'category' }
  ]

  const data = [
    { id: 1, name: '用户管理', code: 'users:read', category: '用户管理' },
    { id: 2, name: '用户创建', code: 'users:write', category: '用户管理' },
    { id: 3, name: '用户删除', code: 'users:delete', category: '用户管理' },
    { id: 4, name: '角色管理', code: 'roles:read', category: '角色管理' },
    { id: 5, name: '角色创建', code: 'roles:write', category: '角色管理' }
  ]

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2>权限管理</h2>
        <Button type="primary">新增权限</Button>
      </div>

      <Table columns={columns} dataSource={data} rowKey="id" />
    </div>
  )
}

export default PermissionManagement
