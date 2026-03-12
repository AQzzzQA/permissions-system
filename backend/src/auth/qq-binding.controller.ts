import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import authService from './auth.service';
import { authMiddleware, optionalAuthMiddleware } from './auth.middleware';

const router = Router();

// 超级管理员绑定命令（不需要认证）
router.post(
  '/bind-admin',
  optionalAuthMiddleware,
  [
    body('qq').notEmpty().withMessage('QQ 号不能为空'),
    body('email').optional().isEmail().withMessage('邮箱格式不正确'),
    body('password').optional().isLength({ min: 6 }).withMessage('密码长度至少 6 个字符'),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { qq, email, password } = req.body;

      // 检查是否已绑定的用户
      const pool = (await import('../database/database')).default;
      const [existingUsers] = await pool.execute(
        'SELECT id, email FROM users WHERE email = ?',
        [email]
      ) as any;

      if (existingUsers.length > 0) {
        const user = existingUsers[0];
        // 更新 QQ 号绑定
        await pool.execute(
          'UPDATE users SET qq = ?, updated_at = ? WHERE id = ?',
          [qq, new Date(), user.id]
        );

        const token = authService.generateToken(user.id, user.is_superuser);

        return res.json({
          success: true,
          message: '管理员绑定成功',
          user: {
            id: user.id,
            email: user.email,
            qq: qq,
            is_superuser: user.is_superuser,
          },
          token,
        });
      }

      // 创建新管理员账户
      const registerInput = {
        username: qq, // 使用 QQ 号作为用户名
        email: email || `${qq}@qq.com`,
        password: password || `${qq}Admin123!`,
      };

      const { user, token } = await authService.register(registerInput);

      // 设置为超级管理员
      await pool.execute(
        'UPDATE users SET is_superuser = 1, qq = ?, updated_at = ? WHERE id = ?',
        [qq, new Date(), user.id]
      );

      const updatedUser = await authService.getUserById(user.id);

      res.json({
        success: true,
        message: '管理员账户创建并绑定成功',
        user: updatedUser,
        token,
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
);

// 客户绑定命令（不需要认证）
router.post(
  '/bind-client',
  optionalAuthMiddleware,
  [
    body('qq').notEmpty().withMessage('QQ 号不能为空'),
    body('invite_code').notEmpty().withMessage('邀请码不能为空'),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { qq, invite_code, email, password } = req.body;

      // 验证邀请码
      const pool = (await import('../database/database')).default;
      const [invites] = await pool.execute(
        'SELECT * FROM invite_codes WHERE code = ? AND status = ?',
        [invite_code, 'active']
      ) as any;

      if (invites.length === 0) {
        return res.status(400).json({ error: '无效的邀请码或已过期' });
      }

      const invite = invites[0];

      // 检查邀请码是否已使用
      if (invite.used_count >= invite.max_uses) {
        return res.status(400).json({ error: '邀请码已达到使用次数限制' });
      }

      // 检查是否已绑定的用户
      const [existingUsers] = await pool.execute(
        'SELECT id FROM users WHERE qq = ? OR email = ?',
        [qq, email]
      ) as any;

      if (existingUsers.length > 0) {
        // 更新绑定
        const user = existingUsers[0];
        await pool.execute(
          'UPDATE users SET qq = ?, updated_at = ? WHERE id = ?',
          [qq, new Date(), user.id]
        );

        const token = authService.generateToken(user.id, false);

        return res.json({
          success: true,
          message: '客户绑定成功',
          user,
          token,
        });
      }

      // 创建新客户账户
      const registerInput = {
        username: qq,
        email: email || `${qq}@qq.com`,
        password: password || `${qq}Client123!`,
      };

      const { user, token } = await authService.register(registerInput);

      // 绑定 QQ 号
      await pool.execute(
        'UPDATE users SET qq = ?, updated_at = ? WHERE id = ?',
        [qq, new Date(), user.id]
      );

      // 更新邀请码使用次数
      await pool.execute(
        'UPDATE invite_codes SET used_count = used_count + 1 WHERE id = ?',
        [invite.id]
      );

      // 添加用户到邀请码对应的工作空间
      if (invite.workspace_id) {
        const [roles] = await pool.execute(
          "SELECT id FROM roles WHERE name = ?",
          ['Workspace Member']
        ) as any;

        if (roles.length > 0) {
          await pool.execute(
            'INSERT INTO workspace_members (id, workspace_id, user_id, role_id, joined_at) VALUES (?, ?, ?, ?, ?)',
            [
              require('uuid').v4(),
              invite.workspace_id,
              user.id,
              roles[0].id,
              new Date(),
            ]
          );
        }
      }

      res.json({
        success: true,
        message: '客户账户创建并绑定成功',
        user,
        token,
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
);

// 通过 QQ 号获取用户（内部 API）
router.get('/user-by-qq/:qq', async (req: Request, res: Response) => {
  try {
    const pool = (await import('../database/database')).default;
    const [users] = await pool.execute(
      'SELECT id, username, email, qq, status, is_superuser, created_at FROM users WHERE qq = ?',
      [req.params.qq]
    ) as any;

    if (users.length === 0) {
      return res.status(404).json({ error: '用户不存在' });
    }

    const user = users[0];
    const token = authService.generateToken(user.id, user.is_superuser);

    res.json({
      success: true,
      user,
      token,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 生成邀请码（仅超级管理员）
router.post(
  '/generate-invite',
  [
    body('workspace_id').optional().isUUID().withMessage('工作空间 ID 格式不正确'),
    body('max_uses').optional().isInt({ min: 1, max: 100 }).withMessage('使用次数必须在 1-100 之间'),
    body('expires_at').optional().isISO8601().withMessage('过期时间格式不正确'),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      if (!req.user || !req.user.isSuperAdmin) {
        return res.status(403).json({ error: '需要超级管理员权限' });
      }

      const { workspace_id, max_uses = 1, expires_at } = req.body;

      const pool = (await import('../database/database')).default;
      const code = 'INV-' + require('crypto').randomBytes(6).toString('hex').toUpperCase();

      // 设置默认过期时间（7 天后）
      const defaultExpires = new Date();
      defaultExpires.setDate(defaultExpires.getDate() + 7);

      await pool.execute(
        'INSERT INTO invite_codes (id, code, workspace_id, max_uses, used_count, status, expires_at, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [
          require('uuid').v4(),
          code,
          workspace_id || null,
          max_uses,
          0,
          'active',
          expires_at || defaultExpires.toISOString(),
          new Date(),
        ]
      );

      res.json({
        success: true,
        message: '邀请码生成成功',
        invite_code: code,
        workspace_id,
        max_uses,
        expires_at: expires_at || defaultExpires.toISOString(),
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
);

// 保留原有的认证路由
export { default as authRouter } from './auth.controller';

export default router;
