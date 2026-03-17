"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PermissionsService = void 0;
const uuid_1 = require("uuid");
const database_1 = __importDefault(require("../database/database"));
class PermissionsService {
    async list(filters) {
        let query = 'SELECT id, resource_type, resource_id, user_id, role_id, actions, created_at FROM permissions WHERE 1=1';
        const params = [];
        if (filters?.resource_type) {
            query += ' AND resource_type = ?';
            params.push(filters.resource_type);
        }
        if (filters?.resource_id) {
            query += ' AND resource_id = ?';
            params.push(filters.resource_id);
        }
        if (filters?.user_id) {
            query += ' AND user_id = ?';
            params.push(filters.user_id);
        }
        if (filters?.role_id) {
            query += ' AND role_id = ?';
            params.push(filters.role_id);
        }
        query += ' ORDER BY created_at DESC';
        const [permissions] = await database_1.default.execute(query, params);
        return permissions.map((p) => ({
            ...p,
            actions: p.actions ? JSON.parse(p.actions) : []
        }));
    }
    async getById(permissionId) {
        const [permissions] = await database_1.default.execute('SELECT id, resource_type, resource_id, user_id, role_id, actions, created_at FROM permissions WHERE id = ?', [permissionId]);
        if (permissions.length === 0) {
            return null;
        }
        const permission = permissions[0];
        permission.actions = permission.actions ? JSON.parse(permission.actions) : [];
        return permission;
    }
    async create(input) {
        const { resource_type, resource_id, user_id, role_id, actions } = input;
        // 验证：要么指定 user_id，要么指定 role_id，不能同时为空
        if (!user_id && !role_id) {
            throw new Error('必须指定 user_id 或 role_id');
        }
        if (user_id && role_id) {
            throw new Error('不能同时指定 user_id 和 role_id');
        }
        // 创建权限
        const permissionId = (0, uuid_1.v4)();
        const now = new Date();
        await database_1.default.execute('INSERT INTO permissions (id, resource_type, resource_id, user_id, role_id, actions, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)', [permissionId, resource_type, resource_id || null, user_id || null, role_id || null, JSON.stringify(actions), now]);
        return this.getById(permissionId);
    }
    async update(permissionId, input) {
        if (input.actions !== undefined) {
            await database_1.default.execute('UPDATE permissions SET actions = ? WHERE id = ?', [JSON.stringify(input.actions), permissionId]);
        }
        return this.getById(permissionId);
    }
    async delete(permissionId) {
        await database_1.default.execute('DELETE FROM permissions WHERE id = ?', [permissionId]);
    }
    async checkPermission(userId, workspaceId, input) {
        const { resource_type, resource_id, required_actions } = input;
        // 1. 检查用户的直接权限（针对特定资源）
        const [userPermissions] = await database_1.default.execute(`SELECT actions FROM permissions
       WHERE user_id = ?
         AND resource_type = ?
         AND (resource_id = ? OR resource_id IS NULL)`, [userId, resource_type, resource_id || null]);
        for (const permission of userPermissions) {
            const actions = permission.actions ? JSON.parse(permission.actions) : [];
            const hasAllActions = required_actions.every(action => actions.includes(action));
            if (hasAllActions) {
                return true;
            }
        }
        // 2. 检查角色权限
        // 获取用户在工作空间中的角色
        const [members] = await database_1.default.execute(`SELECT role_id FROM workspace_members WHERE user_id = ? AND workspace_id = ?`, [userId, workspaceId]);
        if (members.length > 0) {
            const roleId = members[0].role_id;
            // 检查角色的权限
            const [rolePermissions] = await database_1.default.execute(`SELECT actions FROM permissions
         WHERE role_id = ?
           AND resource_type = ?
           AND (resource_id = ? OR resource_id IS NULL)`, [roleId, resource_type, resource_id || null]);
            for (const permission of rolePermissions) {
                const actions = permission.actions ? JSON.parse(permission.actions) : [];
                const hasAllActions = required_actions.every(action => actions.includes(action));
                if (hasAllActions) {
                    return true;
                }
            }
        }
        return false;
    }
    async getUserPermissions(userId) {
        const [permissions] = await database_1.default.execute('SELECT id, resource_type, resource_id, user_id, role_id, actions, created_at FROM permissions WHERE user_id = ? ORDER BY created_at DESC', [userId]);
        return permissions.map((p) => ({
            ...p,
            actions: p.actions ? JSON.parse(p.actions) : []
        }));
    }
    async getRolePermissions(roleId) {
        const [permissions] = await database_1.default.execute('SELECT id, resource_type, resource_id, user_id, role_id, actions, created_at FROM permissions WHERE role_id = ? ORDER BY created_at DESC', [roleId]);
        return permissions.map((p) => ({
            ...p,
            actions: p.actions ? JSON.parse(p.actions) : []
        }));
    }
    async getWorkspacePermissions(workspaceId) {
        const [permissions] = await database_1.default.execute('SELECT id, resource_type, resource_id, user_id, role_id, actions, created_at FROM permissions WHERE resource_type = ? AND resource_id = ? ORDER BY created_at DESC', ['workspace', workspaceId]);
        return permissions.map((p) => ({
            ...p,
            actions: p.actions ? JSON.parse(p.actions) : []
        }));
    }
}
exports.PermissionsService = PermissionsService;
exports.default = new PermissionsService();
