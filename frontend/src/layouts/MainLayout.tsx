import { Layout, Menu, Avatar, Dropdown, Space, Badge } from 'antd';
import {
  DashboardOutlined,
  TeamOutlined,
  UserOutlined,
  LockOutlined,
  SettingOutlined,
  LogoutOutlined,
  CrownOutlined,
  AppstoreAddOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const { Header, Content, Sider } = Layout;

const MainLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isSuperAdmin } = useAuth();

  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: '控制台',
    },
    {
      key: '/workspaces',
      icon: <TeamOutlined />,
      label: '工作空间',
    },
    {
      key: '/users',
      icon: <UserOutlined />,
      label: '用户管理',
    },
    {
      key: '/roles',
      icon: <LockOutlined />,
      label: '角色管理',
    },
    {
      key: '/permissions',
      icon: <SettingOutlined />,
      label: '权限管理',
    },
    {
      key: '/skills',
      icon: <AppstoreAddOutlined />,
      label: '技能管理',
    },
  ];

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人资料',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '设置',
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: logout,
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        theme="dark"
        breakpoint="lg"
        collapsedWidth="80"
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
        }}
      >
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: 18,
            fontWeight: 'bold',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          OpenClaw
        </div>

        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>

      <Layout style={{ marginLeft: 200 }}>
        <Header
          style={{
            padding: '0 24px',
            background: '#fff',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: '0 1px 4px rgba(0,21,41,0.08)',
          }}
        >
          <div style={{ fontSize: 16, fontWeight: 500 }}>
            {menuItems.find((item) => item.key === location.pathname)?.label}
          </div>

          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <Space style={{ cursor: 'pointer' }}>
              <Badge dot={isSuperAdmin} offset={[-5, 5]}>
                <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#1890ff' }} />
              </Badge>
              <span style={{ fontWeight: 500 }}>
                {user?.username}
                {isSuperAdmin && (
                  <Badge
                    count={<CrownOutlined />}
                    style={{
                      backgroundColor: '#faad14',
                      marginLeft: 8,
                      padding: '0 6px',
                      borderRadius: 4,
                    }}
                  />
                )}
              </span>
            </Space>
          </Dropdown>
        </Header>

        <Content style={{ margin: '24px', background: '#f0f2f5', minHeight: 'calc(100vh - 64px)' }}>
          <div
            style={{
              padding: 24,
              minHeight: '100%',
              background: '#fff',
              borderRadius: 8,
              boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
            }}
          >
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
