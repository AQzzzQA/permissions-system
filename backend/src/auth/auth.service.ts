import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import pool from '../database/database';

export interface RegisterInput {
  username: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  status: string;
  is_superuser: boolean;
  created_at: Date;
  updated_at: Date;
}

// 超级管理员配置
const SUPERADMIN_EMAIL = process.env.SUPERADMIN_EMAIL || 'admin@openclaw.ai';
const SUPERADMIN_PASSWORD = process.env.SUPERADMIN_PASSWORD || 'SuperAdmin123!';

export class AuthService {
  async register(input: RegisterInput): Promise<{ user: User; token: string }> {
    const { username, email, password } = input;

    // 检查邮箱是否已存在
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
      [userId, username, email, passwordHash, 'active', false, now, now]
    );

    // 获取创建的用户
    const [users] = await pool.execute(
      'SELECT id, username, email, status, is_superuser, created_at, updated_at FROM users WHERE id = ?',
      [userId]
    ) as any;

    const user = users[0];

    // 生成 JWT token
    const token = this.generateToken(user.id, user.is_superuser);

    return { user, token };
  }

  async login(input: LoginInput): Promise<{ user: User; token: string }> {
    const { email, password } = input;

    // 查找用户
    const [users] = await pool.execute(
      'SELECT id, username, email, password_hash, status, is_superuser, created_at, updated_at FROM users WHERE email = ?',
      [email]
    ) as [any[], any];

    if (users.length === 0) {
      throw new Error('用户不存在');
    }

    const user = users[0];

    // 验证密码
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

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

  async getUserById(userId: string): Promise<User | null> {
    const [users] = await pool.execute(
      'SELECT id, username, email, status, is_superuser, created_at, updated_at FROM users WHERE id = ?',
      [userId]
    ) as any;

    return users.length > 0 ? users[0] : null;
  }

  // 初始化超级管理员
  async initSuperAdmin(): Promise<{ user: User; token: string }> {
    const [existingUsers] = await pool.execute(
      'SELECT id FROM users WHERE email = ?',
      [SUPERADMIN_EMAIL]
    ) as any;

    if (existingUsers.length > 0) {
      // 超级管理员已存在，直接登录
      return this.login({
        email: SUPERADMIN_EMAIL,
        password: SUPERADMIN_PASSWORD,
      });
    }

    // 创建超级管理员
    const passwordHash = await bcrypt.hash(SUPERADMIN_PASSWORD, 10);
    const userId = uuidv4();
    const now = new Date();

    await pool.execute(
      'INSERT INTO users (id, username, email, password_hash, status, is_superuser, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [userId, 'SuperAdmin', SUPERADMIN_EMAIL, passwordHash, 'active', true, now, now]
    );

    const user = await this.getUserById(userId) as User;
    const token = this.generateToken(userId, true);

    console.log('✅ 超级管理员已创建');
    console.log(`📧 邮箱: ${SUPERADMIN_EMAIL}`);
    console.log(`🔑 密码: ${SUPERADMIN_PASSWORD}`);
    console.log('⚠️  请在生产环境中修改默认密码！');

    return { user, token };
  }

  // 检查是否是超级管理员
  async isSuperAdmin(userId: string): Promise<boolean> {
    const [users] = await pool.execute(
      'SELECT is_superuser FROM users WHERE id = ?',
      [userId]
    ) as any;

    return users.length > 0 && users[0].is_superuser === true;
  }

  public generateToken(userId: string, isSuperAdmin: boolean = false): string {
    const secret = process.env.JWT_SECRET || 'your-secret-key';
    const expiresIn = process.env.JWT_EXPIRES_IN || '24h';

    return jwt.sign({ userId, isSuperAdmin }, secret, { expiresIn } as any);
  }

  verifyToken(token: string): { userId: string; isSuperAdmin: boolean } {
    const secret = process.env.JWT_SECRET || 'your-secret-key';

    try {
      const decoded = jwt.verify(token, secret) as { userId: string; isSuperAdmin?: boolean };
      return {
        userId: decoded.userId,
        isSuperAdmin: decoded.isSuperAdmin || false,
      };
    } catch (error) {
      throw new Error('无效的 token');
    }
  }

  async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<void> {
    // 获取用户当前密码
    const [users] = await pool.execute(
      'SELECT password_hash, is_superuser FROM users WHERE id = ?',
      [userId]
    ) as [any[], any];

    if (users.length === 0) {
      throw new Error('用户不存在');
    }

    const user = users[0];

    // 验证旧密码
    const isValidPassword = await bcrypt.compare(oldPassword, user.password_hash);

    if (!isValidPassword) {
      throw new Error('旧密码错误');
    }

    // 更新密码
    const passwordHash = await bcrypt.hash(newPassword, 10);

    await pool.execute(
      'UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?',
      [passwordHash, new Date(), userId]
    );
  }

  // 超级管理员可以修改任何人的密码
  async resetPasswordByAdmin(adminUserId: string, targetUserId: string, newPassword: string): Promise<void> {
    // 检查操作者是否是超级管理员
    const isSuperAdmin = await this.isSuperAdmin(adminUserId);

    if (!isSuperAdmin) {
      throw new Error('需要超级管理员权限');
    }

    // 更新目标用户密码
    const passwordHash = await bcrypt.hash(newPassword, 10);

    await pool.execute(
      'UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?',
      [passwordHash, new Date(), targetUserId]
    );
  }
}

export default new AuthService();
