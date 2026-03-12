import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import workspaceService, { CreateWorkspaceInput, UpdateWorkspaceInput } from './workspaces.service';
import { authMiddleware } from '../auth/auth.middleware';

const router = Router();

// 所有路由都需要认证
router.use(authMiddleware);

// 创建工作空间
router.post(
  '/',
  [
    body('name').trim().isLength({ min: 1, max: 100 }).withMessage('工作空间名称不能为空且不超过 100 字符'),
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

      const input: CreateWorkspaceInput = req.body;
      const workspace = await workspaceService.create(req.user.userId, input);

      res.status(201).json({ success: true, workspace });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
);

// 获取工作空间列表
router.get('/', async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: '未认证' });
    }

    const workspaces = await workspaceService.listByUser(req.user.userId);

    res.json({ success: true, workspaces });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 获取工作空间详情
router.get('/:id', async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: '未认证' });
    }

    const workspace = await workspaceService.getById(req.params.id);

    res.json({ success: true, workspace });
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
});

// 更新工作空间
router.put(
  '/:id',
  [
    body('name').optional().trim().isLength({ min: 1, max: 100 }),
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

      const input: UpdateWorkspaceInput = req.body;
      const workspace = await workspaceService.update(req.user.userId, req.params.id, input);

      res.json({ success: true, workspace });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
);

// 删除工作空间
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: '未认证' });
    }

    await workspaceService.delete(req.user.userId, req.params.id);

    res.json({ success: true, message: '工作空间已删除' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// 获取工作空间成员
router.get('/:id/members', async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: '未认证' });
    }

    const members = await workspaceService.getMembers(req.params.id);

    res.json({ success: true, members });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 添加工作空间成员
router.post(
  '/:id/members',
  [
    body('userId').notEmpty().withMessage('用户 ID 不能为空'),
    body('roleId').optional().notEmpty(),
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

      const { userId, roleId = 'role-member' } = req.body;

      await workspaceService.addMember(req.params.id, userId, roleId);

      res.status(201).json({ success: true, message: '成员已添加' });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
);

// 删除工作空间成员
router.delete('/:id/members/:userId', async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: '未认证' });
    }

    await workspaceService.removeMember(req.params.id, req.params.userId);

    res.json({ success: true, message: '成员已删除' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// 更新成员角色
router.put(
  '/:id/members/:userId',
  [
    body('roleId').notEmpty().withMessage('角色 ID 不能为空'),
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

      const { roleId } = req.body;

      await workspaceService.updateMemberRole(req.params.id, req.params.userId, roleId);

      res.json({ success: true, message: '成员角色已更新' });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
);

export default router;
