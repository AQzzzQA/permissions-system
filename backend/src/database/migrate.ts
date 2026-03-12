import pool from './database';

async function migrate() {
  console.log('🚀 Starting database migration...');

  const connection = await pool.getConnection();

  try {
    // 创建 users 表
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(36) PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        status ENUM('active', 'disabled', 'pending') DEFAULT 'pending',
        is_superuser TINYINT(1) DEFAULT 0,
        qq VARCHAR(20) UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_username (username),
        INDEX idx_superuser (is_superuser),
        INDEX idx_qq (qq)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Users table created');

    // 创建 workspaces 表
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS workspaces (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        owner_id VARCHAR(36) NOT NULL,
        description TEXT,
        config JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_owner (owner_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Workspaces table created');

    // 创建 roles 表
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS roles (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(50) NOT NULL,
        description TEXT,
        scopes JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_name (name)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Roles table created');

    // 创建 workspace_members 表
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS workspace_members (
        id VARCHAR(36) PRIMARY KEY,
        workspace_id VARCHAR(36) NOT NULL,
        user_id VARCHAR(36) NOT NULL,
        role_id VARCHAR(36) NOT NULL,
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
        UNIQUE KEY unique_member (workspace_id, user_id),
        INDEX idx_workspace (workspace_id),
        INDEX idx_user (user_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Workspace members table created');

    // 创建 permissions 表
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS permissions (
        id VARCHAR(36) PRIMARY KEY,
        resource_type ENUM('workspace', 'session', 'skill', 'channel', 'config') NOT NULL,
        resource_id VARCHAR(36),
        user_id VARCHAR(36),
        role_id VARCHAR(36),
        actions JSON NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
        INDEX idx_resource (resource_type, resource_id),
        INDEX idx_user (user_id),
        INDEX idx_role (role_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Permissions table created');

    // 创建 user_sessions 表
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS user_sessions (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        workspace_id VARCHAR(36) NOT NULL,
        session_key VARCHAR(100) NOT NULL,
        metadata JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
        UNIQUE KEY unique_session (user_id, workspace_id, session_key),
        INDEX idx_session_key (session_key)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ User sessions table created');

    // 创建 invite_codes 表
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS invite_codes (
        id VARCHAR(36) PRIMARY KEY,
        code VARCHAR(32) UNIQUE NOT NULL,
        workspace_id VARCHAR(36),
        max_uses INT DEFAULT 1,
        used_count INT DEFAULT 0,
        status ENUM('active', 'expired', 'disabled') DEFAULT 'active',
        expires_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_by VARCHAR(36),
        FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_code (code),
        INDEX idx_workspace (workspace_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Invite codes table created');

    // 插入默认角色
    const defaultRoles = [
      {
        id: 'role-owner',
        name: 'Workspace Owner',
        description: '工作空间所有者，拥有完全控制权限',
        scopes: JSON.stringify([
          'workspace.read', 'workspace.write', 'workspace.admin',
          'session.read', 'session.write', 'session.delete',
          'skill.read', 'skill.write', 'skill.delete',
          'channel.read', 'channel.write', 'channel.delete',
          'config.read', 'config.write', 'config.delete'
        ])
      },
      {
        id: 'role-admin',
        name: 'Workspace Admin',
        description: '工作空间管理员，可以管理资源但不能删除工作空间',
        scopes: JSON.stringify([
          'workspace.read', 'workspace.write',
          'session.read', 'session.write', 'session.delete',
          'skill.read', 'skill.write',
          'channel.read', 'channel.write',
          'config.read', 'config.write'
        ])
      },
      {
        id: 'role-member',
        name: 'Workspace Member',
        description: '工作空间成员，只能访问分配的资源',
        scopes: JSON.stringify([
          'workspace.read',
          'session.read', 'session.write',
          'skill.read',
          'channel.read'
        ])
      },
      {
        id: 'role-viewer',
        name: 'Viewer',
        description: '只读用户，只能查看资源',
        scopes: JSON.stringify([
          'workspace.read',
          'session.read',
          'skill.read',
          'channel.read'
        ])
      }
    ];

    for (const role of defaultRoles) {
      await connection.execute(
        'INSERT IGNORE INTO roles (id, name, description, scopes) VALUES (?, ?, ?, ?)',
        [role.id, role.name, role.description, role.scopes]
      );
    }
    console.log('✅ Default roles inserted');

    console.log('🎉 Database migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    connection.release();
  }
}

// 运行迁移
migrate().catch(console.error);
