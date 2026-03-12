import { useEffect, useState } from 'react';
import {
  Row,
  Col,
  Card,
  Statistic,
  Table,
  Tag,
  Space,
  Button,
  Typography,
} from 'antd';
import {
  UserOutlined,
  TeamOutlined,
  LockOutlined,
  CheckCircleOutlined,
  RightOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { usersAPI, workspacesAPI, rolesAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const { Title } = Typography;

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { isSuperAdmin } = useAuth();

  const [stats, setStats] = useState({
    users: { total: 0, active: 0, disabled: 0, pending: 0 },
    workspaces: { total: 0 },
    roles: { total: 0 },
  });

  const [recentUsers, setRecentUsers] = useState<any[]>([]);

  useEffect(() => {
    fetchStats();
    fetchRecentUsers();
  }, []);

  const fetchStats = async () => {
    try {
      const [userStats, workspaceData, roleData] = await Promise.all([
        usersAPI.stats(),
        workspacesAPI.list({ limit: 1 }),
        rolesAPI.list(),
      ]);

      setStats({
        users: userStats.stats,
        workspaces: { total: workspaceData.total || 0 },
        roles: { total: roleData.roles?.length || 0 },
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const fetchRecentUsers = async () => {
    try {
      const response = await usersAPI.list({ limit: 5 });
      setRecentUsers(response.users || []);
    } catch (error) {
      console.error('Failed to fetch recent users:', error);
    }
  };

  const userColumns = [
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const colorMap: any = {
          active: 'green',
          disabled: 'red',
          pending: 'orange',
        };
        const labelMap: any = {
          active: '活跃',
          disabled: '禁用',
          pending: '待审核',
        };
        return <Tag color={colorMap[status]}>{labelMap[status]}</Tag>;
      },
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => new Date(date).toLocaleDateString('zh-CN'),
    },
  ];

  return (
    <div>
      <Title level={3}>控制台</Title>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="总用户数"
              value={stats.users.total}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="活跃用户"
              value={stats.users.active}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="工作空间"
              value={stats.workspaces.total}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="角色数"
              value={stats.roles.total}
              prefix={<LockOutlined />}
              valueStyle={{ color: '#eb2f96' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={24}>
          <Card
            title="最新用户"
            extra={
              <Button type="link" onClick={() => navigate('/users')}>
                查看全部 <RightOutlined />
              </Button>
            }
          >
            <Table
              columns={userColumns}
              dataSource={recentUsers}
              rowKey="id"
              pagination={false}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
