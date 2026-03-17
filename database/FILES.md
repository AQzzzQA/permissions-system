# 数据库文件清单

**项目**: Permissions System
**数据库**: MySQL 8.0
**字符集**: utf8mb4
**引擎**: InnoDB

---

## 📁 数据库文件列表

### 1. schema.sql
**路径**: `database/schema.sql`
**大小**: 约 8 KB
**描述**: 完整的数据库结构定义

**包含内容**:
- ✅ 7个数据表（users, roles, permissions, menus, role_permissions, role_menus）
- ✅ 外键约束（级联删除）
- ✅ 索引优化（提升查询性能）
- ✅ 默认字符集（utf8mb4，支持完整 Unicode）
- ✅ 初始数据（2个角色，16个权限，5个菜单，1个管理员用户）

**使用场景**:
- 首次安装（全新数据库）
- 重建数据库结构
- 测试环境初始化

**导入命令**:
```bash
docker exec -i permissions_db mysql -uroot -prootpassword < database/schema.sql
```

---

### 2. data.sql
**路径**: `database/data.sql`
**大小**: 约 6 KB
**描述**: 完整的初始数据

**包含内容**:
- ✅ 4个角色（admin, user, editor, auditor）
- ✅ 18个权限（user, role, permission, menu）
- ✅ 9个菜单（含子菜单）
- ✅ 4个用户（默认密码：Admin123!）
- ✅ 角色-权限映射（28条记录）
- ✅ 角色-菜单映射（21条记录）

**使用场景**:
- 初始化测试数据
- 重置初始数据
- 补充示例数据

**导入命令**:
```bash
docker exec -i permissions_db mysql -uroot -prootpassword permissions_system < database/data.sql
```

---

### 3. README.md
**路径**: `database/README.md`
**大小**: 约 12 KB
**描述**: 完整的数据库文档

**包含内容**:
- 📖 文件说明和使用方法
- 📊 完整表结构文档
- 👥 默认数据清单
- 🔐 密码加密方法
- 📋 常用SQL查询
- 🔧 维护和备份命令
- 🆘 故障排查指南

**使用场景**:
- 了解数据库结构
- 查询文档和示例
- 数据库维护操作

---

### 4. QUICK-START.md
**路径**: `database/QUICK-START.md`
**大小**: 约 2 KB
**描述**: 数据库快速开始指南

**包含内容**:
- 🚀 一键导入命令
- ✅ 验证导入方法
- 🔐 默认账号清单
- 📋 导入后数据统计
- 📝 注意事项

**使用场景**:
- 快速开始使用
- 验证数据导入
- 查看默认账号

---

## 📊 数据库表结构

### users（用户表）
| 字段 | 类型 | 说明 | 索引 |
|-----|------|------|------|
| id | INT UNSIGNED | 主键 | PRIMARY |
| email | VARCHAR(255) | 邮箱（唯一） | UNIQUE |
| password | VARCHAR(255) | 密码（bcrypt） | - |
| name | VARCHAR(100) | 姓名 | - |
| role | VARCHAR(50) | 角色 | INDEX |
| status | VARCHAR(20) | 状态 | INDEX |
| created_at | DATETIME | 创建时间 | - |
| updated_at | DATETIME | 更新时间 | - |

**默认记录**: 4条

---

### roles（角色表）
| 字段 | 类型 | 说明 | 索引 |
|-----|------|------|------|
| id | INT UNSIGNED | 主键 | PRIMARY |
| name | VARCHAR(50) | 角色名称（唯一） | UNIQUE |
| description | VARCHAR(255) | 角色描述 | - |
| created_at | DATETIME | 创建时间 | - |
| updated_at | DATETIME | 更新时间 | - |

**默认记录**: 4条（admin, user, editor, auditor）

---

### permissions（权限表）
| 字段 | 类型 | 说明 | 索引 |
|-----|------|------|------|
| id | INT UNSIGNED | 主键 | PRIMARY |
| name | VARCHAR(100) | 权限名称（唯一） | UNIQUE |
| description | VARCHAR(255) | 权限描述 | - |
| resource | VARCHAR(100) | 资源 | INDEX |
| action | VARCHAR(50) | 操作 | INDEX |
| created_at | DATETIME | 创建时间 | - |
| updated_at | DATETIME | 更新时间 | - |

**默认记录**: 18条

---

### menus（菜单表）
| 字段 | 类型 | 说明 | 索引 |
|-----|------|------|------|
| id | INT UNSIGNED | 主键 | PRIMARY |
| parent_id | INT UNSIGNED | 父菜单ID | INDEX |
| name | VARCHAR(100) | 菜单名称 | - |
| path | VARCHAR(255) | 路由路径 | - |
| icon | VARCHAR(50) | 图标 | - |
| sort_order | INT | 排序 | INDEX |
| status | VARCHAR(20) | 状态 | INDEX |
| created_at | DATETIME | 创建时间 | - |
| updated_at | DATETIME | 更新时间 | - |

**默认记录**: 9条（6个顶级菜单，3个子菜单）

---

### role_permissions（角色权限关联表）
| 字段 | 类型 | 说明 | 索引 |
|-----|------|------|------|
| id | INT UNSIGNED | 主键 | PRIMARY |
| role_id | INT UNSIGNED | 角色ID（外键） | INDEX, FOREIGN KEY |
| permission_id | INT UNSIGNED | 权限ID（外键） | INDEX, FOREIGN KEY |
| created_at | DATETIME | 创建时间 | - |

**默认记录**: 28条
**外键**: role_id → roles(id), permission_id → permissions(id)

---

### role_menus（角色菜单关联表）
| 字段 | 类型 | 说明 | 索引 |
|-----|------|------|------|
| id | INT UNSIGNED | 主键 | PRIMARY |
| role_id | INT UNSIGNED | 角色ID（外键） | INDEX, FOREIGN KEY |
| menu_id | INT UNSIGNED | 菜单ID（外键） | INDEX, FOREIGN KEY |
| created_at | DATETIME | 创建时间 | - |

**默认记录**: 21条
**外键**: role_id → roles(id), menu_id → menus(id)

---

## 👥 默认账号

| 邮箱 | 密码 | 姓名 | 角色 | 权限数 | 菜单数 |
|-----|------|------|------|--------|--------|
| admin@example.com | Admin123! | Super Admin | admin | 18 | 9 |
| user@example.com | Admin123! | Test User | user | 5 | 1 |
| editor@example.com | Admin123! | Content Editor | editor | 10 | 2 |
| auditor@example.com | Admin123! | Data Auditor | auditor | 5 | 9 |

---

## 🔐 密码安全

所有用户密码使用 **bcrypt** 加密：
- 盐值轮数: 10
- 默认密码: `Admin123!`
- 密码哈希: `$2b$10$N9qo8uLOickgx2ZMRZoMy.Mrq8Y7t1qKXwVhX7Z7YxK1pY5l7n0O`

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

## 🚀 快速开始

### 1. 导入数据库

```bash
# 方式1: 导入 schema.sql（包含初始数据）
docker exec -i permissions_db mysql -uroot -prootpassword < database/schema.sql

# 方式2: 分步导入（先结构，后数据）
docker exec -i permissions_db mysql -uroot -prootpassword < database/schema.sql
docker exec -i permissions_db mysql -uroot -prootpassword permissions_system < database/data.sql
```

### 2. 验证导入

```bash
# 检查表是否创建成功
docker exec permissions_db mysql -uroot -prootpassword permissions_system -e "SHOW TABLES;"

# 检查数据是否导入成功
docker exec permissions_db mysql -uroot -prootpassword permissions_system -e "
SELECT 'Users' AS Table, COUNT(*) AS Count FROM users
UNION ALL
SELECT 'Roles', COUNT(*) FROM roles
UNION ALL
SELECT 'Permissions', COUNT(*) FROM permissions
UNION ALL
SELECT 'Menus', COUNT(*) FROM menus;
"
```

### 3. 登录系统

访问: http://43.156.131.98:3000
使用默认账号: admin@example.com / Admin123!

---

## 📋 数据统计

导入后的数据统计：

| 类型 | 数量 |
|-----|------|
| 表 | 7 |
| 角色 | 4 |
| 权限 | 18 |
| 菜单 | 9 |
| 用户 | 4 |
| 角色-权限关联 | 28 |
| 角色-菜单关联 | 21 |

---

## 🔧 维护命令

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

---

## 📝 注意事项

1. ⚠️ **字符集**: 使用 utf8mb4 以支持完整的 Unicode 字符（包括 emoji）
2. ⚠️ **存储引擎**: 使用 InnoDB 以支持事务和外键约束
3. ⚠️ **密码安全**: 所有密码使用 bcrypt 加密，盐值为 10 轮
4. ⚠️ **外键约束**: 角色删除时自动级联删除相关权限和菜单映射
5. ⚠️ **默认密码**: 首次登录后请立即修改默认密码（Admin123!）

---

## 📖 详细文档

- **完整文档**: [README.md](./README.md)
- **快速开始**: [QUICK-START.md](./QUICK-START.md)
- **项目文档**: [../README.md](../README.md)

---

**最后更新**: 2026-03-17
**维护人员**: Echo-2 (Agentic AI)
**版本**: 1.0.0
