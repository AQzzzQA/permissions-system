"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.discoverSkills = discoverSkills;
exports.getAvailableSkills = getAvailableSkills;
exports.getSkillById = getSkillById;
exports.getSkillInstallation = getSkillInstallation;
exports.getInstalledSkills = getInstalledSkills;
exports.installSkillToWorkspace = installSkillToWorkspace;
exports.uninstallSkillFromWorkspace = uninstallSkillFromWorkspace;
exports.updateSkillConfig = updateSkillConfig;
exports.logSkillInstall = logSkillInstall;
exports.checkSkillDependencies = checkSkillDependencies;
exports.checkPermission = checkPermission;
exports.installSkillDependencies = installSkillDependencies;
exports.loadInstallLogs = loadInstallLogs;
const child_process_1 = require("child_process");
const util_1 = require("util");
const exec = (0, util_1.promisify)(child_process_1.exec);
const database_1 = require("../database/database");
exports.default = {
    discoverSkills,
    getAvailableSkills,
    getSkillById,
    getSkillInstallation,
    getInstalledSkills,
    installSkillToWorkspace,
    uninstallSkillFromWorkspace,
    updateSkillConfig,
    checkSkillDependencies,
    logSkillInstall,
    loadInstallLogs,
    checkPermission,
    installSkillDependencies
};
// 从 skillhub 发现技能
async function discoverSkills(source = 'skillhub', keyword) {
    try {
        // 优先从本地数据库获取（快速响应）
        const localSkills = await getAvailableSkills();
        // 如果有本地技能，直接返回（避免 CLI 调用问题）
        if (localSkills.length > 0) {
            return localSkills;
        }
        if (source === 'skillhub') {
            // 使用 skillhub CLI 搜索（增加超时和错误处理）
            let command = 'skillhub search';
            if (keyword) {
                command += ` ${keyword}`;
            }
            try {
                console.log(`Executing: ${command}`);
                const { stdout } = await exec(command, { timeout: 5000 });
                console.log('skillhub search output length:', stdout.length);
                // 解析 skillhub 输出
                const skills = parseSkillhubOutput(stdout);
                console.log('Parsed skills from skillhub:', skills.length);
                // 如果成功解析到技能，返回结果；否则返回本地数据
                return skills.length > 0 ? skills : localSkills;
            }
            catch (error) {
                console.error('skillhub search failed:', error.message);
                // 降级到本地数据库
                return localSkills;
            }
        }
        else if (source === 'clawhub') {
            // 使用 clawhub CLI 搜索
            let command = 'clawhub search';
            if (keyword) {
                command += ` ${keyword}`;
            }
            try {
                console.log(`Executing: ${command}`);
                const { stdout } = await exec(command, { timeout: 5000 });
                console.log('clawhub search output length:', stdout.length);
                // 解析 clawhub 输出
                const skills = parseClawhubOutput(stdout);
                console.log('Parsed skills from clawhub:', skills.length);
                return skills.length > 0 ? skills : localSkills;
            }
            catch (error) {
                console.error('clawhub search failed:', error.message);
                // 降级到本地数据库
                return localSkills;
            }
        }
        // 默认从本地数据库获取
        return localSkills;
    }
    catch (error) {
        console.error('发现技能失败:', error);
        return await getAvailableSkills();
    }
}
// 解析 skillhub 输出
function parseSkillhubOutput(output) {
    try {
        // 尝试解析 JSON
        if (output.trim().startsWith('[') || output.trim().startsWith('{')) {
            return JSON.parse(output);
        }
        // 解析表格格式（备用方案）
        const lines = output.split('\n').filter(line => line.trim());
        const skills = [];
        let currentSkill = null;
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            // 检测新技能的开始 [序号]
            if (line.match(/^\[\d+\]/)) {
                if (currentSkill) {
                    skills.push(currentSkill);
                }
                currentSkill = {
                    id: `skillhub-${skills.length + 1}`,
                    source: 'skillhub',
                    name: '',
                    description: '',
                    rating: 0,
                    downloads: 0
                };
            }
            // 解析第一行（ID 和名称）
            const match1 = line.match(/^\[\d+\]\s+(.+?)\s+●+$/);
            if (match1 && currentSkill) {
                const idAndName = match1[1].trim();
                // 提取名称（移除末尾版本号等）
                currentSkill.id = idAndName;
                currentSkill.name = idAndName;
            }
            // 解析下载和星数行
            const match2 = line.match(/⬇\s+(\d+)\s+⭐\s+([\d.]+[kM]?)\s+(.+)$/);
            if (match2 && currentSkill) {
                currentSkill.downloads = parseInt(match2[1]);
                currentSkill.rating = match2[2];
                currentSkill.description = match2[3];
            }
        }
        // 添加最后一个技能
        if (currentSkill && currentSkill.id) {
            skills.push(currentSkill);
        }
        return skills;
    }
    catch (error) {
        console.error('解析 skillhub 输出失败:', error);
        return [];
    }
}
// 解析 clawhub 输出
function parseClawhubOutput(output) {
    try {
        // 尝试解析 JSON
        if (output.trim().startsWith('[') || output.trim().startsWith('{')) {
            return JSON.parse(output);
        }
        // 解析表格格式（备用方案）
        const lines = output.split('\n').filter(line => line.trim());
        const skills = [];
        for (const line of lines) {
            if (line.includes('─') || line.toLowerCase().includes('name'))
                continue;
            const parts = line.split(/\s+/).filter(p => p);
            if (parts.length >= 2) {
                skills.push({
                    name: parts[0],
                    description: parts.slice(1).join(' '),
                    source: 'clawhub'
                });
            }
        }
        return skills;
    }
    catch (error) {
        console.error('解析 clawhub 输出失败:', error);
        return [];
    }
}
// 获取可用技能列表
async function getAvailableSkills() {
    try {
        const connection = await database_1.pool.getConnection();
        const [skills] = await connection.execute('SELECT * FROM skills WHERE is_public = true ORDER BY rating DESC, download_count DESC');
        connection.release();
        return skills.map((skill) => ({
            ...skill,
            tags: skill.tags ? JSON.parse(skill.tags) : [],
            rating: parseFloat(skill.rating),
            created_at: new Date(skill.created_at),
            updated_at: new Date(skill.updated_at)
        }));
    }
    catch (error) {
        console.error('获取技能列表失败:', error);
        return [];
    }
}
// 根据 ID 获取技能
async function getSkillById(skillId) {
    try {
        const connection = await database_1.pool.getConnection();
        const [skills] = await connection.execute('SELECT * FROM skills WHERE id = ?', [skillId]);
        connection.release();
        if (skills.length === 0) {
            return null;
        }
        const skill = skills[0];
        skill.tags = skill.tags ? JSON.parse(skill.tags) : [];
        skill.rating = parseFloat(skill.rating);
        return skill;
    }
    catch (error) {
        console.error('获取技能失败:', error);
        return null;
    }
}
// 检查技能安装
async function getSkillInstallation(workspaceId, skillId) {
    try {
        const connection = await database_1.pool.getConnection();
        const [installations] = await connection.execute('SELECT * FROM workspace_skills WHERE workspace_id = ? AND skill_id = ?', [workspaceId, skillId]);
        connection.release();
        if (installations.length === 0) {
            return null;
        }
        const installation = installations[0];
        installation.config = installation.config ? JSON.parse(installation.config) : {};
        return installation;
    }
    catch (error) {
        console.error('获取技能安装信息失败:', error);
        return null;
    }
}
// 获取工作空间的已安装技能
async function getInstalledSkills(workspaceId) {
    try {
        const connection = await database_1.pool.getConnection();
        const [installations] = await connection.execute(`SELECT ws.*, s.name, s.description, s.version, s.author, s.category, s.tags, s.rating
             FROM workspace_skills ws
             JOIN skills s ON ws.skill_id = s.id
             WHERE ws.workspace_id = ? AND ws.status = 'active'
             ORDER BY ws.installed_at DESC`, [workspaceId]);
        connection.release();
        return installations.map((installation) => ({
            ...installation,
            config: installation.config ? JSON.parse(installation.config) : {},
            tags: installation.tags ? JSON.parse(installation.tags) : [],
            rating: parseFloat(installation.rating)
        }));
    }
    catch (error) {
        console.error('获取已安装技能失败:', error);
        return [];
    }
}
// 安装技能到工作空间
async function installSkillToWorkspace(workspaceId, skillId, version, userId, config = {}) {
    try {
        const installationId = require('uuid').v4();
        const now = new Date();
        const connection = await database_1.pool.getConnection();
        // 检查是否已安装
        const [existing] = await connection.execute('SELECT * FROM workspace_skills WHERE workspace_id = ? AND skill_id = ?', [workspaceId, skillId]);
        if (existing.length > 0) {
            // 如果已存在，更新为活跃状态
            await connection.execute(`UPDATE workspace_skills 
                 SET status = 'active', installed_version = ?, installed_by = ?, config = ?, updated_at = ?
                 WHERE workspace_id = ? AND skill_id = ?`, [version, userId, JSON.stringify(config), now, workspaceId, skillId]);
        }
        else {
            // 插入新的安装记录
            await connection.execute(`INSERT INTO workspace_skills 
                 (id, workspace_id, skill_id, installed_version, installed_by, installed_at, status, config)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [installationId, workspaceId, skillId, version, userId, now, 'active', JSON.stringify(config)]);
        }
        // 更新技能下载计数
        await connection.execute('UPDATE skills SET download_count = download_count + 1 WHERE id = ?', [skillId]);
        connection.release();
        const installation = await getSkillInstallation(workspaceId, skillId);
        if (!installation) {
            throw new Error('安装技能后无法获取安装信息');
        }
        return installation;
    }
    catch (error) {
        console.error('安装技能失败:', error);
        throw error;
    }
}
// 卸载技能
async function uninstallSkillFromWorkspace(workspaceId, skillId, userId) {
    try {
        const connection = await database_1.pool.getConnection();
        await connection.execute(`UPDATE workspace_skills 
             SET status = 'uninstalled', updated_at = ?
             WHERE workspace_id = ? AND skill_id = ?`, [new Date(), workspaceId, skillId]);
        connection.release();
    }
    catch (error) {
        console.error('卸载技能失败:', error);
        throw error;
    }
}
// 更新技能配置
async function updateSkillConfig(workspaceId, skillId, config) {
    try {
        const connection = await database_1.pool.getConnection();
        await connection.execute(`UPDATE workspace_skills 
             SET config = ?, updated_at = ?
             WHERE workspace_id = ? AND skill_id = ?`, [JSON.stringify(config), new Date(), workspaceId, skillId]);
        connection.release();
    }
    catch (error) {
        console.error('更新技能配置失败:', error);
        throw error;
    }
}
// 记录安装日志
async function logSkillInstall(workspaceId, skillId, userId, action, version, status, errorMessage) {
    try {
        const logId = require('uuid').v4();
        const connection = await database_1.pool.getConnection();
        await connection.execute(`INSERT INTO skill_install_logs 
             (id, workspace_id, skill_id, user_id, action, version, status, error_message, installed_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, [logId, workspaceId, skillId, userId, action, version, status, errorMessage, new Date()]);
        connection.release();
    }
    catch (error) {
        console.error('记录安装日志失败:', error);
    }
}
// 检查技能依赖
async function checkSkillDependencies(skill) {
    try {
        // 这里可以添加依赖检查逻辑
        // 例如检查技能是否与其他技能冲突
        // 检查版本兼容性等
        return { success: true };
    }
    catch (error) {
        return { success: false, error: error.message };
    }
}
// 检查权限
async function checkPermission(userId, skillId, action) {
    try {
        // 这里可以添加权限检查逻辑
        // 例如检查用户角色是否有技能操作权限
        // 检查技能权限表中的配置等
        // 暂时返回 true（允许所有操作）
        return true;
    }
    catch (error) {
        console.error('检查权限失败:', error);
        return false;
    }
}
// 安装技能依赖
async function installSkillDependencies(skillId, workspaceId, version, userId) {
    try {
        // 这里可以添加依赖安装逻辑
        // 例如自动安装依赖的技能
        // 暂时为空实现
    }
    catch (error) {
        console.error('安装技能依赖失败:', error);
        throw error;
    }
}
// 获取技能安装日志
async function loadInstallLogs(workspaceId) {
    try {
        const connection = await database_1.pool.getConnection();
        const [logs] = await connection.execute(`SELECT sil.*, u.username, s.name as skill_name
             FROM skill_install_logs sil
             JOIN users u ON sil.user_id = u.id
             JOIN skills s ON sil.skill_id = s.id
             WHERE sil.workspace_id = ?
             ORDER BY sil.installed_at DESC
             LIMIT 100`, [workspaceId]);
        connection.release();
        return logs;
    }
    catch (error) {
        console.error('获取安装日志失败:', error);
        return [];
    }
}
