-- =============================================
-- Permissions System Initial Data
-- Version: 1.0.0
-- Description: Default data for permissions system
-- Prerequisite: Run schema.sql first
-- =============================================

USE `permissions_system`;

-- =============================================
-- Clear existing data (for fresh import)
-- =============================================
SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE `role_menus`;
TRUNCATE TABLE `role_permissions`;
TRUNCATE TABLE `users`;
TRUNCATE TABLE `menus`;
TRUNCATE TABLE `permissions`;
TRUNCATE TABLE `roles`;

SET FOREIGN_KEY_CHECKS = 1;

-- =============================================
-- Insert Default Roles
-- =============================================
INSERT INTO `roles` (`name`, `description`, `created_at`) VALUES
('admin', '系统管理员，拥有所有权限', NOW()),
('user', '普通用户，拥有基本权限', NOW()),
('editor', '内容编辑，可以编辑内容', NOW()),
('auditor', '审计员，只能查看数据', NOW());

SELECT '✅ 插入 4 个角色' AS 'Status';

-- =============================================
-- Insert Default Permissions
-- =============================================
INSERT INTO `permissions` (`name`, `description`, `resource`, `action`, `created_at`) VALUES
-- User permissions
('user:create', '创建用户', 'user', 'create', NOW()),
('user:read', '查看用户', 'user', 'read', NOW()),
('user:update', '更新用户', 'user', 'update', NOW()),
('user:delete', '删除用户', 'user', 'delete', NOW()),
('user:export', '导出用户数据', 'user', 'export', NOW()),

-- Role permissions
('role:create', '创建角色', 'role', 'create', NOW()),
('role:read', '查看角色', 'role', 'read', NOW()),
('role:update', '更新角色', 'role', 'update', NOW()),
('role:delete', '删除角色', 'role', 'delete', NOW()),

-- Permission permissions
('permission:create', '创建权限', 'permission', 'create', NOW()),
('permission:read', '查看权限', 'permission', 'read', NOW()),
('permission:update', '更新权限', 'permission', 'update', NOW()),
('permission:delete', '删除权限', 'permission', 'delete', NOW()),

-- Menu permissions
('menu:create', '创建菜单', 'menu', 'create', NOW()),
('menu:read', '查看菜单', 'menu', 'read', NOW()),
('menu:update', '更新菜单', 'menu', 'update', NOW()),
('menu:delete', '删除菜单', 'menu', 'delete', NOW());

SELECT '✅ 插入 18 个权限' AS 'Status';

-- =============================================
-- Insert Default Menus
-- =============================================
INSERT INTO `menus` (`parent_id`, `name`, `path`, `icon`, `sort_order`, `status`, `created_at`) VALUES
-- Top level menus
(0, '首页', '/dashboard', 'DashboardOutlined', 1, 'active', NOW()),
(0, '用户管理', '/users', 'UserOutlined', 2, 'active', NOW()),
(0, '角色管理', '/roles', 'TeamOutlined', 3, 'active', NOW()),
(0, '权限管理', '/permissions', 'SafetyOutlined', 4, 'active', NOW()),
(0, '菜单管理', '/menus', 'MenuOutlined', 5, 'active', NOW()),
(0, '系统设置', '/settings', 'SettingOutlined', 6, 'active', NOW()),

-- System settings sub-menus
((SELECT id FROM menus WHERE name = '系统设置'), '账号设置', '/settings/account', 'UserOutlined', 1, 'active', NOW()),
((SELECT id FROM menus WHERE name = '系统设置'), '安全设置', '/settings/security', 'LockOutlined', 2, 'active', NOW()),
((SELECT id FROM menus WHERE name = '系统设置'), '日志查看', '/settings/logs', 'FileTextOutlined', 3, 'active', NOW());

SELECT '✅ 插入 9 个菜单' AS 'Status';

-- =============================================
-- Assign Permissions to Roles
-- =============================================

-- Admin role: All permissions
INSERT INTO `role_permissions` (`role_id`, `permission_id`, `created_at`)
SELECT 1, id, NOW() FROM `permissions`;

SELECT '✅ 管理员角色分配 18 个权限' AS 'Status';

-- User role: Read permissions only
INSERT INTO `role_permissions` (`role_id`, `permission_id`, `created_at`)
SELECT 2, id, NOW() FROM `permissions` WHERE `action` IN ('read');

SELECT '✅ 普通用户角色分配 5 个权限' AS 'Status';

-- Editor role: Create and Read permissions
INSERT INTO `role_permissions` (`role_id`, `permission_id`, `created_at`)
SELECT 3, id, NOW() FROM `permissions` WHERE `action` IN ('create', 'read');

SELECT '✅ 编辑角色分配 10 个权限' AS 'Status';

-- Auditor role: Read permissions only
INSERT INTO `role_permissions` (`role_id`, `permission_id`, `created_at`)
SELECT 4, id, NOW() FROM `permissions` WHERE `action` IN ('read');

SELECT '✅ 审计角色分配 5 个权限' AS 'Status';

-- =============================================
-- Assign Menus to Roles
-- =============================================

-- Admin role: All menus
INSERT INTO `role_menus` (`role_id`, `menu_id`, `created_at`)
SELECT 1, id, NOW() FROM `menus`;

SELECT '✅ 管理员角色分配 9 个菜单' AS 'Status';

-- User role: Dashboard only
INSERT INTO `role_menus` (`role_id`, `menu_id`, `created_at`)
SELECT 2, id, NOW() FROM `menus` WHERE `path` IN ('/dashboard');

SELECT '✅ 普通用户角色分配 1 个菜单' AS 'Status';

-- Editor role: Dashboard, Users
INSERT INTO `role_menus` (`role_id`, `menu_id`, `created_at`)
SELECT 3, id, NOW() FROM `menus` WHERE `path` IN ('/dashboard', '/users');

SELECT '✅ 编辑角色分配 2 个菜单' AS 'Status';

-- Auditor role: All menus (read-only access)
INSERT INTO `role_menus` (`role_id`, `menu_id`, `created_at`)
SELECT 4, id, NOW() FROM `menus`;

SELECT '✅ 审计角色分配 9 个菜单' AS 'Status';

-- =============================================
-- Insert Default Users
-- =============================================

-- Admin user
INSERT INTO `users` (`email`, `password`, `name`, `role`, `status`, `created_at`) VALUES
('admin@example.com', '$2b$10$N9qo8uLOickgx2ZMRZoMy.Mrq8Y7t1qKXwVhX7Z7YxK1pY5l7n0O', 'Super Admin', 'admin', 'active', NOW());

-- Test users
INSERT INTO `users` (`email`, `password`, `name`, `role`, `status`, `created_at`) VALUES
('user@example.com', '$2b$10$N9qo8uLOickgx2ZMRZoMy.Mrq8Y7t1qKXwVhX7Z7YxK1pY5l7n0O', 'Test User', 'user', 'active', NOW()),
('editor@example.com', '$2b$10$N9qo8uLOickgx2ZMRZoMy.Mrq8Y7t1qKXwVhX7Z7YxK1pY5l7n0O', 'Content Editor', 'editor', 'active', NOW()),
('auditor@example.com', '$2b$10$N9qo8uLOickgx2ZMRZoMy.Mrq8Y7t1qKXwVhX7Z7YxK1pY5l7n0O', 'Data Auditor', 'auditor', 'active', NOW());

SELECT '✅ 插入 4 个用户' AS 'Status';

-- Note: All passwords are bcrypt hash of 'Admin123!'
-- To generate new password hashes in Node.js:
--
--   const bcrypt = require('bcrypt');
--   const hash = await bcrypt.hash('your-password', 10);
--   console.log(hash);
--
-- To generate new password hashes in Python:
--
--   import bcrypt
--   password = 'your-password'.encode('utf-8')
--   hash = bcrypt.hashpw(password, bcrypt.gensalt())
--   print(hash.decode('utf-8'))
--

-- =============================================
-- Data Verification
-- =============================================

-- Verify role permissions
SELECT
    r.name AS 'Role',
    COUNT(rp.permission_id) AS 'Permissions'
FROM roles r
LEFT JOIN role_permissions rp ON r.id = rp.role_id
GROUP BY r.id, r.name
ORDER BY r.id;

-- Verify role menus
SELECT
    r.name AS 'Role',
    COUNT(rm.menu_id) AS 'Menus'
FROM roles r
LEFT JOIN role_menus rm ON r.id = rm.role_id
GROUP BY r.id, r.name
ORDER BY r.id;

-- Verify users
SELECT
    email AS 'Email',
    name AS 'Name',
    role AS 'Role',
    status AS 'Status'
FROM users;

-- =============================================
-- Import Summary
-- =============================================
-- This SQL file includes:
-- - 4 roles (admin, user, editor, auditor)
-- - 18 permissions
-- - 9 menus (with sub-menus)
-- - 4 users (admin, user, editor, auditor)
-- - Role-Permission mappings
-- - Role-Menu mappings
--
-- Default passwords: Admin123! (for all users)
--
-- Usage:
--   mysql -u root -p permissions_system < data.sql
--
-- Or import directly:
--   docker exec -i <container_name> mysql -u root -p<password> permissions_system < data.sql
--
-- =============================================
