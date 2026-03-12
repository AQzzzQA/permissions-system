import { Router } from 'express';
import skillsController from '../skills/skills.controller';

const router = Router();

// 技能管理路由
router.use('/skills', skillsController);

export default router;