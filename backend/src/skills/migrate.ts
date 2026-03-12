import pool from '../database/database';

async function migrate() {
  console.log('🚀 Starting skills database migration...');

  const connection = await pool.getConnection();

  try {
    // 创建技能表
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS skills (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        version VARCHAR(20) NOT NULL,
        author VARCHAR(100),
        category VARCHAR(50),
        tags JSON,
        rating DECIMAL(3,2) DEFAULT 0,
        download_count INT DEFAULT 0,
        is_public BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_name_version (name, version)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Skills table created');

    // 创建工作空间技能表
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS workspace_skills (
        id VARCHAR(36) PRIMARY KEY,
        workspace_id VARCHAR(36) NOT NULL,
        skill_id VARCHAR(36) NOT NULL,
        installed_version VARCHAR(20) NOT NULL,
        installed_by VARCHAR(36) NOT NULL,
        installed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status ENUM('active', 'inactive', 'uninstalled') DEFAULT 'active',
        config JSON,
        FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
        FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE,
        UNIQUE KEY unique_workspace_skill (workspace_id, skill_id),
        INDEX idx_workspace (workspace_id),
        INDEX idx_skill (skill_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Workspace skills table created');

    // 创建技能权限表
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS skill_permissions (
        id VARCHAR(36) PRIMARY KEY,
        role_id VARCHAR(36) NOT NULL,
        action ENUM('install', 'uninstall', 'read', 'write', 'delete') NOT NULL,
        scope VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
        UNIQUE KEY unique_role_action_scope (role_id, action, scope)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Skill permissions table created');

    // 创建技能安装日志表
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS skill_install_logs (
        id VARCHAR(36) PRIMARY KEY,
        workspace_id VARCHAR(36) NOT NULL,
        skill_id VARCHAR(36) NOT NULL,
        user_id VARCHAR(36) NOT NULL,
        action ENUM('install', 'uninstall', 'update', 'rollback') NOT NULL,
        version VARCHAR(20) NOT NULL,
        status ENUM('success', 'failed', 'pending') NOT NULL,
        error_message TEXT,
        installed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
        FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_workspace (workspace_id),
        INDEX idx_skill (skill_id),
        INDEX idx_user (user_id),
        INDEX idx_action (action),
        INDEX idx_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Skill install logs table created');

    // 插入默认技能权限配置
    const defaultPermissions = [
      // 角色权限
      { role_id: 'role-owner', action: 'install', scope: '*' },
      { role_id: 'role-owner', action: 'uninstall', scope: '*' },
      { role_id: 'role-owner', action: 'read', scope: '*' },
      { role_id: 'role-owner', action: 'write', scope: '*' },
      { role_id: 'role-owner', action: 'delete', scope: '*' },

      { role_id: 'role-admin', action: 'install', scope: 'workspace:*' },
      { role_id: 'role-admin', action: 'uninstall', scope: 'workspace:*' },
      { role_id: 'role-admin', action: 'read', scope: '*' },
      { role_id: 'role-admin', action: 'write', scope: 'workspace:*' },
      { role_id: 'role-admin', action: 'delete', scope: 'workspace:*' },

      { role_id: 'role-member', action: 'install', scope: 'skill:*' },
      { role_id: 'role-member', action: 'uninstall', scope: 'skill:*' },
      { role_id: 'role-member', action: 'read', scope: '*' },
      { role_id: 'role-member', action: 'write', scope: 'skill:*' },

      { role_id: 'role-viewer', action: 'read', scope: '*' },
    ];

    for (const permission of defaultPermissions) {
      await connection.execute(
        'INSERT IGNORE INTO skill_permissions (id, role_id, action, scope) VALUES (?, ?, ?, ?)',
        [require('uuid').v4(), permission.role_id, permission.action, permission.scope]
      );
    }
    console.log('✅ Default skill permissions inserted');

    // 插入默认技能
    const defaultSkills = [
      {
        id: 'skill-security-auditor',
        name: 'code-security-auditor',
        description: '代码安全审计工具，检测 OWASP Top 10 漏洞',
        version: '1.3.0',
        author: 'AfrexAI',
        category: 'security',
        tags: ['security', 'code-review', 'vulnerability'],
        rating: 4.8,
        is_public: true
      },
      {
        id: 'skill-contract-reviewer',
        name: 'contract-reviewer',
        description: '商业合同风险评估和合规检查',
        author: 'AfrexAI',
        category: 'legal',
        tags: ['contract', 'risk', 'compliance'],
        version: '1.0.0',
        rating: 4.5,
        is_public: true
      },
      {
        id: 'skill-tavily-search',
        name: 'tavily-search',
        description: 'AI 优化的网络搜索工具',
        author: 'Tavily',
        category: 'search',
        tags: ['web', 'search', 'ai'],
        version: '1.0.0',
        rating: 4.2,
        is_public: true
      },
      {
        id: 'skill-github-integration',
        name: 'github',
        description: 'GitHub 交互工具，支持 PR、Issue、CI 等',
        author: 'OpenClaw',
        category: 'development',
        tags: ['github', 'development', 'automation'],
        version: '1.0.0',
        rating: 4.6,
        is_public: true
      },
      {
        id: 'skill-weather',
        name: 'weather',
        description: '天气查询和预报工具，无需 API 密钥',
        author: 'OpenClaw',
        category: 'utility',
        tags: ['weather', 'forecast', 'location'],
        version: '1.0.0',
        rating: 4.3,
        is_public: true
      }
    ];

    for (const skill of defaultSkills) {
      await connection.execute(
        `INSERT IGNORE INTO skills 
         (id, name, description, version, author, category, tags, rating, is_public)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          skill.id,
          skill.name,
          skill.description,
          skill.version,
          skill.author,
          skill.category,
          JSON.stringify(skill.tags),
          skill.rating,
          skill.is_public
        ]
      );
    }
    console.log('✅ Default skills inserted');

    console.log('🎉 Skills database migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    connection.release();
  }
}

// 运行迁移
migrate().catch(console.error);