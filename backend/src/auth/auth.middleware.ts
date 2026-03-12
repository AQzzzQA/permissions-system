import { Request, Response, NextFunction } from 'express';
import authService from './auth.service';

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        isSuperAdmin: boolean;
      };
    }
  }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: '未提供认证 token' });
    }

    const token = authHeader.substring(7);

    const decoded = authService.verifyToken(token);

    req.user = { userId: decoded.userId, isSuperAdmin: decoded.isSuperAdmin };

    next();
  } catch (error) {
    return res.status(401).json({ error: '无效的 token' });
  }
}

// 只有超级管理员可以访问
export function superAdminMiddleware(req: Request, res: Response, next: NextFunction) {
  if (!req.user || !req.user.isSuperAdmin) {
    return res.status(403).json({ error: '需要超级管理员权限' });
  }
  next();
}

export function optionalAuthMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = authService.verifyToken(token);
      req.user = { userId: decoded.userId, isSuperAdmin: decoded.isSuperAdmin };
    }

    next();
  } catch (error) {
    // 静默失败，不要求认证
    next();
  }
}
