"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requirePermission = requirePermission;
exports.checkPermission = checkPermission;
const permissions_service_1 = __importDefault(require("./permissions.service"));
function requirePermission(resourceType, requiredActions) {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({ error: '未认证' });
            }
            const workspaceId = req.params.workspaceId || req.body.workspaceId || req.workspaceId;
            if (!workspaceId) {
                return res.status(400).json({ error: '缺少工作空间 ID' });
            }
            const hasPermission = await permissions_service_1.default.checkPermission(req.user.userId, workspaceId, {
                resource_type: resourceType,
                resource_id: req.params.id || req.body.resourceId,
                required_actions: requiredActions,
            });
            if (!hasPermission) {
                return res.status(403).json({
                    error: '权限不足',
                    required: requiredActions,
                    resource_type: resourceType,
                });
            }
            next();
        }
        catch (error) {
            console.error('Permission check error:', error);
            res.status(500).json({ error: '权限检查失败' });
        }
    };
}
function checkPermission(resourceType, requiredActions) {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({ error: '未认证' });
            }
            const workspaceId = req.params.workspaceId || req.body.workspaceId || req.workspaceId;
            if (!workspaceId) {
                // 没有 workspaceId 时，跳过权限检查
                return next();
            }
            const hasPermission = await permissions_service_1.default.checkPermission(req.user.userId, workspaceId, {
                resource_type: resourceType,
                resource_id: req.params.id || req.body.resourceId,
                required_actions: requiredActions,
            });
            if (hasPermission) {
                req.workspaceId = workspaceId;
            }
            next();
        }
        catch (error) {
            console.error('Permission check error:', error);
            next();
        }
    };
}
