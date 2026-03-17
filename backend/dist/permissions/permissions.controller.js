"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const permissions_service_1 = __importDefault(require("./permissions.service"));
const auth_middleware_1 = require("../auth/auth.middleware");
const router = (0, express_1.Router)();
// 所有路由都需要认证
router.use(auth_middleware_1.authMiddleware);
// 检查权限
router.post('/check', async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: '未认证' });
        }
        const { workspaceId, resource_type, resource_id, required_actions } = req.body;
        if (!workspaceId || !resource_type || !required_actions) {
            return res.status(400).json({ error: '缺少必要参数' });
        }
        const hasPermission = await permissions_service_1.default.checkPermission(req.user.userId, workspaceId, {
            resource_type,
            resource_id,
            required_actions,
        });
        res.json({ success: true, hasPermission });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// 获取权限列表
router.get('/', async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: '未认证' });
        }
        const filters = {
            resource_type: req.query.resource_type,
            resource_id: req.query.resource_id,
            user_id: req.query.user_id,
            role_id: req.query.role_id,
        };
        const permissions = await permissions_service_1.default.list(filters);
        res.json({ success: true, permissions });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// 获取用户的权限
router.get('/user/:userId', async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: '未认证' });
        }
        const permissions = await permissions_service_1.default.getUserPermissions(req.params.userId);
        res.json({ success: true, permissions });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// 获取角色的权限
router.get('/role/:roleId', async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: '未认证' });
        }
        const permissions = await permissions_service_1.default.getRolePermissions(req.params.roleId);
        res.json({ success: true, permissions });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// 获取工作空间的权限
router.get('/workspace/:workspaceId', async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: '未认证' });
        }
        const permissions = await permissions_service_1.default.getWorkspacePermissions(req.params.workspaceId);
        res.json({ success: true, permissions });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// 创建权限
router.post('/', [
    (0, express_validator_1.body)('resource_type').isIn(['workspace', 'session', 'skill', 'channel', 'config']),
    (0, express_validator_1.body)('actions').isArray({ min: 1 }).withMessage('权限操作不能为空'),
    (0, express_validator_1.body)('user_id').optional(),
    (0, express_validator_1.body)('role_id').optional(),
], async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        if (!req.user) {
            return res.status(401).json({ error: '未认证' });
        }
        const permission = await permissions_service_1.default.create(req.body);
        res.status(201).json({ success: true, permission });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
// 获取权限详情
router.get('/:id', async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: '未认证' });
        }
        const permission = await permissions_service_1.default.getById(req.params.id);
        if (!permission) {
            return res.status(404).json({ error: '权限不存在' });
        }
        res.json({ success: true, permission });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// 更新权限
router.put('/:id', [
    (0, express_validator_1.body)('actions').optional().isArray({ min: 1 }),
], async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        if (!req.user) {
            return res.status(401).json({ error: '未认证' });
        }
        const permission = await permissions_service_1.default.update(req.params.id, req.body);
        res.json({ success: true, permission });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
// 删除权限
router.delete('/:id', async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: '未认证' });
        }
        await permissions_service_1.default.delete(req.params.id);
        res.json({ success: true, message: '权限已删除' });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.default = router;
