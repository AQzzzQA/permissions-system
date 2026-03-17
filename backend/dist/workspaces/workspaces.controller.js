"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const workspaces_service_1 = __importDefault(require("./workspaces.service"));
const auth_middleware_1 = require("../auth/auth.middleware");
const router = (0, express_1.Router)();
// 所有路由都需要认证
router.use(auth_middleware_1.authMiddleware);
// 创建工作空间
router.post('/', [
    (0, express_validator_1.body)('name').trim().isLength({ min: 1, max: 100 }).withMessage('工作空间名称不能为空且不超过 100 字符'),
], async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        if (!req.user) {
            return res.status(401).json({ error: '未认证' });
        }
        const input = req.body;
        const workspace = await workspaces_service_1.default.create(req.user.userId, input);
        res.status(201).json({ success: true, workspace });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
// 获取工作空间列表
router.get('/', async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: '未认证' });
        }
        const workspaces = await workspaces_service_1.default.listByUser(req.user.userId);
        res.json({ success: true, workspaces });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// 获取工作空间详情
router.get('/:id', async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: '未认证' });
        }
        const workspace = await workspaces_service_1.default.getById(req.params.id);
        res.json({ success: true, workspace });
    }
    catch (error) {
        res.status(404).json({ error: error.message });
    }
});
// 更新工作空间
router.put('/:id', [
    (0, express_validator_1.body)('name').optional().trim().isLength({ min: 1, max: 100 }),
], async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        if (!req.user) {
            return res.status(401).json({ error: '未认证' });
        }
        const input = req.body;
        const workspace = await workspaces_service_1.default.update(req.user.userId, req.params.id, input);
        res.json({ success: true, workspace });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
// 删除工作空间
router.delete('/:id', async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: '未认证' });
        }
        await workspaces_service_1.default.delete(req.user.userId, req.params.id);
        res.json({ success: true, message: '工作空间已删除' });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
// 获取工作空间成员
router.get('/:id/members', async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: '未认证' });
        }
        const members = await workspaces_service_1.default.getMembers(req.params.id);
        res.json({ success: true, members });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// 添加工作空间成员
router.post('/:id/members', [
    (0, express_validator_1.body)('userId').notEmpty().withMessage('用户 ID 不能为空'),
    (0, express_validator_1.body)('roleId').optional().notEmpty(),
], async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        if (!req.user) {
            return res.status(401).json({ error: '未认证' });
        }
        const { userId, roleId = 'role-member' } = req.body;
        await workspaces_service_1.default.addMember(req.params.id, userId, roleId);
        res.status(201).json({ success: true, message: '成员已添加' });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
// 删除工作空间成员
router.delete('/:id/members/:userId', async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: '未认证' });
        }
        await workspaces_service_1.default.removeMember(req.params.id, req.params.userId);
        res.json({ success: true, message: '成员已删除' });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
// 更新成员角色
router.put('/:id/members/:userId', [
    (0, express_validator_1.body)('roleId').notEmpty().withMessage('角色 ID 不能为空'),
], async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        if (!req.user) {
            return res.status(401).json({ error: '未认证' });
        }
        const { roleId } = req.body;
        await workspaces_service_1.default.updateMemberRole(req.params.id, req.params.userId, roleId);
        res.json({ success: true, message: '成员角色已更新' });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
exports.default = router;
