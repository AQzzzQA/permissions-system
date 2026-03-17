"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const uuid_1 = require("uuid");
const database_1 = __importDefault(require("../database/database"));
// 超级管理员配置
const SUPERADMIN_EMAIL = process.env.SUPERADMIN_EMAIL || 'admin@openclaw.ai';
const SUPERADMIN_PASSWORD = process.env.SUPERADMIN_PASSWORD || 'SuperAdmin123!';
class AuthService {
    async register(input) {
        const { username, email, password } = input;
        // 检查邮箱是否已存在
        const [existingUsers] = await database_1.default.execute('SELECT id FROM users WHERE email = ? OR username = ?', [email, username]);
        if (existingUsers.length > 0) {
            throw new Error('用户名或邮箱已存在');
        }
        // 密码加密
        const passwordHash = await bcryptjs_1.default.hash(password, 10);
        // 创建用户
        const userId = (0, uuid_1.v4)();
        const now = new Date();
        await database_1.default.execute('INSERT INTO users (id, username, email, password_hash, status, is_superuser, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [userId, username, email, passwordHash, 'active', false, now, now]);
        // 获取创建的用户
        const [users] = await database_1.default.execute('SELECT id, username, email, status, is_superuser, created_at, updated_at FROM users WHERE id = ?', [userId]);
        const user = users[0];
        // 生成 JWT token
        const token = this.generateToken(user.id, user.is_superuser);
        return { user, token };
    }
    async login(input) {
        const { email, password } = input;
        // 查找用户
        const [users] = await database_1.default.execute('SELECT id, username, email, password_hash, status, is_superuser, created_at, updated_at FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            throw new Error('用户不存在');
        }
        const user = users[0];
        // 验证密码
        const isValidPassword = await bcryptjs_1.default.compare(password, user.password_hash);
        if (!isValidPassword) {
            throw new Error('密码错误');
        }
        // 检查用户状态
        if (user.status !== 'active') {
            throw new Error('用户已被禁用');
        }
        // 生成 JWT token
        const token = this.generateToken(user.id, user.is_superuser);
        // 返回用户信息（不含密码）
        const { password_hash, ...userWithoutPassword } = user;
        return { user: userWithoutPassword, token };
    }
    async getUserById(userId) {
        const [users] = await database_1.default.execute('SELECT id, username, email, status, is_superuser, created_at, updated_at FROM users WHERE id = ?', [userId]);
        return users.length > 0 ? users[0] : null;
    }
    // 初始化超级管理员
    async initSuperAdmin() {
        const [existingUsers] = await database_1.default.execute('SELECT id FROM users WHERE email = ?', [SUPERADMIN_EMAIL]);
        if (existingUsers.length > 0) {
            // 超级管理员已存在，直接登录
            return this.login({
                email: SUPERADMIN_EMAIL,
                password: SUPERADMIN_PASSWORD,
            });
        }
        // 创建超级管理员
        const passwordHash = await bcryptjs_1.default.hash(SUPERADMIN_PASSWORD, 10);
        const userId = (0, uuid_1.v4)();
        const now = new Date();
        await database_1.default.execute('INSERT INTO users (id, username, email, password_hash, status, is_superuser, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [userId, 'SuperAdmin', SUPERADMIN_EMAIL, passwordHash, 'active', true, now, now]);
        const user = await this.getUserById(userId);
        const token = this.generateToken(userId, true);
        console.log('✅ 超级管理员已创建');
        console.log(`📧 邮箱: ${SUPERADMIN_EMAIL}`);
        console.log(`🔑 密码: ${SUPERADMIN_PASSWORD}`);
        console.log('⚠️  请在生产环境中修改默认密码！');
        return { user, token };
    }
    // 检查是否是超级管理员
    async isSuperAdmin(userId) {
        const [users] = await database_1.default.execute('SELECT is_superuser FROM users WHERE id = ?', [userId]);
        return users.length > 0 && users[0].is_superuser === true;
    }
    generateToken(userId, isSuperAdmin = false) {
        const secret = process.env.JWT_SECRET || 'your-secret-key';
        const expiresIn = process.env.JWT_EXPIRES_IN || '24h';
        return jsonwebtoken_1.default.sign({ userId, isSuperAdmin }, secret, { expiresIn });
    }
    verifyToken(token) {
        const secret = process.env.JWT_SECRET || 'your-secret-key';
        try {
            const decoded = jsonwebtoken_1.default.verify(token, secret);
            return {
                userId: decoded.userId,
                isSuperAdmin: decoded.isSuperAdmin || false,
            };
        }
        catch (error) {
            throw new Error('无效的 token');
        }
    }
    async changePassword(userId, oldPassword, newPassword) {
        // 获取用户当前密码
        const [users] = await database_1.default.execute('SELECT password_hash, is_superuser FROM users WHERE id = ?', [userId]);
        if (users.length === 0) {
            throw new Error('用户不存在');
        }
        const user = users[0];
        // 验证旧密码
        const isValidPassword = await bcryptjs_1.default.compare(oldPassword, user.password_hash);
        if (!isValidPassword) {
            throw new Error('旧密码错误');
        }
        // 更新密码
        const passwordHash = await bcryptjs_1.default.hash(newPassword, 10);
        await database_1.default.execute('UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?', [passwordHash, new Date(), userId]);
    }
    // 超级管理员可以修改任何人的密码
    async resetPasswordByAdmin(adminUserId, targetUserId, newPassword) {
        // 检查操作者是否是超级管理员
        const isSuperAdmin = await this.isSuperAdmin(adminUserId);
        if (!isSuperAdmin) {
            throw new Error('需要超级管理员权限');
        }
        // 更新目标用户密码
        const passwordHash = await bcryptjs_1.default.hash(newPassword, 10);
        await database_1.default.execute('UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?', [passwordHash, new Date(), targetUserId]);
    }
}
exports.AuthService = AuthService;
exports.default = new AuthService();
