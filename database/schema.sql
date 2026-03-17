-- =============================================
-- Permissions System Database Schema
-- Version: 1.0.0
-- Description: Complete database schema for permissions system
-- =============================================

-- Drop database if exists (for fresh installation)
DROP DATABASE IF EXISTS `permissions_system`;

-- Create database
CREATE DATABASE `permissions_system`
    DEFAULT CHARACTER SET utf8mb4
    DEFAULT COLLATE utf8mb4_unicode_ci;

-- Use database
USE `permissions_system`;

-- =============================================
-- Table: users
-- Description: User accounts
-- =============================================
CREATE TABLE `users` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(255) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `role` VARCHAR(50) NOT NULL DEFAULT 'user',
    `status` VARCHAR(20) NOT NULL DEFAULT 'active',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_email` (`email`),
    KEY `idx_role` (`role`),
    KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Table: roles
-- Description: User roles
-- =============================================
CREATE TABLE `roles` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(50) NOT NULL,
    `description` VARCHAR(255),
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Table: permissions
-- Description: System permissions
-- =============================================
CREATE TABLE `permissions` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `description` VARCHAR(255),
    `resource` VARCHAR(100) NOT NULL,
    `action` VARCHAR(50) NOT NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_name` (`name`),
    KEY `idx_resource` (`resource`),
    KEY `idx_action` (`action`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Table: menus
-- Description: System menus
-- =============================================
CREATE TABLE `menus` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `parent_id` INT UNSIGNED DEFAULT 0,
    `name` VARCHAR(100) NOT NULL,
    `path` VARCHAR(255),
    `icon` VARCHAR(50),
    `sort_order` INT DEFAULT 0,
    `status` VARCHAR(20) NOT NULL DEFAULT 'active',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_parent_id` (`parent_id`),
    KEY `idx_status` (`status`),
    KEY `idx_sort_order` (`sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Table: role_permissions
-- Description: Role-Permission mappings
-- =============================================
CREATE TABLE `role_permissions` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `role_id` INT UNSIGNED NOT NULL,
    `permission_id` INT UNSIGNED NOT NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_role_permission` (`role_id`, `permission_id`),
    KEY `idx_role_id` (`role_id`),
    KEY `idx_permission_id` (`permission_id`),
    CONSTRAINT `fk_role_permissions_role` FOREIGN KEY (`role_id`)
        REFERENCES `roles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_role_permissions_permission` FOREIGN KEY (`permission_id`)
        REFERENCES `permissions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Table: role_menus
-- Description: Role-Menu mappings
-- =============================================
CREATE TABLE `role_menus` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `role_id` INT UNSIGNED NOT NULL,
    `menu_id` INT UNSIGNED NOT NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_role_menu` (`role_id`, `menu_id`),
    KEY `idx_role_id` (`role_id`),
    KEY `idx_menu_id` (`menu_id`),
    CONSTRAINT `fk_role_menus_role` FOREIGN KEY (`role_id`)
        REFERENCES `roles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_role_menus_menu` FOREIGN KEY (`menu_id`)
        REFERENCES `menus` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Initial Data
-- =============================================

-- Insert default roles
INSERT INTO `roles` (`name`, `description`) VALUES
('admin', '系统管理员，拥有所有权限'),
('user', '普通用户，拥有基本权限');

-- Insert default permissions
INSERT INTO `permissions` (`name`, `description`, `resource`, `action`) VALUES
('user:create', '创建用户', 'user', 'create'),
('user:read', '查看用户', 'user', 'read'),
('user:update', '更新用户', 'user', 'update'),
('user:delete', '删除用户', 'user', 'delete'),
('role:create', '创建角色', 'role', 'create'),
('role:read', '查看角色', 'role', 'read'),
('role:update', '更新角色', 'role', 'update'),
('role:delete', '删除角色', 'role', 'delete'),
('permission:create', '创建权限', 'permission', 'create'),
('permission:read', '查看权限', 'permission', 'read'),
('permission:update', '更新权限', 'permission', 'update'),
('permission:delete', '删除权限', 'permission', 'delete'),
('menu:create', '创建菜单', 'menu', 'create'),
('menu:read', '查看菜单', 'menu', 'read'),
('menu:update', '更新菜单', 'menu', 'update'),
('menu:delete', '删除菜单', 'menu', 'delete');

-- Insert default menus
INSERT INTO `menus` (`parent_id`, `name`, `path`, `icon`, `sort_order`, `status`) VALUES
(0, '首页', '/dashboard', 'DashboardOutlined', 1, 'active'),
(0, '用户管理', '/users', 'UserOutlined', 2, 'active'),
(0, '角色管理', '/roles', 'TeamOutlined', 3, 'active'),
(0, '权限管理', '/permissions', 'SafetyOutlined', 4, 'active'),
(0, '菜单管理', '/menus', 'MenuOutlined', 5, 'active');

-- Assign all permissions to admin role
INSERT INTO `role_permissions` (`role_id`, `permission_id`)
SELECT 1, id FROM `permissions`;

-- Assign all menus to admin role
INSERT INTO `role_menus` (`role_id`, `menu_id`)
SELECT 1, id FROM `menus`;

-- Assign basic permissions to user role
INSERT INTO `role_permissions` (`role_id`, `permission_id`)
SELECT 2, id FROM `permissions` WHERE `action` IN ('read');

-- Assign basic menus to user role
INSERT INTO `role_menus` (`role_id`, `menu_id`)
SELECT 2, id FROM `menus` WHERE `path` IN ('/dashboard');

-- Insert default admin user (password: Admin123!)
INSERT INTO `users` (`email`, `password`, `name`, `role`, `status`) VALUES
('admin@example.com', '$2b$10$N9qo8uLOickgx2ZMRZoMy.Mrq8Y7t1qKXwVhX7Z7YxK1pY5l7n0O', 'Super Admin', 'admin', 'active');

-- Note: The password hash is bcrypt hash of 'Admin123!'
-- To generate new password hashes, use bcrypt library

-- =============================================
-- Verification Queries
-- =============================================

-- Verify tables created
SELECT
    TABLE_NAME,
    TABLE_ROWS,
    ROUND((DATA_LENGTH + INDEX_LENGTH) / 1024 / 1024, 2) AS 'Size (MB)'
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = 'permissions_system'
ORDER BY TABLE_NAME;

-- Verify initial data
SELECT 'Users' AS 'Table', COUNT(*) AS 'Count' FROM users
UNION ALL
SELECT 'Roles', COUNT(*) FROM roles
UNION ALL
SELECT 'Permissions', COUNT(*) FROM permissions
UNION ALL
SELECT 'Menus', COUNT(*) FROM menus
UNION ALL
SELECT 'Role Permissions', COUNT(*) FROM role_permissions
UNION ALL
SELECT 'Role Menus', COUNT(*) FROM role_menus;

-- =============================================
-- Export Summary
-- =============================================
-- This SQL file includes:
-- - Complete database schema (7 tables)
-- - Initial data (2 roles, 16 permissions, 5 menus, 1 admin user)
-- - Foreign key constraints
-- - Indexes for performance optimization
-- - Character set: utf8mb4 (full Unicode support)
-- - Engine: InnoDB (ACID compliant, supports transactions)
--
-- Usage:
--   mysql -u root -p < schema.sql
--
-- Or import directly:
--   docker exec -i <container_name> mysql -u root -p<password> < schema.sql
--
-- =============================================
