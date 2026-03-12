import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import authService, { RegisterInput, LoginInput } from './auth.service';
import { authMiddleware } from './auth.middleware';

const router = Router();

// 注册
router.post(
  '/register',
  [
    body('username').trim().isLength({ min: 3, max: 50 }).withMessage('用户名长度必须在 3-50 字符之间'),
    body('email').isEmail().withMessage('邮箱格式不正确'),
    body('password').isLength({ min: 6 }).withMessage('密码长度至少 6 个字符'),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const input: RegisterInput = req.body;
      const result = await authService.register(input);

      res.status(201).json({
        success: true,
        user: result.user,
        token: result.token,
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
);

// 登录
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('邮箱格式不正确'),
    body('password').notEmpty().withMessage('密码不能为空'),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const input: LoginInput = req.body;
      const result = await authService.login(input);

      res.json({
        success: true,
        user: result.user,
        token: result.token,
      });
    } catch (error: any) {
      res.status(401).json({ error: error.message });
    }
  }
);

// 获取当前用户信息
router.get('/me', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: '未认证' });
    }

    const user = await authService.getUserById(req.user.userId);

    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }

    res.json({ success: true, user });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 修改密码
router.put(
  '/password',
  authMiddleware,
  [
    body('oldPassword').notEmpty().withMessage('旧密码不能为空'),
    body('newPassword').isLength({ min: 6 }).withMessage('新密码长度至少 6 个字符'),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      if (!req.user) {
        return res.status(401).json({ error: '未认证' });
      }

      const { oldPassword, newPassword } = req.body;

      await authService.changePassword(req.user.userId, oldPassword, newPassword);

      res.json({ success: true, message: '密码修改成功' });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
);

export default router;
