"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkspaceService = void 0;
const uuid_1 = require("uuid");
const database_1 = __importDefault(require("../database/database"));
class WorkspaceService {
    async create(userId, input) {
        const workspaceId = (0, uuid_1.v4)();
        const now = new Date();
        await database_1.default.execute('INSERT INTO workspaces (id, name, owner_id, description, config, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)', [workspaceId, input.name, userId, input.description || null, JSON.stringify(input.config || {}), now, now]);
        // 自动将所有者添加为 Workspace Owner 角色
        await this.addMember(workspaceId, userId, 'role-owner');
        return this.getById(workspaceId);
    }
    async getById(workspaceId) {
        const [workspaces] = await database_1.default.execute('SELECT * FROM workspaces WHERE id = ?', [workspaceId]);
        if (workspaces.length === 0) {
            throw new Error('工作空间不存在');
        }
        const workspace = workspaces[0];
        workspace.config = workspace.config ? JSON.parse(workspace.config) : {};
        return workspace;
    }
    async listByUser(userId) {
        const [workspaces] = await database_1.default.execute(`SELECT DISTINCT w.* FROM workspaces w
       LEFT JOIN workspace_members wm ON w.id = wm.workspace_id
       WHERE w.owner_id = ? OR wm.user_id = ?
       ORDER BY w.created_at DESC`, [userId, userId]);
        return workspaces.map((w) => ({
            ...w,
            config: w.config ? JSON.parse(w.config) : {}
        }));
    }
    async update(userId, workspaceId, input) {
        // 检查权限（只有所有者可以修改）
        const workspace = await this.getById(workspaceId);
        if (workspace.owner_id !== userId) {
            throw new Error('没有权限修改此工作空间');
        }
        const updates = [];
        const values = [];
        if (input.name !== undefined) {
            updates.push('name = ?');
            values.push(input.name);
        }
        if (input.description !== undefined) {
            updates.push('description = ?');
            values.push(input.description);
        }
        if (input.config !== undefined) {
            updates.push('config = ?');
            values.push(JSON.stringify(input.config));
        }
        if (updates.length > 0) {
            updates.push('updated_at = ?');
            values.push(new Date());
            values.push(workspaceId);
            await database_1.default.execute(`UPDATE workspaces SET ${updates.join(', ')} WHERE id = ?`, values);
        }
        return this.getById(workspaceId);
    }
    async delete(userId, workspaceId) {
        // 检查权限（只有所有者可以删除）
        const workspace = await this.getById(workspaceId);
        if (workspace.owner_id !== userId) {
            throw new Error('没有权限删除此工作空间');
        }
        await database_1.default.execute('DELETE FROM workspaces WHERE id = ?', [workspaceId]);
    }
    async addMember(workspaceId, userId, roleId = 'role-member') {
        const memberId = (0, uuid_1.v4)();
        const now = new Date();
        try {
            await database_1.default.execute('INSERT INTO workspace_members (id, workspace_id, user_id, role_id, joined_at) VALUES (?, ?, ?, ?, ?)', [memberId, workspaceId, userId, roleId, now]);
        }
        catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                throw new Error('用户已是工作空间成员');
            }
            throw error;
        }
    }
    async removeMember(workspaceId, userId) {
        await database_1.default.execute('DELETE FROM workspace_members WHERE workspace_id = ? AND user_id = ?', [workspaceId, userId]);
    }
    async updateMemberRole(workspaceId, userId, roleId) {
        await database_1.default.execute('UPDATE workspace_members SET role_id = ? WHERE workspace_id = ? AND user_id = ?', [roleId, workspaceId, userId]);
    }
    async getMembers(workspaceId) {
        const [members] = await database_1.default.execute(`SELECT wm.id as member_id, wm.role_id, wm.joined_at,
              u.id as user_id, u.username, u.email,
              r.name as role_name, r.description as role_description, r.scopes
       FROM workspace_members wm
       JOIN users u ON wm.user_id = u.id
       JOIN roles r ON wm.role_id = r.id
       WHERE wm.workspace_id = ?
       ORDER BY wm.joined_at ASC`, [workspaceId]);
        return members.map((m) => ({
            ...m,
            scopes: m.scopes ? JSON.parse(m.scopes) : []
        }));
    }
    async getUserRole(userId, workspaceId) {
        const [members] = await database_1.default.execute(`SELECT wm.*, r.name as role_name, r.scopes
       FROM workspace_members wm
       JOIN roles r ON wm.role_id = r.id
       WHERE wm.workspace_id = ? AND wm.user_id = ?`, [workspaceId, userId]);
        if (members.length === 0) {
            return null;
        }
        const member = members[0];
        member.scopes = member.scopes ? JSON.parse(member.scopes) : [];
        return member;
    }
    async checkPermission(userId, workspaceId, requiredScope) {
        // 检查是否是所有者
        const workspace = await this.getById(workspaceId).catch(() => null);
        if (workspace && workspace.owner_id === userId) {
            return true; // 所有者拥有所有权限
        }
        // 检查角色权限
        const member = await this.getUserRole(userId, workspaceId);
        if (!member) {
            return false;
        }
        return member.scopes.includes(requiredScope);
    }
}
exports.WorkspaceService = WorkspaceService;
exports.default = new WorkspaceService();
