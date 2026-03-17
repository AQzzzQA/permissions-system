"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = authMiddleware;
exports.superAdminMiddleware = superAdminMiddleware;
exports.optionalAuthMiddleware = optionalAuthMiddleware;
const auth_service_1 = __importDefault(require("./auth.service"));
function authMiddleware(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: '未提供认证 token' });
        }
        const token = authHeader.substring(7);
        const decoded = auth_service_1.default.verifyToken(token);
        req.user = { userId: decoded.userId, isSuperAdmin: decoded.isSuperAdmin };
        next();
    }
    catch (error) {
        return res.status(401).json({ error: '无效的 token' });
    }
}
// 只有超级管理员可以访问
function superAdminMiddleware(req, res, next) {
    if (!req.user || !req.user.isSuperAdmin) {
        return res.status(403).json({ error: '需要超级管理员权限' });
    }
    next();
}
function optionalAuthMiddleware(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            const decoded = auth_service_1.default.verifyToken(token);
            req.user = { userId: decoded.userId, isSuperAdmin: decoded.isSuperAdmin };
        }
        next();
    }
    catch (error) {
        // 静默失败，不要求认证
        next();
    }
}
