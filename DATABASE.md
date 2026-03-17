# 数据库文档

**项目**: Permissions System
**数据库**: MySQL 8.0
**端口**: 3310
**字符集**: utf8mb4
**引擎**: InnoDB

---

## 📁 数据库文件

所有数据库文件位于 `database/` 目录：

| 文件 | 大小 | 描述 |
|-----|------|------|
| schema.sql | ~8 KB | 完整数据库结构 + 初始数据 |
| data.sql | ~6 KB | 完整初始数据 |
| FILES.md | ~6 KB | 数据库文件清单 |
| README.md | ~12 KB | 完整数据库文档 |
| QUICK-START.md | ~2 KB | 快速开始指南 |

---

## 🚀 快速开始

### 导入数据库

```bash
# 方式1: 一键导入（schema.sql包含初始数据）
docker exec -i permissions_db mysql -uroot -prootpassword < database/schema.sql

# 方式2: 分步导入
docker exec -i permissions_db mysql -uroot -prootpassword < database/schema.sql
docker exec -i permissions_db mysql -uroot -prootpassword permissions_system < database/data.sql
```

### 验证导入

```bash
# 检查表
docker exec permissions_db mysql -uroot -prootpassword permissions_system -e "SHOW TABLES;"

# 检查数据
docker exec permissions_db mysql -uroot -prootpassword permissions_system -e "
SELECT 'Users' AS Table, COUNT(*) AS Count FROM users
UNION ALL
SELECT 'Roles', COUNT(*) FROM roles
UNION ALL
SELECT 'Permissions', COUNT(*) FROM permissions;
"
```

---

## 📊 数据库结构

### 表清单（7个）

1. **users** - 用户表
2. **roles** - 角色表
3. **permissions** - 权限表
4. **menus** - 菜单表
5. **role_permissions** - 角色权限关联表
6. **role_menus** - 角色菜单关联表

### ER 图

```
users
  │
  └─> role (VARCHAR)
       │
       └─> roles (id)
            │
            ├──> role_permissions (role_id)
            │         └─> permissions (id)
            │
            └─> role_menus (role_id)
                      └─> menus (id)
```

---

## 👥 默认账号

| 邮箱 | 密码 | 角色 | 权限数 | 菜单数 |
|-----|------|------|--------|--------|
| admin@example.com | Admin123! | admin | 18 | 9 |
| user@example.com | Admin123! | user | 5 | 1 |
| editor@example.com | Admin123! | editor | 10 | 2 |
| auditor@example.com | Admin123! | auditor | 5 | 9 |

⚠️ **重要**: 首次登录后请立即修改默认密码！

---

## 🔐 密码加密

所有密码使用 **bcrypt** 加密：
- 盐值轮数: 10
- 算法: bcrypt
- 默认密码: `Admin123!`

---

## 📋 初始数据统计

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

## 📖 详细文档

查看完整文档：

- **文件清单**: [database/FILES.md](./database/FILES.md)
- **完整文档**: [database/README.md](./database/README.md)
- **快速开始**: [database/QUICK-START.md](./database/QUICK-START.md)

---

**最后更新**: 2026-03-17
**维护人员**: Echo-2 (Agentic AI)
