import { v4 as uuidv4 } from 'uuid';
import pool from '../database/database';
import { CreateRoleInput, UpdateRoleInput, Role, AVAILABLE_SCOPES } from './roles.model';

export class RolesService {
  async list(): Promise<Role[]> {
    const [roles] = await pool.execute(
      'SELECT id, name, description, scopes, created_at FROM roles ORDER BY created_at ASC'
    ) as any;

    return roles.map((r: any) => ({
      ...r,
      scopes: r.scopes ? JSON.parse(r.scopes) : []
    }));
  }

  async getById(roleId: string): Promise<Role | null> {
    const [roles] = await pool.execute(
      'SELECT id, name, description, scopes, created_at FROM roles WHERE id = ?',
      [roleId]
    ) as any;

    if (roles.length === 0) {
      return null;
    }

    const role = roles[0];
    role.scopes = role.scopes ? JSON.parse(role.scopes) : [];

    return role;
  }

  async create(input: CreateRoleInput): Promise<Role> {
    const { name, description, scopes } = input;

    // 检查角色名是否已存在
    const [existingRoles] = await pool.execute(
      'SELECT id FROM roles WHERE name = ?',
      [name]
    ) as any;

    if (existingRoles.length > 0) {
      throw new Error('角色名已存在');
    }

    // 验证权限作用域
    const invalidScopes = scopes.filter(s => !AVAILABLE_SCOPES.includes(s));
    if (invalidScopes.length > 0) {
      throw new Error(`无效的权限作用域: ${invalidScopes.join(', ')}`);
    }

    // 创建角色
    const roleId = uuidv4();
    const now = new Date();

    await pool.execute(
      'INSERT INTO roles (id, name, description, scopes, created_at) VALUES (?, ?, ?, ?, ?)',
      [roleId, name, description || null, JSON.stringify(scopes), now]
    );

    return this.getById(roleId) as Promise<Role>;
  }

  async update(roleId: string, input: UpdateRoleInput): Promise<Role> {
    const updates: string[] = [];
    const values: any[] = [];

    if (input.name !== undefined) {
      // 检查角色名是否被占用
      const [existingRoles] = await pool.execute(
        'SELECT id FROM roles WHERE name = ? AND id != ?',
        [input.name, roleId]
      ) as any;

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
      const invalidScopes = input.scopes.filter(s => !AVAILABLE_SCOPES.includes(s));
      if (invalidScopes.length > 0) {
        throw new Error(`无效的权限作用域: ${invalidScopes.join(', ')}`);
      }

      updates.push('scopes = ?');
      values.push(JSON.stringify(input.scopes));
    }

    if (updates.length > 0) {
      values.push(roleId);

      await pool.execute(
        `UPDATE roles SET ${updates.join(', ')} WHERE id = ?`,
        values
      );
    }

    return this.getById(roleId) as Promise<Role>;
  }

  async delete(roleId: string): Promise<void> {
    // 检查是否有用户使用此角色
    const [members] = await pool.execute(
      'SELECT COUNT(*) as count FROM workspace_members WHERE role_id = ?',
      [roleId]
    ) as any;

    if (members[0].count > 0) {
      throw new Error('该角色正在被使用，无法删除');
    }

    await pool.execute('DELETE FROM roles WHERE id = ?', [roleId]);
  }

  async getAvailableScopes(): Promise<string[]> {
    return AVAILABLE_SCOPES;
  }

  async getUsersByRole(roleId: string): Promise<any[]> {
    const [users] = await pool.execute(
      `SELECT DISTINCT u.id, u.username, u.email, u.status, u.created_at
       FROM users u
       JOIN workspace_members wm ON u.id = wm.user_id
       WHERE wm.role_id = ?
       ORDER BY u.created_at DESC`,
      [roleId]
    ) as any;

    return users;
  }

  async getRoleUsageStats(roleId: string): Promise<{ workspaceCount: number; userCount: number }> {
    const [workspaceCount] = await pool.execute(
      'SELECT COUNT(DISTINCT workspace_id) as count FROM workspace_members WHERE role_id = ?',
      [roleId]
    ) as any;

    const [userCount] = await pool.execute(
      'SELECT COUNT(DISTINCT user_id) as count FROM workspace_members WHERE role_id = ?',
      [roleId]
    ) as any;

    return {
      workspaceCount: workspaceCount[0].count,
      userCount: userCount[0].count,
    };
  }
}

export default new RolesService();
