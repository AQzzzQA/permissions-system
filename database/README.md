# Permissions System Database

**Version**: 1.0.0
**Last Updated**: 2026-03-17

---

## 📁 文件说明

### schema.sql
完整的数据库结构定义，包括：
- 7个数据表（users, roles, permissions, menus, role_permissions, role_menus）
- 外键约束
- 索引优化
- 默认字符集（utf8mb4）
- 初始数据（2个角色，16个权限，5个菜单，1个管理员）

### data.sql
初始数据文件，包括：
- 4个角色（admin, user, editor, auditor）
- 18个权限
- 9个菜单（含子菜单）
- 4个用户（默认密码：Admin123!）
- 角色-权限映射
- 角色-菜单映射

---

## 🚀 使用方法

### 首次安装（全新数据库）

```bash
# 方式1: 导入 schema.sql（包含初始数据）
docker exec -i permissions_db mysql -uroot -prootpassword < /path/to/schema.sql

# 方式2: 分步导入（先结构，后数据）
docker exec -i permissions_db mysql -uroot -prootpassword < /path/to/schema.sql
docker exec -i permissions_db mysql -uroot -prootpassword permissions_system < /path/to/data.sql
```

### 重新导入（清空现有数据）

```bash
# 导入 data.sql 会自动清空现有数据
docker exec -i permissions_db mysql -uroot -prootpassword permissions_system < /path/to/data.sql
```

### 本地 MySQL 导入

```bash
# 导入 schema.sql
mysql -u root -p < schema.sql

# 导入 data.sql
mysql -u root -p permissions_system < data.sql
```

---

## 📊 数据库结构

### 表结构

#### users（用户表）
| 字段 | 类型 | 说明 |
|-----|------|------|
| id | INT UNSIGNED | 主键 |
| email | VARCHAR(255) | 邮箱（唯一） |
| password | VARCHAR(255) | 密码（bcrypt加密） |
| name | VARCHAR(100) | 姓名 |
| role | VARCHAR(50) | 角色 |
| status | VARCHAR(20) | 状态（active/inactive） |
| created_at | DATETIME | 创建时间 |
| updated_at | DATETIME | 更新时间 |

#### roles（角色表）
| 字段 | 类型 | 说明 |
|-----|------|------|
| id | INT UNSIGNED | 主键 |
| name | VARCHAR(50) | 角色名称（唯一） |
| description | VARCHAR(255) | 角色描述 |
| created_at | DATETIME | 创建时间 |
| updated_at | DATETIME | 更新时间 |

#### permissions（权限表）
| 字段 | 类型 | 说明 |
|-----|------|------|
| id | INT UNSIGNED | 主键 |
| name | VARCHAR(100) | 权限名称（唯一） |
| description | VARCHAR(255) | 权限描述 |
| resource | VARCHAR(100) | 资源 |
| action | VARCHAR(50) | 操作（create/read/update/delete/export） |
| created_at | DATETIME | 创建时间 |
| updated_at | DATETIME | 更新时间 |

#### menus（菜单表）
| 字段 | 类型 | 说明 |
|-----|------|------|
| id | INT UNSIGNED | 主键 |
| parent_id | INT UNSIGNED | 父菜单ID（0为顶级） |
| name | VARCHAR(100) | 菜单名称 |
| path | VARCHAR(255) | 路由路径 |
| icon | VARCHAR(50) | 图标 |
| sort_order | INT | 排序 |
| status | VARCHAR(20) | 状态（active/inactive） |
| created_at | DATETIME | 创建时间 |
| updated_at | DATETIME | 更新时间 |

#### role_permissions（角色权限关联表）
| 字段 | 类型 | 说明 |
|-----|------|------|
| id | INT UNSIGNED | 主键 |
| role_id | INT UNSIGNED | 角色ID（外键） |
| permission_id | INT UNSIGNED | 权限ID（外键） |
| created_at | DATETIME | 创建时间 |

#### role_menus（角色菜单关联表）
| 字段 | 类型 | 说明 |
|-----|------|------|
| id | INT UNSIGNED | 主键 |
| role_id | INT UNSIGNED | 角色ID（外键） |
| menu_id | INT UNSIGNED | 菜单ID（外键） |
| created_at | DATETIME | 创建时间 |

---

## 👥 默认数据

### 角色

| ID | 名称 | 描述 | 权限数 | 菜单数 |
|----|------|------|--------|--------|
| 1 | admin | 系统管理员，拥有所有权限 | 18 | 9 |
| 2 | user | 普通用户，拥有基本权限 | 5 | 1 |
| 3 | editor | 内容编辑，可以编辑内容 | 10 | 2 |
| 4 | auditor | 审计员，只能查看数据 | 5 | 9 |

### 用户

| 邮箱 | 姓名 | 角色 | 密码 | 状态 |
|-----|------|------|------|------|
| admin@example.com | Super Admin | admin | Admin123! | active |
| user@example.com | Test User | user | Admin123! | active |
| editor@example.com | Content Editor | editor | Admin123! | active |
| auditor@example.com | Data Auditor | auditor | Admin123! | active |

### 权限

**用户权限**（5个）：
- user:read

**角色权限**（4个）：
- role:read

**权限管理**（4个）：
- permission:read

**菜单权限**（4个）：
- menu:read

**管理员额外权限**（13个）：
- user:create, user:update, user:delete, user:export
- role:create, role:update, role:delete
- permission:create, permission:update, permission:delete
- menu:create, menu:update, menu:delete

### 菜单

**顶级菜单**（6个）：
- 首页 (/dashboard)
- 用户管理 (/users)
- 角色管理 (/roles)
- 权限管理 (/permissions)
- 菜单管理 (/menus)
- 系统设置 (/settings)

**系统设置子菜单**（3个）：
- 账号设置 (/settings/account)
- 安全设置 (/settings/security)
- 日志查看 (/settings/logs)

---

## 🔐 密码加密

### 生成新密码哈希

**Node.js**:
```javascript
const bcrypt = require('bcrypt');
const hash = await bcrypt.hash('your-password', 10);
console.log(hash);
```

**Python**:
```python
import bcrypt
password = 'your-password'.encode('utf-8')
hash = bcrypt.hashpw(password, bcrypt.gensalt())
print(hash.decode('utf-8'))
```

---

## 📋 常用SQL查询

### 查询所有用户
```sql
SELECT * FROM users;
```

### 查询用户权限
```sql
SELECT
    u.email,
    u.name,
    r.name AS role,
    p.name AS permission
FROM users u
JOIN roles r ON u.role = r.name
JOIN role_permissions rp ON r.id = rp.role_id
JOIN permissions p ON rp.permission_id = p.id
WHERE u.email = 'admin@example.com';
```

### 查询用户菜单
```sql
SELECT
    u.email,
    m.name AS menu_name,
    m.path AS menu_path
FROM users u
JOIN roles r ON u.role = r.name
JOIN role_menus rm ON r.id = rm.role_id
JOIN menus m ON rm.menu_id = m.id
WHERE u.email = 'admin@example.com'
ORDER BY m.sort_order;
```

### 查询角色权限统计
```sql
SELECT
    r.name AS role,
    COUNT(rp.permission_id) AS permission_count
FROM roles r
LEFT JOIN role_permissions rp ON r.id = rp.role_id
GROUP BY r.id, r.name;
```

---

## 🔧 维护

### 备份数据库
```bash
docker exec permissions_db mysqldump -uroot -prootpassword permissions_system > backup.sql
```

### 恢复数据库
```bash
docker exec -i permissions_db mysql -uroot -prootpassword permissions_system < backup.sql
```

### 查看表大小
```sql
SELECT
    TABLE_NAME,
    TABLE_ROWS,
    ROUND((DATA_LENGTH + INDEX_LENGTH) / 1024 / 1024, 2) AS 'Size (MB)'
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = 'permissions_system'
ORDER BY (DATA_LENGTH + INDEX_LENGTH) DESC;
```

### 优化表
```sql
OPTIMIZE TABLE users;
OPTIMIZE TABLE roles;
OPTIMIZE TABLE permissions;
OPTIMIZE TABLE menus;
OPTIMIZE TABLE role_permissions;
OPTIMIZE TABLE role_menus;
```

---

## 📝 注意事项

1. **字符集**: 使用 utf8mb4 以支持完整的 Unicode 字符（包括 emoji）
2. **存储引擎**: 使用 InnoDB 以支持事务和外键约束
3. **密码安全**: 所有密码使用 bcrypt 加密，盐值为 10 轮
4. **外键约束**: 角色删除时自动级联删除相关权限和菜单映射
5. **索引优化**: 为常用查询字段添加索引以提升性能

---

## 🆘 故障排查

### 外键约束错误
```sql
-- 检查外键约束
SELECT
    CONSTRAINT_NAME,
    TABLE_NAME,
    COLUMN_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM information_schema.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = 'permissions_system'
AND REFERENCED_TABLE_NAME IS NOT NULL;
```

### 数据导入失败
```bash
# 检查数据库连接
docker exec permissions_db mysql -uroot -prootpassword -e "SELECT 1;"

# 检查数据库是否存在
docker exec permissions_db mysql -uroot -prootpassword -e "SHOW DATABASES;"
```

### 密码验证失败
```sql
-- 检查用户密码哈希
SELECT email, name, role FROM users WHERE email = 'admin@example.com';
```

---

**最后更新**: 2026-03-17
**维护人员**: Echo-2 (Agentic AI)
