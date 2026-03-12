import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool, { testConnection } from './database/database';
import authService from './auth/auth.service';

// 导入路由
import authRoutes from './auth';
import workspaceRoutes from './workspaces/workspaces.controller';
import usersRoutes from './users/users.controller';
import rolesRoutes from './roles/roles.controller';
import permissionsRoutes from './permissions/permissions.controller';
import skillsRoutes from './skills/skills.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 请求日志
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// API 路由
app.use('/api/auth', authRoutes);
app.use('/api/workspaces', workspaceRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/roles', rolesRoutes);
app.use('/api/permissions', permissionsRoutes);
app.use('/api', skillsRoutes);

// 初始化超级管理员
app.post('/api/init-superadmin', async (req, res) => {
  try {
    const { user, token } = await authService.initSuperAdmin();

    res.json({
      success: true,
      message: '超级管理员已初始化',
      user,
      token,
    });
  } catch (error: any) {
    console.error('初始化超级管理员失败:', error);
    res.status(500).json({ error: error.message || '初始化失败' });
  }
});

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API 健康检查（兼容外网访问）
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 处理
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// 错误处理
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});

// 启动服务器
async function startServer() {
  try {
    // 测试数据库连接
    await testConnection();

    // 启动 Express 服务器
    const port = Number(PORT);
    app.listen(port, '0.0.0.0', () => {
      console.log('🚀 OpenClaw Permissions Server');
      console.log(`📡 Server running on http://0.0.0.0:${port}`);
      console.log(`🏥 Health check: http://localhost:${port}/health`);
      console.log(`📚 API docs:`);
      console.log(`   - Auth: http://localhost:${port}/api/auth`);
      console.log(`   - Workspaces: http://localhost:${port}/api/workspaces`);
      console.log(`   - Users: http://localhost:${port}/api/users`);
      console.log(`   - Roles: http://localhost:${port}/api/roles`);
      console.log(`   - Permissions: http://localhost:${port}/api/permissions`);
      console.log(`   - Skills: http://localhost:${port}/api/skills`);
      console.log(``);
      console.log(`👑 超级管理员初始化:`);
      console.log(`   POST http://localhost:${port}/api/init-superadmin`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
