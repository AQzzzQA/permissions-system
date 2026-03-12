import { v4 as uuidv4 } from 'uuid';
import pool from '../database/database';
import { CreatePermissionInput, UpdatePermissionInput, Permission, CheckPermissionInput } from './permissions.model';

export class PermissionsService {
  async list(filters?: {
    resource_type?: string;
    resource_id?: string;
    user_id?: string;
    role_id?: string;
  }): Promise<Permission[]> {
    let query = 'SELECT id, resource_type, resource_id, user_id, role_id, actions, created_at FROM permissions WHERE 1=1';
    const params: any[] = [];

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

    const [permissions] = await pool.execute(query, params) as any;

    return permissions.map((p: any) => ({
      ...p,
      actions: p.actions ? JSON.parse(p.actions) : []
    }));
  }

  async getById(permissionId: string): Promise<Permission | null> {
    const [permissions] = await pool.execute(
      'SELECT id, resource_type, resource_id, user_id, role_id, actions, created_at FROM permissions WHERE id = ?',
      [permissionId]
    ) as any;

    if (permissions.length === 0) {
      return null;
    }

    const permission = permissions[0];
    permission.actions = permission.actions ? JSON.parse(permission.actions) : [];

    return permission;
  }

  async create(input: CreatePermissionInput): Promise<Permission> {
    const { resource_type, resource_id, user_id, role_id, actions } = input;

    // 验证：要么指定 user_id，要么指定 role_id，不能同时为空
    if (!user_id && !role_id) {
      throw new Error('必须指定 user_id 或 role_id');
    }

    if (user_id && role_id) {
      throw new Error('不能同时指定 user_id 和 role_id');
    }

    // 创建权限
    const permissionId = uuidv4();
    const now = new Date();

    await pool.execute(
      'INSERT INTO permissions (id, resource_type, resource_id, user_id, role_id, actions, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [permissionId, resource_type, resource_id || null, user_id || null, role_id || null, JSON.stringify(actions), now]
    );

    return this.getById(permissionId) as Promise<Permission>;
  }

  async update(permissionId: string, input: UpdatePermissionInput): Promise<Permission> {
    if (input.actions !== undefined) {
      await pool.execute(
        'UPDATE permissions SET actions = ? WHERE id = ?',
        [JSON.stringify(input.actions), permissionId]
      );
    }

    return this.getById(permissionId) as Promise<Permission>;
  }

  async delete(permissionId: string): Promise<void> {
    await pool.execute('DELETE FROM permissions WHERE id = ?', [permissionId]);
  }

  async checkPermission(userId: string, workspaceId: string, input: CheckPermissionInput): Promise<boolean> {
    const { resource_type, resource_id, required_actions } = input;

    // 1. 检查用户的直接权限（针对特定资源）
    const [userPermissions] = await pool.execute(
      `SELECT actions FROM permissions
       WHERE user_id = ?
         AND resource_type = ?
         AND (resource_id = ? OR resource_id IS NULL)`,
      [userId, resource_type, resource_id || null]
    ) as any;

    for (const permission of userPermissions) {
      const actions = permission.actions ? JSON.parse(permission.actions) : [];
      const hasAllActions = required_actions.every(action => actions.includes(action));

      if (hasAllActions) {
        return true;
      }
    }

    // 2. 检查角色权限
    // 获取用户在工作空间中的角色
    const [members] = await pool.execute(
      `SELECT role_id FROM workspace_members WHERE user_id = ? AND workspace_id = ?`,
      [userId, workspaceId]
    ) as any;

    if (members.length > 0) {
      const roleId = members[0].role_id;

      // 检查角色的权限
      const [rolePermissions] = await pool.execute(
        `SELECT actions FROM permissions
         WHERE role_id = ?
           AND resource_type = ?
           AND (resource_id = ? OR resource_id IS NULL)`,
        [roleId, resource_type, resource_id || null]
      ) as any;

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

  async getUserPermissions(userId: string): Promise<Permission[]> {
    const [permissions] = await pool.execute(
      'SELECT id, resource_type, resource_id, user_id, role_id, actions, created_at FROM permissions WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    ) as any;

    return permissions.map((p: any) => ({
      ...p,
      actions: p.actions ? JSON.parse(p.actions) : []
    }));
  }

  async getRolePermissions(roleId: string): Promise<Permission[]> {
    const [permissions] = await pool.execute(
      'SELECT id, resource_type, resource_id, user_id, role_id, actions, created_at FROM permissions WHERE role_id = ? ORDER BY created_at DESC',
      [roleId]
    ) as any;

    return permissions.map((p: any) => ({
      ...p,
      actions: p.actions ? JSON.parse(p.actions) : []
    }));
  }

  async getWorkspacePermissions(workspaceId: string): Promise<Permission[]> {
    const [permissions] = await pool.execute(
      'SELECT id, resource_type, resource_id, user_id, role_id, actions, created_at FROM permissions WHERE resource_type = ? AND resource_id = ? ORDER BY created_at DESC',
      ['workspace', workspaceId]
    ) as any;

    return permissions.map((p: any) => ({
      ...p,
      actions: p.actions ? JSON.parse(p.actions) : []
    }));
  }
}

export default new PermissionsService();
