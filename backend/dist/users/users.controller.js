"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const users_service_1 = __importDefault(require("./users.service"));
const auth_middleware_1 = require("../auth/auth.middleware");
const router = (0, express_1.Router)();
// 所有路由都需要认证
router.use(auth_middleware_1.authMiddleware);
// 获取用户列表
router.get('/', async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: '未认证' });
        }
        const filters = {
            status: req.query.status,
            search: req.query.search,
        };
        const users = await users_service_1.default.list(filters);
        // 如果不是超级管理员，隐藏超级管理员信息
        if (!req.user.isSuperAdmin) {
            const filteredUsers = users.map(u => ({
                ...u,
                is_superuser: false, // 隐藏超级管理员标记
            }));
            res.json({ success: true, users: filteredUsers });
        }
        else {
            res.json({ success: true, users });
        }
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// 获取用户统计
router.get('/stats', async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: '未认证' });
        }
        const stats = await users_service_1.default.getUserStats();
        res.json({ success: true, stats });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// 获取用户详情
router.get('/:id', async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: '未认证' });
        }
        const user = await users_service_1.default.getById(req.params.id);
        if (!user) {
            return res.status(404).json({ error: '用户不存在' });
        }
        // 如果不是超级管理员，隐藏超级管理员标记
        if (!req.user.isSuperAdmin) {
            res.json({ success: true, user: { ...user, is_superuser: false } });
        }
        else {
            res.json({ success: true, user });
        }
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// 获取用户的工作空间
router.get('/:id/workspaces', async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: '未认证' });
        }
        const workspaces = await users_service_1.default.getUserWorkspaces(req.params.id);
        res.json({ success: true, workspaces });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// 创建用户（仅超级管理员）
router.post('/', auth_middleware_1.superAdminMiddleware, [
    (0, express_validator_1.body)('username').trim().isLength({ min: 3, max: 50 }).withMessage('用户名长度必须在 3-50 字符之间'),
    (0, express_validator_1.body)('email').isEmail().withMessage('邮箱格式不正确'),
    (0, express_validator_1.body)('password').isLength({ min: 6 }).withMessage('密码长度至少 6 个字符'),
    (0, express_validator_1.body)('status').optional().isIn(['active', 'disabled', 'pending']),
    (0, express_validator_1.body)('is_superuser').optional().isBoolean(),
], async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        if (!req.user) {
            return res.status(401).json({ error: '未认证' });
        }
        const user = await users_service_1.default.create(req.body);
        res.status(201).json({ success: true, user });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
// 更新用户（仅超级管理员或用户自己）
router.put('/:id', [
    (0, express_validator_1.body)('username').optional().trim().isLength({ min: 3, max: 50 }),
    (0, express_validator_1.body)('email').optional().isEmail(),
    (0, express_validator_1.body)('status').optional().isIn(['active', 'disabled', 'pending']),
    (0, express_validator_1.body)('is_superuser').optional().isBoolean(),
], async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        if (!req.user) {
            return res.status(401).json({ error: '未认证' });
        }
        // 只有超级管理员可以修改 is_superuser
        if (req.body.is_superuser !== undefined && !req.user.isSuperAdmin) {
            return res.status(403).json({ error: '需要超级管理员权限' });
        }
        // 用户自己不能修改自己的 status 和 is_superuser
        if (req.user.userId === req.params.id && (req.body.status || req.body.is_superuser)) {
            return res.status(403).json({ error: '不能修改自己的状态或超级管理员权限' });
        }
        const user = await users_service_1.default.update(req.params.id, req.body);
        res.json({ success: true, user });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
// 删除用户（仅超级管理员）
router.delete('/:id', auth_middleware_1.superAdminMiddleware, async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: '未认证' });
        }
        // 超级管理员不能删除自己
        if (req.user.userId === req.params.id) {
            return res.status(403).json({ error: '不能删除超级管理员' });
        }
        await users_service_1.default.delete(req.params.id);
        res.json({ success: true, message: '用户已删除' });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// 重置用户密码（仅超级管理员）
router.post('/:id/reset-password', auth_middleware_1.superAdminMiddleware, [
    (0, express_validator_1.body)('password').isLength({ min: 6 }).withMessage('密码长度至少 6 个字符'),
], async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        if (!req.user) {
            return res.status(401).json({ error: '未认证' });
        }
        const { password } = req.body;
        await users_service_1.default.resetPassword(req.params.id, password);
        res.json({ success: true, message: '密码已重置' });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.default = router;
