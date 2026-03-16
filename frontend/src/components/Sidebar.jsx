import { Menu } from 'antd'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  DashboardOutlined,
  UserOutlined,
  TeamOutlined,
  KeyOutlined,
  MenuOutlined
} from '@ant-design/icons'

const Sidebar = ({ collapsed, onCollapse }) => {
  const navigate = useNavigate()
  const location = useLocation()

  const menuItems = [
    {
      key: '/',
      icon: <DashboardOutlined />,
      label: '首页'
    },
    {
      key: '/users',
      icon: <UserOutlined />,
      label: '用户管理'
    },
    {
      key: '/roles',
      icon: <TeamOutlined />,
      label: '角色管理'
    },
    {
      key: '/permissions',
      icon: <KeyOutlined />,
      label: '权限管理'
    },
    {
      key: '/menus',
      icon: <MenuOutlined />,
      label: '菜单管理'
    }
  ]

  const handleMenuClick = ({ key }) => {
    navigate(key)
  }

  return (
    <Menu
      theme="dark"
      mode="inline"
      selectedKeys={[location.pathname]}
      items={menuItems}
      onClick={handleMenuClick}
      inlineCollapsed={collapsed}
    />
  )
}

export default Sidebar
