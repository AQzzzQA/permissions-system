# 数据库导入文档

**项目**: Permissions System
**数据库**: MySQL 8.0
**版本**: v1.0.0
**最后更新**: 2026-03-17

---

## 📋 目录

- [数据库文件说明](#数据库文件说明)
- [快速导入](#快速导入)
- [详细导入](#详细导入)
- [验证导入](#验证导入)
- [常见问题](#常见问题)

---

## 📁 数据库文件说明

所有数据库文件位于 `database/` 目录：

| 文件 | 大小 | 描述 | 包含内容 |
|-----|------|------|---------|
| **schema.sql** | ~8 KB | 数据库结构 + 初始数据 | 7个表，2个角色，16个权限，5个菜单，1个管理员 |
| **data.sql** | ~6 KB | 完整初始数据 | 4个角色，18个权限，9个菜单，4个用户 |
| **FILES.md** | ~6 KB | 数据库文件清单 | 文件列表、表结构、默认账号 |
| **README.md** | ~12 KB | 完整数据库文档 | 表结构、外键、维护命令 |
| **QUICK-START.md** | ~2 KB | 快速开始指南 | 一键导入、验证方法 |

---

## 🚀 快速导入

### 方式1: 一键导入（推荐）

```bash
# 进入项目目录
cd permissions-system

# 导入 schema.sql（包含初始数据）
docker exec -i permissions_db mysql -uroot -prootpassword < database/schema.sql
```

### 方式2: 分步导入

```bash
# 1. 导入数据库结构
docker exec -i permissions_db mysql -uroot -prootpassword < database/schema.sql

# 2. 导入完整初始数据
docker exec -i permissions_db mysql -uroot -prootpassword permissions_system < database/data.sql
```

### 本地 MySQL 导入

```bash
# 如果使用本地 MySQL
mysql -u root -p < database/schema.sql
mysql -u root -p permissions_system < database/data.sql
```

---

## 🔧 详细导入

### 前置条件

1. **Docker 环境准备**
```bash
# 启动数据库容器
docker-compose up -d db

# 检查容器状态
docker-compose ps db
```

2. **验证数据库连接**
```bash
# 测试数据库连接
docker exec permissions_db mysql -uroot -prootpassword -e "SELECT 1;"

# 预期输出:
# +---+
# | 1 |
# +---+
```

### 导入 schema.sql

#### 步骤1: 上传文件

```bash
# 确认文件存在
ls -lh database/schema.sql

# 预期输出:
# -rw-r--r-- 1 root root 8.2K Mar 17 22:00 database/schema.sql
```

#### 步骤2: 执行导入

```bash
# 导入 schema.sql
docker exec -i permissions_db mysql -uroot -prootpassword < database/schema.sql

# 预期输出:
# ✅ 插入 2 个角色
# ✅ 插入 16 个权限
# ✅ 插入 5 个菜单
# ✅ 插入 1 个管理员
```

#### 步骤3: 验证导入

```bash
# 检查表是否创建
docker exec permissions_db mysql -uroot -prootpassword permissions_system -e "SHOW TABLES;"

# 预期输出:
# +---------------------+
# | Tables_in_...       |
# +---------------------+
# | menus               |
# | permissions         |
# | role_menus          |
# | role_permissions    |
# | roles              |
# | users              |
# +---------------------+
```

### 导入 data.sql（可选）

#### 步骤1: 执行导入

```bash
# 导入 data.sql
docker exec -i permissions_db mysql -uroot -prootpassword permissions_system < database/data.sql

# 预期输出:
# ✅ 插入 4 个角色
# ✅ 插入 18 个权限
# ✅ 插入 9 个菜单
# ✅ 插入 4 个用户
```

#### 步骤2: 验证导入

```bash
# 检查数据统计
docker exec permissions_db mysql -uroot -prootpassword permissions_system -e "
SELECT 'Users' AS Table, COUNT(*) AS Count FROM users
UNION ALL
SELECT 'Roles', COUNT(*) FROM roles
UNION ALL
SELECT 'Permissions', COUNT(*) FROM permissions
UNION ALL
SELECT 'Menus', COUNT(*) FROM menus;

# 预期输出（仅导入 schema.sql）:
# +--------+-------+
# | Table  | Count |
# +--------+-------+
# | Users  |     1 |
# | Roles  |     2 |
# | Permissions | 16 |
# | Menus  |     5 |
# +--------+-------+

# 预期输出（导入 schema.sql + data.sql）:
# +--------+-------+
# | Table  | Count |
# +--------+-------+
# | Users  |     4 |
# | Roles  |     4 |
# | Permissions | 18 |
# | Menus  |     9 |
# +--------+-------+
```

---

## ✅ 验证导入

### 1. 检查表结构

```bash
# 查看所有表
docker exec permissions_db mysql -uroot -prootpassword permissions_system -e "SHOW TABLES;"

# 查看表结构
docker exec permissions_db mysql -uroot -prootpassword permissions_system -e "DESCRIBE users;"
```

### 2. 检查初始数据

```bash
# 检查用户
docker exec permissions_db mysql -uroot -prootpassword permissions_system -e "SELECT email, name, role FROM users;"

# 检查角色
docker exec permissions_db mysql -uroot -prootpassword permissions_system -e "SELECT * FROM roles;"

# 检查权限
docker exec permissions_db mysql -uroot -prootpassword permissions_system -e "SELECT name, resource, action FROM permissions LIMIT 10;"
```

### 3. 检查关联数据

```bash
# 检查角色权限关联
docker exec permissions_db mysql -uroot -prootpassword permissions_system -e "
SELECT
    r.name AS role,
    COUNT(rp.permission_id) AS permissions
FROM roles r
LEFT JOIN role_permissions rp ON r.id = rp.role_id
GROUP BY r.id, r.name;
"

# 检查角色菜单关联
docker exec permissions_db mysql -uroot -prootpassword permissions_system -e "
SELECT
    r.name AS role,
    COUNT(rm.menu_id) AS menus
FROM roles r
LEFT JOIN role_menus rm ON r.id = rm.role_id
GROUP BY r.id, r.name;
"
```

### 4. 测试登录

```bash
# 使用 curl 测试登录
curl -X POST http://localhost:8001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"Admin123!"}'

# 预期输出:
# {"token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...","user":{...}}
```

---

## 👥 默认账号

导入后的默认账号：

| 邮箱 | 密码 | 姓名 | 角色 | 权限数 | 菜单数 |
|-----|------|------|------|--------|--------|
| admin@example.com | Admin123! | Super Admin | admin | 18 | 9 |
| user@example.com | Admin123! | Test User | user | 5 | 1 |
| editor@example.com | Admin123! | Content Editor | editor | 10 | 2 |
| auditor@example.com | Admin123! | Data Auditor | auditor | 5 | 9 |

⚠️ **重要**: 首次登录后请立即修改默认密码！

---

## 📊 导入后数据统计

### 仅导入 schema.sql

| 类型 | 数量 |
|-----|------|
| 表 | 7 |
| 角色 | 2 |
| 权限 | 16 |
| 菜单 | 5 |
| 用户 | 1 |

### 导入 schema.sql + data.sql

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

## 🔄 重新导入

### 清空现有数据

```bash
# 删除数据库并重建
docker exec permissions_db mysql -uroot -prootpassword -e "
DROP DATABASE IF EXISTS permissions_system;
CREATE DATABASE permissions_system
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;
"

# 重新导入
docker exec -i permissions_db mysql -uroot -prootpassword < database/schema.sql
```

### 使用 data.sql 自动清空

```bash
# data.sql 包含清空命令，可以直接导入
docker exec -i permissions_db mysql -uroot -prootpassword permissions_system < database/data.sql
```

---

## 🆘 常见问题

### 问题1: 导入失败 - 权限错误

**现象**: `ERROR 1045 (28000): Access denied for user 'root'@'localhost'`

**解决方案**:
```bash
# 检查数据库密码
docker-compose ps db
docker-compose logs db

# 确认密码正确（默认: rootpassword）
docker exec -i permissions_db mysql -uroot -prootpassword < database/schema.sql
```

### 问题2: 导入失败 - 文件不存在

**现象**: `No such file or directory: database/schema.sql`

**解决方案**:
```bash
# 确认当前目录
pwd

# 确认文件存在
ls -lh database/schema.sql

# 使用绝对路径
docker exec -i permissions_db mysql -uroot -prootpassword < /root/.openclaw/workspace/permissions-system/database/schema.sql
```

### 问题3: 导入成功但无法登录

**现象**: 可以登录但显示"用户名或密码错误"

**解决方案**:
```bash
# 检查用户是否存在
docker exec permissions_db mysql -uroot -prootpassword permissions_system -e "SELECT email, name FROM users;"

# 检查密码哈希
docker exec permissions_db mysql -uroot -prootpassword permissions_system -e "SELECT email, LEFT(password, 20) AS hash FROM users WHERE email = 'admin@example.com';"

# 重置密码（生成新哈希）
node -e "const bcrypt = require('bcrypt'); bcrypt.hash('Admin123!', 10).then(h => console.log(h));"

# 更新密码
docker exec permissions_db mysql -uroot -prootpassword permissions_system -e "
UPDATE users SET password = '$2b$10$NEW_HASH_HERE' WHERE email = 'admin@example.com';
"
```

### 问题4: 表结构错误

**现象**: `Table 'permissions_system.users' doesn't exist`

**解决方案**:
```bash
# 检查数据库是否存在
docker exec permissions_db mysql -uroot -prootpassword -e "SHOW DATABASES;"

# 检查当前数据库
docker exec permissions_db mysql -uroot -prootpassword -e "SELECT DATABASE();"

# 重新导入 schema.sql
docker exec -i permissions_db mysql -uroot -prootpassword < database/schema.sql
```

### 问题5: 字符集问题

**现象**: 中文显示乱码

**解决方案**:
```bash
# 检查字符集
docker exec permissions_db mysql -uroot -prootpassword -e "
SELECT
    TABLE_SCHEMA,
    TABLE_NAME,
    TABLE_COLLATION
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = 'permissions_system';
"

# 预期: utf8mb4_unicode_ci

# 如果不是，修改表字符集
docker exec permissions_db mysql -uroot -prootpassword permissions_system -e "
ALTER TABLE users CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE roles CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- 对所有表执行相同操作
"
```

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

### 更新用户密码

```bash
# 1. 生成密码哈希（见上方）

# 2. 更新数据库
docker exec permissions_db mysql -uroot -prootpassword permissions_system -e "
UPDATE users SET password = '$2b$10$NEW_HASH_HERE' WHERE email = 'admin@example.com';
"

# 3. 验证更新
docker exec permissions_db mysql -uroot -prootpassword permissions_system -e "SELECT email, LEFT(password, 20) AS hash FROM users;"
```

---

## 📋 导入检查清单

完成导入后，请检查以下项：

- [ ] 所有表已创建（7个）
- [ ] 初始数据已导入
- [ ] 用户表有数据（至少1条）
- [ ] 角色表有数据（至少2条）
- [ ] 权限表有数据（至少16条）
- [ ] 菜单表有数据（至少5条）
- [ ] 角色权限关联表有数据
- [ ] 角色菜单关联表有数据
- [ ] 可以使用默认账号登录
- [ ] 字符集为 utf8mb4

---

## 📖 详细文档

- **文件清单**: [database/FILES.md](./database/FILES.md)
- **完整文档**: [database/README.md](./database/README.md)
- **快速开始**: [database/QUICK-START.md](./database/QUICK-START.md)
- **项目文档**: [README.md](./README.md)
- **部署文档**: [DEPLOYMENT.md](./DEPLOYMENT.md)

---

**最后更新**: 2026-03-17
**维护人员**: Echo-2 (Agentic AI)
**版本**: v1.0.0
