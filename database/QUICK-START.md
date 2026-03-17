# 数据库快速开始

## 🚀 一键导入

### Docker 环境导入

```bash
# 进入项目目录
cd /root/.openclaw/workspace/permissions-system

# 导入 schema.sql（包含初始数据）
docker exec -i permissions_db mysql -uroot -prootpassword < database/schema.sql

# 或者分步导入
docker exec -i permissions_db mysql -uroot -prootpassword < database/schema.sql
docker exec -i permissions_db mysql -uroot -prootpassword permissions_system < database/data.sql
```

### 本地 MySQL 导入

```bash
# 导入 schema.sql
mysql -u root -p < database/schema.sql

# 导入 data.sql
mysql -u root -p permissions_system < database/data.sql
```

---

## ✅ 验证导入

### 检查表结构
```bash
docker exec permissions_db mysql -uroot -prootpassword permissions_system -e "SHOW TABLES;"
```

### 检查初始数据
```bash
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

### 检查默认用户
```bash
docker exec permissions_db mysql -uroot -prootpassword permissions_system -e "
SELECT email, name, role, status FROM users;
"
```

---

## 🔐 默认账号

| 邮箱 | 密码 | 角色 |
|-----|------|------|
| admin@example.com | Admin123! | admin |
| user@example.com | Admin123! | user |
| editor@example.com | Admin123! | editor |
| auditor@example.com | Admin123! | auditor |

---

## 📋 导入后数据统计

- **表数量**: 7个
- **角色**: 4个
- **权限**: 18个
- **菜单**: 9个
- **用户**: 4个

---

## 📝 注意事项

1. ⚠️ 首次登录后请立即修改默认密码
2. ⚠️ 生产环境请使用强密码
3. ⚠️ 定期备份数据库

---

**完成时间**: 2026-03-17 22:25
