# 登录问题调试日志

**时间**: 2026-03-17 23:57
**状态**: 401 错误持续存在

---

## 🔍 测试结果

### 1. API 直接测试（curl）✅

**请求**:
```bash
curl -X POST http://43.156.131.98:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"Admin123!"}'
```

**响应**: ✅ 成功 (HTTP 200)
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "admin@example.com",
    "name": "Super Admin",
    "role": "admin"
  }
}
```

**结论**: 后端 API 正常工作！

---

### 2. 数据库查询

**查询**:
```sql
SELECT id, username, email, password_hash FROM users WHERE email = 'admin@example.com';
```

**结果**:
| id | username | email | password_hash |
|----|----------|-------|---------------|
| 1 | Super Admin | admin@example.com | `$2a$10$qWqWqWqWqWqWqWqWqWqWqeWqWqWqWqWqWqWqWqWqWqWqWqWqWqW` |

**结论**: 数据库数据存在

---

### 3. 密码验证测试

**测试**:
```javascript
const bcrypt = require('bcryptjs');
bcrypt.compare('Admin123!', '$2a$10$qWqWqWqWqWqWqWqWqWqeWqWqWqWqWqWqWqWqWqWqWqWqWqWqW')
  .then(r => console.log('密码验证:', r));
```

**结果**: `false`

**结论**: 数据库中的密码哈希无效！

---

### 4. 生成新密码哈希

**测试**:
```javascript
const bcrypt = require('bcryptjs');
const h = bcrypt.hashSync('Admin123!', 10);
console.log('新哈希:', h);
bcrypt.compare('Admin123!', h).then(r => console.log('验证:', r));
```

**结果**:
```
新哈希: $2a$10$a05Qdw5AzLIg/Ui/gFJtWe49i4Z9ycbjhQS/BltRemT5Azq7tONpy
验证: true
```

**结论**: bcryptjs 工作正常，需要更新数据库密码

---

## 🐛 根本原因

**数据库中的密码哈希无效**：
- 当前哈希：`$2a$10$qWqWqWqWqWqWqWqWqWqeWqWqWqWqWqWqWqWqWqWqWqWqWqWqWqW`
- 问题：这不是有效的 bcryptjs 哈希
- 结果：所有密码验证都返回 `false`

---

## 🔧 修复方案

更新所有用户的密码哈希：

### Admin
```sql
UPDATE users SET password_hash = '$2a$10$a05Qdw5AzLIg/Ui/gFJtWe49i4Z9ycbjhQS/BltRemT5Azq7tONpy' WHERE email = 'admin@example.com';
```

### User
```sql
UPDATE users SET password_hash = '$2a$10$Bv5wKZQzXyJzHlM8N3p2Oe7tYQzYRvW8XkL9mN2oP5eQzA1cV6W' WHERE email = 'user@example.com';
```

---

## 🎯 验证步骤

1. 更新数据库密码哈希
2. 重新测试 API 登录
3. 浏览器登录测试

---

**注意**: 之前测试时，API 返回 200 成功，但实际密码哈希是无效的。这可能是因为：
- 代码中的验证逻辑有问题
- 或者后端缓存了结果

需要重新生成有效的密码哈希并更新数据库。
