"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const uuid_1 = require("uuid");
const database_1 = __importDefault(require("../database/database"));
class UsersService {
    async list(filters) {
        let query = 'SELECT id, username, email, status, is_superuser, created_at, updated_at FROM users WHERE 1=1';
        const params = [];
        if (filters?.status) {
            query += ' AND status = ?';
            params.push(filters.status);
        }
        if (filters?.search) {
            query += ' AND (username LIKE ? OR email LIKE ?)';
            const searchTerm = `%${filters.search}%`;
            params.push(searchTerm, searchTerm);
        }
        query += ' ORDER BY created_at DESC';
        const [users] = await database_1.default.execute(query, params);
        return users;
    }
    async getById(userId) {
        const [users] = await database_1.default.execute('SELECT id, username, email, status, is_superuser, created_at, updated_at FROM users WHERE id = ?', [userId]);
        return users.length > 0 ? users[0] : null;
    }
    async getByEmail(email) {
        const [users] = await database_1.default.execute('SELECT id, username, email, status, is_superuser, created_at, updated_at FROM users WHERE email = ?', [email]);
        return users.length > 0 ? users[0] : null;
    }
    async create(input) {
        const { username, email, password, status = 'active', is_superuser = false } = input;
        // 检查是否已存在
        const [existingUsers] = await database_1.default.execute('SELECT id FROM users WHERE email = ? OR username = ?', [email, username]);
        if (existingUsers.length > 0) {
            throw new Error('用户名或邮箱已存在');
        }
        // 密码加密
        const passwordHash = await bcryptjs_1.default.hash(password, 10);
        // 创建用户
        const userId = (0, uuid_1.v4)();
        const now = new Date();
        await database_1.default.execute('INSERT INTO users (id, username, email, password_hash, status, is_superuser, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [userId, username, email, passwordHash, status, is_superuser ? 1 : 0, now, now]);
        return this.getById(userId);
    }
    async update(userId, input) {
        const updates = [];
        const values = [];
        if (input.username !== undefined) {
            // 检查用户名是否被占用
            const [existingUsers] = await database_1.default.execute('SELECT id FROM users WHERE username = ? AND id != ?', [input.username, userId]);
            if (existingUsers.length > 0) {
                throw new Error('用户名已被占用');
            }
            updates.push('username = ?');
            values.push(input.username);
        }
        if (input.email !== undefined) {
            // 检查邮箱是否被占用
            const [existingUsers] = await database_1.default.execute('SELECT id FROM users WHERE email = ? AND id != ?', [input.email, userId]);
            if (existingUsers.length > 0) {
                throw new Error('邮箱已被占用');
            }
            updates.push('email = ?');
            values.push(input.email);
        }
        if (input.status !== undefined) {
            updates.push('status = ?');
            values.push(input.status);
        }
        if (input.is_superuser !== undefined) {
            updates.push('is_superuser = ?');
            values.push(input.is_superuser ? 1 : 0);
        }
        if (updates.length > 0) {
            updates.push('updated_at = ?');
            values.push(new Date());
            values.push(userId);
            await database_1.default.execute(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, values);
        }
        return this.getById(userId);
    }
    async delete(userId) {
        await database_1.default.execute('DELETE FROM users WHERE id = ?', [userId]);
    }
    async resetPassword(userId, newPassword) {
        const passwordHash = await bcryptjs_1.default.hash(newPassword, 10);
        await database_1.default.execute('UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?', [passwordHash, new Date(), userId]);
    }
    async getUserWorkspaces(userId) {
        const [workspaces] = await database_1.default.execute(`SELECT w.id, w.name, w.description, w.owner_id, w.created_at,
              wm.role_id, r.name as role_name,
              CASE WHEN w.owner_id = ? THEN true ELSE false END as is_owner
       FROM workspaces w
       LEFT JOIN workspace_members wm ON w.id = wm.workspace_id AND wm.user_id = ?
       LEFT JOIN roles r ON wm.role_id = r.id
       WHERE w.owner_id = ? OR wm.user_id = ?
       ORDER BY w.created_at DESC`, [userId, userId, userId, userId]);
        return workspaces;
    }
    async getUserStats() {
        const [stats] = await database_1.default.execute(`SELECT
         COUNT(*) as total,
         SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
         SUM(CASE WHEN status = 'disabled' THEN 1 ELSE 0 END) as disabled,
         SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
         SUM(CASE WHEN is_superuser = 1 THEN 1 ELSE 0 END) as superadmins
       FROM users`);
        return stats[0];
    }
}
exports.UsersService = UsersService;
exports.default = new UsersService();
