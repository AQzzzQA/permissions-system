"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const auth_service_1 = __importDefault(require("./auth.service"));
const auth_middleware_1 = require("./auth.middleware");
const router = (0, express_1.Router)();
// 注册
router.post('/register', [
    (0, express_validator_1.body)('username').trim().isLength({ min: 3, max: 50 }).withMessage('用户名长度必须在 3-50 字符之间'),
    (0, express_validator_1.body)('email').isEmail().withMessage('邮箱格式不正确'),
    (0, express_validator_1.body)('password').isLength({ min: 6 }).withMessage('密码长度至少 6 个字符'),
], async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const input = req.body;
        const result = await auth_service_1.default.register(input);
        res.status(201).json({
            success: true,
            user: result.user,
            token: result.token,
        });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
// 登录
router.post('/login', [
    (0, express_validator_1.body)('email').isEmail().withMessage('邮箱格式不正确'),
    (0, express_validator_1.body)('password').notEmpty().withMessage('密码不能为空'),
], async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const input = req.body;
        const result = await auth_service_1.default.login(input);
        res.json({
            success: true,
            user: result.user,
            token: result.token,
        });
    }
    catch (error) {
        res.status(401).json({ error: error.message });
    }
});
// 获取当前用户信息
router.get('/me', auth_middleware_1.authMiddleware, async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: '未认证' });
        }
        const user = await auth_service_1.default.getUserById(req.user.userId);
        if (!user) {
            return res.status(404).json({ error: '用户不存在' });
        }
        res.json({ success: true, user });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// 修改密码
router.put('/password', auth_middleware_1.authMiddleware, [
    (0, express_validator_1.body)('oldPassword').notEmpty().withMessage('旧密码不能为空'),
    (0, express_validator_1.body)('newPassword').isLength({ min: 6 }).withMessage('新密码长度至少 6 个字符'),
], async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        if (!req.user) {
            return res.status(401).json({ error: '未认证' });
        }
        const { oldPassword, newPassword } = req.body;
        await auth_service_1.default.changePassword(req.user.userId, oldPassword, newPassword);
        res.json({ success: true, message: '密码修改成功' });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
exports.default = router;
