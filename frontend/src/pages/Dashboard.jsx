import { Card, Row, Col, Statistic } from 'antd'
import {
  UserOutlined,
  TeamOutlined,
  KeyOutlined,
  MenuOutlined
} from '@ant-design/icons'

const Dashboard = () => {
  return (
    <div style={{ padding: '24px' }}>
      <h2>首页</h2>
      <Row gutter={16} style={{ marginTop: '24px' }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="用户总数"
              value={1128}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="角色总数"
              value={93}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="权限总数"
              value={156}
              prefix={<KeyOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="菜单总数"
              value={32}
              prefix={<MenuOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Card
        title="欢迎使用 OpenClaw 权限管理系统"
        style={{ marginTop: '24px' }}
      >
        <p>这是一个完整的RBAC权限管理解决方案，提供以下功能：</p>
        <ul>
          <li>用户管理：创建、编辑、删除用户</li>
          <li>角色管理：管理角色和权限</li>
          <li>权限管理：管理系统权限</li>
          <li>菜单管理：管理系统菜单</li>
        </ul>
      </Card>
    </div>
  )
}

export default Dashboard
