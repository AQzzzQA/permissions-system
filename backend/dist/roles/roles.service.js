"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RolesService = void 0;
const uuid_1 = require("uuid");
const database_1 = __importDefault(require("../database/database"));
const roles_model_1 = require("./roles.model");
class RolesService {
    async list() {
        const [roles] = await database_1.default.execute('SELECT id, name, description, scopes, created_at FROM roles ORDER BY created_at ASC');
        return roles.map((r) => ({
            ...r,
            scopes: r.scopes ? JSON.parse(r.scopes) : []
        }));
    }
    async getById(roleId) {
        const [roles] = await database_1.default.execute('SELECT id, name, description, scopes, created_at FROM roles WHERE id = ?', [roleId]);
        if (roles.length === 0) {
            return null;
        }
        const role = roles[0];
        role.scopes = role.scopes ? JSON.parse(role.scopes) : [];
        return role;
    }
    async create(input) {
        const { name, description, scopes } = input;
        // 检查角色名是否已存在
        const [existingRoles] = await database_1.default.execute('SELECT id FROM roles WHERE name = ?', [name]);
        if (existingRoles.length > 0) {
            throw new Error('角色名已存在');
        }
        // 验证权限作用域
        const invalidScopes = scopes.filter(s => !roles_model_1.AVAILABLE_SCOPES.includes(s));
        if (invalidScopes.length > 0) {
            throw new Error(`无效的权限作用域: ${invalidScopes.join(', ')}`);
        }
        // 创建角色
        const roleId = (0, uuid_1.v4)();
        const now = new Date();
        await database_1.default.execute('INSERT INTO roles (id, name, description, scopes, created_at) VALUES (?, ?, ?, ?, ?)', [roleId, name, description || null, JSON.stringify(scopes), now]);
        return this.getById(roleId);
    }
    async update(roleId, input) {
        const updates = [];
        const values = [];
        if (input.name !== undefined) {
            // 检查角色名是否被占用
            const [existingRoles] = await database_1.default.execute('SELECT id FROM roles WHERE name = ? AND id != ?', [input.name, roleId]);
            if (existingRoles.length > 0) {
                throw new Error('角色名已被占用');
            }
            updates.push('name = ?');
            values.push(input.name);
        }
        if (input.description !== undefined) {
            updates.push('description = ?');
            values.push(input.description);
        }
        if (input.scopes !== undefined) {
            // 验证权限作用域
            const invalidScopes = input.scopes.filter(s => !roles_model_1.AVAILABLE_SCOPES.includes(s));
            if (invalidScopes.length > 0) {
                throw new Error(`无效的权限作用域: ${invalidScopes.join(', ')}`);
            }
            updates.push('scopes = ?');
            values.push(JSON.stringify(input.scopes));
        }
        if (updates.length > 0) {
            values.push(roleId);
            await database_1.default.execute(`UPDATE roles SET ${updates.join(', ')} WHERE id = ?`, values);
        }
        return this.getById(roleId);
    }
    async delete(roleId) {
        // 检查是否有用户使用此角色
        const [members] = await database_1.default.execute('SELECT COUNT(*) as count FROM workspace_members WHERE role_id = ?', [roleId]);
        if (members[0].count > 0) {
            throw new Error('该角色正在被使用，无法删除');
        }
        await database_1.default.execute('DELETE FROM roles WHERE id = ?', [roleId]);
    }
    async getAvailableScopes() {
        return roles_model_1.AVAILABLE_SCOPES;
    }
    async getUsersByRole(roleId) {
        const [users] = await database_1.default.execute(`SELECT DISTINCT u.id, u.username, u.email, u.status, u.created_at
       FROM users u
       JOIN workspace_members wm ON u.id = wm.user_id
       WHERE wm.role_id = ?
       ORDER BY u.created_at DESC`, [roleId]);
        return users;
    }
    async getRoleUsageStats(roleId) {
        const [workspaceCount] = await database_1.default.execute('SELECT COUNT(DISTINCT workspace_id) as count FROM workspace_members WHERE role_id = ?', [roleId]);
        const [userCount] = await database_1.default.execute('SELECT COUNT(DISTINCT user_id) as count FROM workspace_members WHERE role_id = ?', [roleId]);
        return {
            workspaceCount: workspaceCount[0].count,
            userCount: userCount[0].count,
        };
    }
}
exports.RolesService = RolesService;
exports.default = new RolesService();
