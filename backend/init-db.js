const mysql = require('mysql2/promise');
require('dotenv').config();

async function initDatabase() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'db',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'admin',
    password: process.env.DB_PASSWORD || 'admin_password',
    multipleStatements: true
  });

  try {
    console.log('Creating database if not exists...');
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'openclaw_permissions'}`);

    console.log('Using database...');
    await connection.query(`USE ${process.env.DB_NAME || 'openclaw_permissions'}`);

    console.log('Creating tables...');

    // 创建用户表
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('admin', 'user') DEFAULT 'user',
        status ENUM('active', 'disabled', 'pending') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_role (role)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // 创建角色表
    await connection.query(`
      CREATE TABLE IF NOT EXISTS roles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // 创建权限表
    await connection.query(`
      CREATE TABLE IF NOT EXISTS permissions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        description TEXT,
        module VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // 创建菜单表
    await connection.query(`
      CREATE TABLE IF NOT EXISTS menus (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        path VARCHAR(255),
        icon VARCHAR(255),
        parent_id INT DEFAULT NULL,
        sort_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_parent_id (parent_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // 创建角色权限关联表
    await connection.query(`
      CREATE TABLE IF NOT EXISTS role_permissions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        role_id INT NOT NULL,
        permission_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
        FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE,
        UNIQUE KEY unique_role_permission (role_id, permission_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // 创建用户角色关联表
    await connection.query(`
      CREATE TABLE IF NOT EXISTS user_roles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        role_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
        UNIQUE KEY unique_user_role (user_id, role_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    console.log('Inserting initial data...');

    // 插入默认管理员
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('Admin123!', 10);

    await connection.query(`
      INSERT IGNORE INTO users (email, name, password, role, status)
      VALUES (?, ?, ?, ?, ?)
    `, [
      process.env.SUPERADMIN_EMAIL || 'admin@example.com',
      'Super Admin',
      hashedPassword,
      'admin',
      'active'
    ]);

    // 插入默认角色
    await connection.query(`
      INSERT IGNORE INTO roles (name, description)
      VALUES
      ('admin', '系统管理员'),
      ('user', '普通用户')
    `);

    // 插入默认权限
    await connection.query(`
      INSERT IGNORE INTO permissions (name, description, module)
      VALUES
      ('user.read', '查看用户', 'user'),
      ('user.create', '创建用户', 'user'),
      ('user.update', '更新用户', 'user'),
      ('user.delete', '删除用户', 'user'),
      ('role.read', '查看角色', 'role'),
      ('role.create', '创建角色', 'role'),
      ('role.update', '更新角色', 'role'),
      ('role.delete', '删除角色', 'role'),
      ('permission.read', '查看权限', 'permission')
    `);

    // 插入默认菜单
    await connection.query(`
      INSERT IGNORE INTO menus (name, path, icon, sort_order)
      VALUES
      ('用户管理', '/users', 'UserOutlined', 1),
      ('角色管理', '/roles', 'TeamOutlined', 2),
      ('权限管理', '/permissions', 'SafetyOutlined', 3),
      ('菜单管理', '/menus', 'MenuOutlined', 4)
    `);

    console.log('Database initialization completed successfully!');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

initDatabase()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
