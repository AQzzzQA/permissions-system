import { Request, Response, NextFunction } from 'express';
import permissionsService from './permissions.service';
import { ActionType, ResourceType } from './permissions.model';

declare global {
  namespace Express {
    interface Request {
      workspaceId?: string;
    }
  }
}

export function requirePermission(
  resourceType: ResourceType,
  requiredActions: ActionType[]
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: '未认证' });
      }

      const workspaceId = req.params.workspaceId || req.body.workspaceId || req.workspaceId;

      if (!workspaceId) {
        return res.status(400).json({ error: '缺少工作空间 ID' });
      }

      const hasPermission = await permissionsService.checkPermission(
        req.user.userId,
        workspaceId,
        {
          resource_type: resourceType,
          resource_id: req.params.id || req.body.resourceId,
          required_actions: requiredActions,
        }
      );

      if (!hasPermission) {
        return res.status(403).json({
          error: '权限不足',
          required: requiredActions,
          resource_type: resourceType,
        });
      }

      next();
    } catch (error: any) {
      console.error('Permission check error:', error);
      res.status(500).json({ error: '权限检查失败' });
    }
  };
}

export function checkPermission(
  resourceType: ResourceType,
  requiredActions: ActionType[]
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: '未认证' });
      }

      const workspaceId = req.params.workspaceId || req.body.workspaceId || req.workspaceId;

      if (!workspaceId) {
        // 没有 workspaceId 时，跳过权限检查
        return next();
      }

      const hasPermission = await permissionsService.checkPermission(
        req.user.userId,
        workspaceId,
        {
          resource_type: resourceType,
          resource_id: req.params.id || req.body.resourceId,
          required_actions: requiredActions,
        }
      );

      if (hasPermission) {
        req.workspaceId = workspaceId;
      }

      next();
    } catch (error: any) {
      console.error('Permission check error:', error);
      next();
    }
  };
}
