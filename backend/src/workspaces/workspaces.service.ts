import { v4 as uuidv4 } from 'uuid';
import pool from '../database/database';

export interface CreateWorkspaceInput {
  name: string;
  description?: string;
  config?: Record<string, any>;
}

export interface UpdateWorkspaceInput {
  name?: string;
  description?: string;
  config?: Record<string, any>;
}

export interface Workspace {
  id: string;
  name: string;
  owner_id: string;
  description: string | null;
  config: any;
  created_at: Date;
  updated_at: Date;
}

export class WorkspaceService {
  async create(userId: string, input: CreateWorkspaceInput): Promise<Workspace> {
    const workspaceId = uuidv4();
    const now = new Date();

    await pool.execute(
      'INSERT INTO workspaces (id, name, owner_id, description, config, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [workspaceId, input.name, userId, input.description || null, JSON.stringify(input.config || {}), now, now]
    );

    // 自动将所有者添加为 Workspace Owner 角色
    await this.addMember(workspaceId, userId, 'role-owner');

    return this.getById(workspaceId);
  }

  async getById(workspaceId: string): Promise<Workspace> {
    const [workspaces] = await pool.execute(
      'SELECT * FROM workspaces WHERE id = ?',
      [workspaceId]
    ) as any;

    if (workspaces.length === 0) {
      throw new Error('工作空间不存在');
    }

    const workspace = workspaces[0];
    workspace.config = workspace.config ? JSON.parse(workspace.config) : {};

    return workspace;
  }

  async listByUser(userId: string): Promise<Workspace[]> {
    const [workspaces] = await pool.execute(
      `SELECT DISTINCT w.* FROM workspaces w
       LEFT JOIN workspace_members wm ON w.id = wm.workspace_id
       WHERE w.owner_id = ? OR wm.user_id = ?
       ORDER BY w.created_at DESC`,
      [userId, userId]
    ) as any;

    return workspaces.map((w: any) => ({
      ...w,
      config: w.config ? JSON.parse(w.config) : {}
    }));
  }

  async update(userId: string, workspaceId: string, input: UpdateWorkspaceInput): Promise<Workspace> {
    // 检查权限（只有所有者可以修改）
    const workspace = await this.getById(workspaceId);

    if (workspace.owner_id !== userId) {
      throw new Error('没有权限修改此工作空间');
    }

    const updates: string[] = [];
    const values: any[] = [];

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

      await pool.execute(
        `UPDATE workspaces SET ${updates.join(', ')} WHERE id = ?`,
        values
      );
    }

    return this.getById(workspaceId);
  }

  async delete(userId: string, workspaceId: string): Promise<void> {
    // 检查权限（只有所有者可以删除）
    const workspace = await this.getById(workspaceId);

    if (workspace.owner_id !== userId) {
      throw new Error('没有权限删除此工作空间');
    }

    await pool.execute('DELETE FROM workspaces WHERE id = ?', [workspaceId]);
  }

  async addMember(workspaceId: string, userId: string, roleId: string = 'role-member'): Promise<void> {
    const memberId = uuidv4();
    const now = new Date();

    try {
      await pool.execute(
        'INSERT INTO workspace_members (id, workspace_id, user_id, role_id, joined_at) VALUES (?, ?, ?, ?, ?)',
        [memberId, workspaceId, userId, roleId, now]
      );
    } catch (error: any) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new Error('用户已是工作空间成员');
      }
      throw error;
    }
  }

  async removeMember(workspaceId: string, userId: string): Promise<void> {
    await pool.execute(
      'DELETE FROM workspace_members WHERE workspace_id = ? AND user_id = ?',
      [workspaceId, userId]
    );
  }

  async updateMemberRole(workspaceId: string, userId: string, roleId: string): Promise<void> {
    await pool.execute(
      'UPDATE workspace_members SET role_id = ? WHERE workspace_id = ? AND user_id = ?',
      [roleId, workspaceId, userId]
    );
  }

  async getMembers(workspaceId: string) {
    const [members] = await pool.execute(
      `SELECT wm.id as member_id, wm.role_id, wm.joined_at,
              u.id as user_id, u.username, u.email,
              r.name as role_name, r.description as role_description, r.scopes
       FROM workspace_members wm
       JOIN users u ON wm.user_id = u.id
       JOIN roles r ON wm.role_id = r.id
       WHERE wm.workspace_id = ?
       ORDER BY wm.joined_at ASC`,
      [workspaceId]
    ) as any;

    return members.map((m: any) => ({
      ...m,
      scopes: m.scopes ? JSON.parse(m.scopes) : []
    }));
  }

  async getUserRole(userId: string, workspaceId: string) {
    const [members] = await pool.execute(
      `SELECT wm.*, r.name as role_name, r.scopes
       FROM workspace_members wm
       JOIN roles r ON wm.role_id = r.id
       WHERE wm.workspace_id = ? AND wm.user_id = ?`,
      [workspaceId, userId]
    ) as any;

    if (members.length === 0) {
      return null;
    }

    const member = members[0];
    member.scopes = member.scopes ? JSON.parse(member.scopes) : [];

    return member;
  }

  async checkPermission(userId: string, workspaceId: string, requiredScope: string): Promise<boolean> {
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

export default new WorkspaceService();
