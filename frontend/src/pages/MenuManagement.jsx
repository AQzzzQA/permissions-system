import { Table, Button } from 'antd'

const MenuManagement = () => {
  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: '菜单名称', dataIndex: 'name', key: 'name' },
    { title: '路径', dataIndex: 'path', key: 'path' },
    { title: '图标', dataIndex: 'icon', key: 'icon' },
    { title: '组件', dataIndex: 'component', key: 'component' }
  ]

  const data = [
    { id: 1, name: '首页', path: '/', icon: 'dashboard', component: 'Dashboard' },
    { id: 2, name: '用户管理', path: '/users', icon: 'user', component: 'UserManagement' },
    { id: 3, name: '角色管理', path: '/roles', icon: 'team', component: 'RoleManagement' },
    { id: 4, name: '权限管理', path: '/permissions', icon: 'key', component: 'PermissionManagement' },
    { id: 5, name: '菜单管理', path: '/menus', icon: 'menu', component: 'MenuManagement' }
  ]

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2>菜单管理</h2>
        <Button type="primary">新增菜单</Button>
      </div>

      <Table columns={columns} dataSource={data} rowKey="id" />
    </div>
  )
}

export default MenuManagement
