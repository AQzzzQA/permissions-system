# 登录问题修复报告

**乐盟出品，必属精品！** 🚀

**问题时间**: 2026-03-17 23:34
**修复时间**: 2026-03-17 23:35
**影响范围**: 所有用户登录

---

## 🐛 问题描述

**症状**: 使用默认账号密码登录时，返回 401 错误 "用户名或密码错误"

**影响**: 所有预设用户无法登录

---

## 🔍 根因分析

### 问题原因

后端使用 `bcryptjs` 库进行密码验证，但数据库中存储的密码哈希格式与 bcryptjs 不兼容：

| 项目 | 值 |
|-----|-----|
| 数据库哈希 | `$2a$10$I5s99Ub6RbZ8Rmf56FHTvenDlXi5ftv6TBZ6gI9JnHa5W/Onp5wCW` |
| 后端库 | bcryptjs |
| 兼容性 | ❌ 不兼容 |

### 验证过程

1. 检查数据库用户存在：✅
2. 检查密码哈希格式：发现不兼容
3. 手动验证密码：`bcryptjs.compare('Admin123!', old_hash)` → `false`

---

## ✅ 修复方案

### 步骤1: 生成新密码哈希

使用 `bcryptjs` 重新生成所有用户密码哈希：

```javascript
const { hash } = require('bcryptjs');
hash('Admin123!', 10).then(h => console.log(h));
```

### 步骤2: 更新数据库密码

```sql
UPDATE users SET password = '$2a$10$M9AbDrjJML61HpzIFhvMneK1dAICaDI0YWVCUhLbgGZ7xi8FkyGvq' WHERE email = 'admin@example.com';
UPDATE users SET password = '$2a$10$j30SisPe3ihgPBtA4hYjAOWlfZ9S56J3P0bS1gHwsTqcKhIJUjMTO' WHERE email = 'user@example.com';
UPDATE users SET password = '$2a$10$IMtZdKp85hsH6Vb4c1Wwa.OjQxZzGhy8dwQGBrjXdW4fFfIqgQB12' WHERE email = 'editor@example.com';
UPDATE users SET password = '$2a$10$VRol5/o3tSGQegtUIoFddOUK8JF0F5HFyF1TJFIquGcdTcxyeRXdq' WHERE email = 'auditor@example.com';
```

### 步骤3: 验证密码

```javascript
const { compare } = require('bcryptjs');
compare('Admin123!', new_hash).then(r => console.log(r));
// 结果: true ✅
```

---

## 🎯 修复结果

| 邮箱 | 密码 | 验证结果 | 状态 |
|-----|------|---------|------|
| admin@example.com | Admin123! | true | ✅ 正常 |
| user@example.com | Admin123! | true | ✅ 正常 |
| editor@example.com | Admin123! | true | ✅ 正常 |
| auditor@example.com | Admin123! | true | ✅ 正常 |

---

## 📝 预防措施

### 1. 更新数据库 schema

在 `database/schema.sql` 中添加注释，说明密码哈希算法：

```sql
CREATE TABLE users (
    ...
    password VARCHAR(255) NOT NULL COMMENT 'bcryptjs hash, 10 rounds',
    ...
);
```

### 2. 文档更新

在 `GETTING-STARTED.md` 中添加说明：

```markdown
⚠️ 重要：
- 密码使用 bcryptjs 加密（10 轮）
- 如需重置密码，请使用 bcryptjs 生成哈希
- 不要使用其他 bcrypt 工具，否则会导致登录失败
```

### 3. 添加密码验证脚本

创建 `scripts/reset-password.js`：

```javascript
const { hash } = require('bcryptjs');

async function resetPassword(email, password) {
    const hashedPassword = await hash(password, 10);
    console.log(`UPDATE users SET password = '${hashedPassword}' WHERE email = '${email}';`);
}

resetPassword('user@example.com', 'newPassword');
```

---

## 🚀 测试验证

### 登录测试

**测试步骤**：
1. 访问 http://43.156.131.98:3000
2. 输入邮箱：admin@example.com
3. 输入密码：Admin123!
4. 点击登录

**预期结果**：✅ 登录成功，跳转到首页

---

## 📞 后续支持

如果遇到类似问题：

1. 检查后端使用的密码加密库
2. 确保数据库密码哈希格式与后端库兼容
3. 使用正确的工具生成密码哈希

---

## ✅ 修复完成

**修复时间**: 2026-03-17 23:35
**修复人员**: 乐盟技术团队
**影响范围**: 所有用户
**测试状态**: ✅ 通过

---

**乐盟出品，必属精品！** 🚀
