import { Router, Request, Response } from 'express';
import { body, query, validationResult } from 'express-validator';
import permissionsService from './permissions.service';
import { authMiddleware } from '../auth/auth.middleware';

const router = Router();

// 所有路由都需要认证
router.use(authMiddleware);

// 检查权限
router.post('/check', async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: '未认证' });
    }

    const { workspaceId, resource_type, resource_id, required_actions } = req.body;

    if (!workspaceId || !resource_type || !required_actions) {
      return res.status(400).json({ error: '缺少必要参数' });
    }

    const hasPermission = await permissionsService.checkPermission(
      req.user.userId,
      workspaceId,
      {
        resource_type,
        resource_id,
        required_actions,
      }
    );

    res.json({ success: true, hasPermission });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 获取权限列表
router.get('/', async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: '未认证' });
    }

    const filters = {
      resource_type: req.query.resource_type as string | undefined,
      resource_id: req.query.resource_id as string | undefined,
      user_id: req.query.user_id as string | undefined,
      role_id: req.query.role_id as string | undefined,
    };

    const permissions = await permissionsService.list(filters);

    res.json({ success: true, permissions });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 获取用户的权限
router.get('/user/:userId', async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: '未认证' });
    }

    const permissions = await permissionsService.getUserPermissions(req.params.userId);

    res.json({ success: true, permissions });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 获取角色的权限
router.get('/role/:roleId', async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: '未认证' });
    }

    const permissions = await permissionsService.getRolePermissions(req.params.roleId);

    res.json({ success: true, permissions });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 获取工作空间的权限
router.get('/workspace/:workspaceId', async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: '未认证' });
    }

    const permissions = await permissionsService.getWorkspacePermissions(req.params.workspaceId);

    res.json({ success: true, permissions });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 创建权限
router.post(
  '/',
  [
    body('resource_type').isIn(['workspace', 'session', 'skill', 'channel', 'config']),
    body('actions').isArray({ min: 1 }).withMessage('权限操作不能为空'),
    body('user_id').optional(),
    body('role_id').optional(),
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

      const permission = await permissionsService.create(req.body);

      res.status(201).json({ success: true, permission });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
);

// 获取权限详情
router.get('/:id', async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: '未认证' });
    }

    const permission = await permissionsService.getById(req.params.id);

    if (!permission) {
      return res.status(404).json({ error: '权限不存在' });
    }

    res.json({ success: true, permission });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 更新权限
router.put(
  '/:id',
  [
    body('actions').optional().isArray({ min: 1 }),
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

      const permission = await permissionsService.update(req.params.id, req.body);

      res.json({ success: true, permission });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
);

// 删除权限
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: '未认证' });
    }

    await permissionsService.delete(req.params.id);

    res.json({ success: true, message: '权限已删除' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
