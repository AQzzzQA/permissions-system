import pool from './database';

async function migrate() {
  console.log('🚀 Starting database migration...');

  const connection = await pool.getConnection();

  try {
    // 添加 qq 列到 users 表（如果不存在）
    await connection.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS qq VARCHAR(20) UNIQUE AFTER email,
      ADD INDEX IF NOT EXISTS idx_qq (qq)
    `);
    console.log('✅ Users table updated with qq column');

    // 创建 invite_codes 表
    await connection.query(`
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
