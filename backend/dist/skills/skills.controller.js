"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const workspaces_service_1 = __importDefault(require("../workspaces/workspaces.service"));
const skills_service_1 = __importDefault(require("./skills.service"));
const auth_middleware_1 = require("../auth/auth.middleware");
const router = (0, express_1.Router)();
// Discover API 不需要认证（公开访问）
// 获取技能发现列表
router.get('/discover', async (req, res) => {
    try {
        const { source = 'skillhub', keyword } = req.query;
        // 获取技能列表
        const skills = await skills_service_1.default.discoverSkills(source, keyword);
        res.json({ success: true, skills });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// 其他所有路由都需要认证
router.use(auth_middleware_1.authMiddleware);
// 获取工作空间可安装技能列表
router.get('/workspace/:workspaceId/skills', async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: '未认证' });
        }
        const { workspaceId } = req.params;
        // 检查用户是否有访问工作空间的权限
        const hasAccess = await workspaces_service_1.default.checkPermission(req.user.userId, workspaceId, 'skill.read');
        if (!hasAccess) {
            return res.status(403).json({ error: '没有权限访问此工作空间' });
        }
        // 获取技能列表（从本地 registry 和技能中心）
        const skills = await skills_service_1.default.getAvailableSkills();
        // 获取已安装的技能
        const installedSkills = await skills_service_1.default.getInstalledSkills(workspaceId);
        const result = skills.map(skill => ({
            ...skill,
            installed: installedSkills.some(installed => installed.skill_id === skill.id),
            installedVersion: installedSkills.find(installed => installed.skill_id === skill.id)?.installed_version || null
        }));
        res.json({ success: true, skills: result });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// 安装技能到工作空间
router.post('/workspace/:workspaceId/skills', [
    (0, express_validator_1.body)('skillId').notEmpty().withMessage('技能 ID 不能为空'),
    (0, express_validator_1.body)('version').optional(),
    (0, express_validator_1.body)('config').optional()
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        if (!req.user) {
            return res.status(401).json({ error: '未认证' });
        }
        const { workspaceId } = req.params;
        const { skillId, version = 'latest', config = {} } = req.body;
        // 检查用户是否有安装权限
        const hasPermission = await workspaces_service_1.default.checkPermission(req.user.userId, workspaceId, 'skill.install');
        if (!hasPermission) {
            return res.status(403).json({ error: '没有权限安装技能' });
        }
        // 获取技能信息
        const skill = await skills_service_1.default.getSkillById(skillId);
        if (!skill) {
            return res.status(404).json({ error: '未找到该技能' });
        }
        // 检查依赖和冲突
        const dependencyCheck = await skills_service_1.default.checkSkillDependencies(skill);
        if (!dependencyCheck.success) {
            return res.status(400).json({ error: dependencyCheck.error });
        }
        // 如果版本是 latest，使用技能的最新版本
        const installVersion = version === 'latest' ? skill.version : version;
        // 安装技能
        const result = await skills_service_1.default.installSkillToWorkspace(workspaceId, skillId, installVersion, req.user.userId, config);
        // 记录成功日志
        await skills_service_1.default.logSkillInstall(workspaceId, skillId, req.user.userId, 'install', result.installed_version, 'success');
        res.status(201).json({ success: true, installation: result });
    }
    catch (error) {
        const { workspaceId } = req.params;
        const { skillId, version = 'unknown' } = req.body;
        // 记录失败日志
        if (req.user) {
            await skills_service_1.default.logSkillInstall(workspaceId, skillId, req.user.userId, 'install', version, 'failed', error.message);
        }
        res.status(400).json({ error: error.message });
    }
});
// 卸载技能
router.delete('/workspace/:workspaceId/skills/:skillId', async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: '未认证' });
        }
        const { workspaceId, skillId } = req.params;
        // 检查用户是否有卸载权限
        if (!req.user) {
            return res.status(401).json({ error: '未认证' });
        }
        const hasPermission = await workspaces_service_1.default.checkPermission(req.user.userId, workspaceId, 'skill.delete');
        if (!hasPermission) {
            return res.status(403).json({ error: '没有权限卸载此技能' });
        }
        // 获取当前安装信息
        const installed = await skills_service_1.default.getSkillInstallation(workspaceId, skillId);
        if (!installed) {
            return res.status(404).json({ error: '未找到该技能的安装记录' });
        }
        // 卸载技能
        await skills_service_1.default.uninstallSkillFromWorkspace(workspaceId, skillId, req.user.userId);
        // 记录卸载日志
        await skills_service_1.default.logSkillInstall(workspaceId, skillId, req.user.userId, 'uninstall', installed.installed_version, 'success');
        res.json({ success: true, message: '技能卸载成功' });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// 获取技能配置
router.get('/workspace/:workspaceId/skills/:skillId/config', async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: '未认证' });
        }
        const { workspaceId, skillId } = req.params;
        // 检查用户是否有读取配置权限
        if (!req.user) {
            return res.status(401).json({ error: '未认证' });
        }
        const hasPermission = await workspaces_service_1.default.checkPermission(req.user.userId, workspaceId, 'skill.read');
        if (!hasPermission) {
            return res.status(403).json({ error: '没有权限读取此技能配置' });
        }
        // 获取配置
        const installed = await skills_service_1.default.getSkillInstallation(workspaceId, skillId);
        if (!installed) {
            return res.status(404).json({ error: '未找到该技能的安装记录' });
        }
        res.json({ success: true, config: installed.config || {} });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// 更新技能配置
router.put('/workspace/:workspaceId/skills/:skillId/config', async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: '未认证' });
        }
        const { workspaceId, skillId } = req.params;
        const { config } = req.body;
        // 检查用户是否有写入配置权限
        const hasPermission = await workspaces_service_1.default.checkPermission(req.user.userId, workspaceId, 'skill.write');
        if (!hasPermission) {
            return res.status(403).json({ error: '没有权限修改此技能配置' });
        }
        // 更新配置
        await skills_service_1.default.updateSkillConfig(workspaceId, skillId, config);
        // 记录更新日志
        const installed = await skills_service_1.default.getSkillInstallation(workspaceId, skillId);
        if (installed && req.user) {
            await skills_service_1.default.logSkillInstall(workspaceId, skillId, req.user.userId, 'update', installed.installed_version, 'success');
        }
        res.json({ success: true, message: '配置更新成功', config });
    }
    catch (error) {
        const { workspaceId, skillId } = req.params;
        // 记录失败日志
        const installed = await skills_service_1.default.getSkillInstallation(workspaceId, skillId);
        if (installed && req.user) {
            await skills_service_1.default.logSkillInstall(workspaceId, skillId, req.user.userId, 'update', installed.installed_version || 'unknown', 'failed', error.message);
        }
        res.status(500).json({ error: error.message });
    }
});
// 获取技能安装日志
router.get('/workspace/:workspaceId/skills/logs', async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: '未认证' });
        }
        const { workspaceId } = req.params;
        // 检查用户是否有访问权限
        const hasAccess = await workspaces_service_1.default.checkPermission(req.user.userId, workspaceId, 'skill.read');
        if (!hasAccess) {
            return res.status(403).json({ error: '没有权限访问此工作空间' });
        }
        const logs = await skills_service_1.default.loadInstallLogs(workspaceId);
        res.json({ success: true, logs });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.default = router;
