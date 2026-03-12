import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import pool from '../database/database';
import { CreateUserInput, UpdateUserInput, User } from './users.model';

export class UsersService {
  async list(filters?: { status?: string; search?: string }): Promise<User[]> {
    let query = 'SELECT id, username, email, status, is_superuser, created_at, updated_at FROM users WHERE 1=1';
    const params: any[] = [];

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

    const [users] = await pool.execute(query, params) as any;

    return users;
  }

  async getById(userId: string): Promise<User | null> {
    const [users] = await pool.execute(
      'SELECT id, username, email, status, is_superuser, created_at, updated_at FROM users WHERE id = ?',
      [userId]
    ) as any;

    return users.length > 0 ? users[0] : null;
  }

  async getByEmail(email: string): Promise<User | null> {
    const [users] = await pool.execute(
      'SELECT id, username, email, status, is_superuser, created_at, updated_at FROM users WHERE email = ?',
      [email]
    ) as any;

    return users.length > 0 ? users[0] : null;
  }

  async create(input: CreateUserInput): Promise<User> {
    const { username, email, password, status = 'active', is_superuser = false } = input;

    // 检查是否已存在
    const [existingUsers] = await pool.execute(
      'SELECT id FROM users WHERE email = ? OR username = ?',
      [email, username]
    ) as any;

    if (existingUsers.length > 0) {
      throw new Error('用户名或邮箱已存在');
    }

    // 密码加密
    const passwordHash = await bcrypt.hash(password, 10);

    // 创建用户
    const userId = uuidv4();
    const now = new Date();

    await pool.execute(
      'INSERT INTO users (id, username, email, password_hash, status, is_superuser, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [userId, username, email, passwordHash, status, is_superuser ? 1 : 0, now, now]
    );

    return this.getById(userId) as Promise<User>;
  }

  async update(userId: string, input: UpdateUserInput): Promise<User> {
    const updates: string[] = [];
    const values: any[] = [];

    if (input.username !== undefined) {
      // 检查用户名是否被占用
      const [existingUsers] = await pool.execute(
        'SELECT id FROM users WHERE username = ? AND id != ?',
        [input.username, userId]
      ) as any;

      if (existingUsers.length > 0) {
        throw new Error('用户名已被占用');
      }

      updates.push('username = ?');
      values.push(input.username);
    }

    if (input.email !== undefined) {
      // 检查邮箱是否被占用
      const [existingUsers] = await pool.execute(
        'SELECT id FROM users WHERE email = ? AND id != ?',
        [input.email, userId]
      ) as any;

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

      await pool.execute(
        `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
        values
      );
    }

    return this.getById(userId) as Promise<User>;
  }

  async delete(userId: string): Promise<void> {
    await pool.execute('DELETE FROM users WHERE id = ?', [userId]);
  }

  async resetPassword(userId: string, newPassword: string): Promise<void> {
    const passwordHash = await bcrypt.hash(newPassword, 10);

    await pool.execute(
      'UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?',
      [passwordHash, new Date(), userId]
    );
  }

  async getUserWorkspaces(userId: string): Promise<any[]> {
    const [workspaces] = await pool.execute(
      `SELECT w.id, w.name, w.description, w.owner_id, w.created_at,
              wm.role_id, r.name as role_name,
              CASE WHEN w.owner_id = ? THEN true ELSE false END as is_owner
       FROM workspaces w
       LEFT JOIN workspace_members wm ON w.id = wm.workspace_id AND wm.user_id = ?
       LEFT JOIN roles r ON wm.role_id = r.id
       WHERE w.owner_id = ? OR wm.user_id = ?
       ORDER BY w.created_at DESC`,
      [userId, userId, userId, userId]
    ) as any;

    return workspaces;
  }

  async getUserStats(): Promise<{
    total: number;
    active: number;
    disabled: number;
    pending: number;
    superadmins: number;
  }> {
    const [stats] = await pool.execute(
      `SELECT
         COUNT(*) as total,
         SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
         SUM(CASE WHEN status = 'disabled' THEN 1 ELSE 0 END) as disabled,
         SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
         SUM(CASE WHEN is_superuser = 1 THEN 1 ELSE 0 END) as superadmins
       FROM users`
    ) as any;

    return stats[0];
  }
}

export default new UsersService();
