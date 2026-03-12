import { Router } from 'express';
import { default as authRouter } from './auth.controller';
import qqBindingRouter from './qq-binding.controller';

const router = Router();

// 原有的认证路由
router.use('/', authRouter);

// QQ 绑定路由
router.post('/bind-admin', (req, res, next) => qqBindingRouter(req, res, next));
router.post('/bind-client', (req, res, next) => qqBindingRouter(req, res, next));
router.get('/user-by-qq/:qq', (req, res, next) => qqBindingRouter(req, res, next));
router.post('/generate-invite', (req, res, next) => qqBindingRouter(req, res, next));

export default router;
