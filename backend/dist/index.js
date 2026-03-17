"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const database_1 = require("./database/database");
const auth_service_1 = __importDefault(require("./auth/auth.service"));
// 导入路由
const auth_1 = __importDefault(require("./auth"));
const workspaces_controller_1 = __importDefault(require("./workspaces/workspaces.controller"));
const users_controller_1 = __importDefault(require("./users/users.controller"));
const roles_controller_1 = __importDefault(require("./roles/roles.controller"));
const permissions_controller_1 = __importDefault(require("./permissions/permissions.controller"));
const skills_routes_1 = __importDefault(require("./skills/skills.routes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
// 中间件
app.use((0, cors_1.default)({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// 请求日志
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});
// API 路由
app.use('/api/auth', auth_1.default);
app.use('/api/workspaces', workspaces_controller_1.default);
app.use('/api/users', users_controller_1.default);
app.use('/api/roles', roles_controller_1.default);
app.use('/api/permissions', permissions_controller_1.default);
app.use('/api', skills_routes_1.default);
// 初始化超级管理员
app.post('/api/init-superadmin', async (req, res) => {
    try {
        const { user, token } = await auth_service_1.default.initSuperAdmin();
        res.json({
            success: true,
            message: '超级管理员已初始化',
            user,
            token,
        });
    }
    catch (error) {
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
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        error: err.message || 'Internal server error',
    });
});
// 启动服务器
async function startServer() {
    try {
        // 测试数据库连接
        await (0, database_1.testConnection)();
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
    }
    catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}
startServer();
