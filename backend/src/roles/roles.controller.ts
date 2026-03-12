import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import rolesService from './roles.service';
import { authMiddleware } from '../auth/auth.middleware';

const router = Router();

// 所有路由都需要认证
router.use(authMiddleware);

// 获取角色列表
router.get('/', async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: '未认证' });
    }

    const roles = await rolesService.list();

    res.json({ success: true, roles });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 获取可用的权限作用域
router.get('/scopes', async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: '未认证' });
    }

    const scopes = await rolesService.getAvailableScopes();

    res.json({ success: true, scopes });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 获取角色详情
router.get('/:id', async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: '未认证' });
    }

    const role = await rolesService.getById(req.params.id);

    if (!role) {
      return res.status(404).json({ error: '角色不存在' });
    }

    res.json({ success: true, role });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 获取角色的使用情况
router.get('/:id/usage', async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: '未认证' });
    }

    const stats = await rolesService.getRoleUsageStats(req.params.id);

    res.json({ success: true, stats });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 获取使用此角色的用户
router.get('/:id/users', async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: '未认证' });
    }

    const users = await rolesService.getUsersByRole(req.params.id);

    res.json({ success: true, users });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 创建角色
router.post(
  '/',
  [
    body('name').trim().isLength({ min: 1, max: 50 }).withMessage('角色名不能为空且不超过 50 字符'),
    body('description').optional(),
    body('scopes').isArray({ min: 1 }).withMessage('权限作用域不能为空'),
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

      const role = await rolesService.create(req.body);

      res.status(201).json({ success: true, role });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
);

// 更新角色
router.put(
  '/:id',
  [
    body('name').optional().trim().isLength({ min: 1, max: 50 }),
    body('description').optional(),
    body('scopes').optional().isArray({ min: 1 }),
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

      const role = await rolesService.update(req.params.id, req.body);

      res.json({ success: true, role });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
);

// 删除角色
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: '未认证' });
    }

    await rolesService.delete(req.params.id);

    res.json({ success: true, message: '角色已删除' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
