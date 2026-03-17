"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const roles_service_1 = __importDefault(require("./roles.service"));
const auth_middleware_1 = require("../auth/auth.middleware");
const router = (0, express_1.Router)();
// 所有路由都需要认证
router.use(auth_middleware_1.authMiddleware);
// 获取角色列表
router.get('/', async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: '未认证' });
        }
        const roles = await roles_service_1.default.list();
        res.json({ success: true, roles });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// 获取可用的权限作用域
router.get('/scopes', async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: '未认证' });
        }
        const scopes = await roles_service_1.default.getAvailableScopes();
        res.json({ success: true, scopes });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// 获取角色详情
router.get('/:id', async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: '未认证' });
        }
        const role = await roles_service_1.default.getById(req.params.id);
        if (!role) {
            return res.status(404).json({ error: '角色不存在' });
        }
        res.json({ success: true, role });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// 获取角色的使用情况
router.get('/:id/usage', async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: '未认证' });
        }
        const stats = await roles_service_1.default.getRoleUsageStats(req.params.id);
        res.json({ success: true, stats });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// 获取使用此角色的用户
router.get('/:id/users', async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: '未认证' });
        }
        const users = await roles_service_1.default.getUsersByRole(req.params.id);
        res.json({ success: true, users });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// 创建角色
router.post('/', [
    (0, express_validator_1.body)('name').trim().isLength({ min: 1, max: 50 }).withMessage('角色名不能为空且不超过 50 字符'),
    (0, express_validator_1.body)('description').optional(),
    (0, express_validator_1.body)('scopes').isArray({ min: 1 }).withMessage('权限作用域不能为空'),
], async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        if (!req.user) {
            return res.status(401).json({ error: '未认证' });
        }
        const role = await roles_service_1.default.create(req.body);
        res.status(201).json({ success: true, role });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
// 更新角色
router.put('/:id', [
    (0, express_validator_1.body)('name').optional().trim().isLength({ min: 1, max: 50 }),
    (0, express_validator_1.body)('description').optional(),
    (0, express_validator_1.body)('scopes').optional().isArray({ min: 1 }),
], async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        if (!req.user) {
            return res.status(401).json({ error: '未认证' });
        }
        const role = await roles_service_1.default.update(req.params.id, req.body);
        res.json({ success: true, role });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
// 删除角色
router.delete('/:id', async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: '未认证' });
        }
        await roles_service_1.default.delete(req.params.id);
        res.json({ success: true, message: '角色已删除' });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
exports.default = router;
