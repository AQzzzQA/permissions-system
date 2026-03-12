# QQ 命令绑定系统

## 📋 功能说明

通过 QQ 消息命令快速绑定管理员和客户账户，无需手动创建账户。

---

## 🎯 绑定流程

### 管理员绑定

**命令格式**:
```
/bind-admin <QQ号> [邮箱] [密码]
```

**示例**:
```
/bind-admin 123456789 admin@example.com password123
```

**响应**:
```json
{
  "success": true,
  "message": "管理员绑定成功",
  "user": {
    "id": "xxx",
    "email": "admin@example.com",
    "qq": "123456789",
    "is_superuser": true
  },
  "token": "eyJhbGc..."
}
```

**规则**:
- 如果邮箱已存在，更新 QQ 绑定
- 如果邮箱不存在，创建新账户并设为超级管理员
- 密码可选，未提供则使用默认密码：`{QQ}Admin123!`
- 邮箱可选，未提供则使用：`{QQ}@qq.com`

---

### 客户绑定

**命令格式**:
```
/bind-client <QQ号> <邀请码> [邮箱] [密码]
```

**示例**:
```
/bind-client 987654321 INV-ABC123 client@example.com password456
```

**响应**:
```json
{
  "success": true,
  "message": "客户账户创建并绑定成功",
  "user": {
    "id": "xxx",
    "username": "987654321",
    "email": "client@example.com",
    "qq": "987654321",
    "status": "active"
  },
  "token": "eyJhbGc..."
}
```

**规则**:
- 必须提供有效的邀请码
- 如果 QQ 或邮箱已绑定，更新绑定信息
- 密码可选，未提供则使用默认密码：`{QQ}Client123!`
- 邮箱可选，未提供则使用：`{QQ}@qq.com`
- 自动添加到邀请码对应的工作空间（如果指定）

---

## 🎫 邀请码管理

### 生成邀请码

**端点**: `POST /api/auth/generate-invite`

**请求体**:
```json
{
  "workspace_id": "workspace-uuid",
  "max_uses": 10,
  "expires_at": "2026-03-18T00:00:00Z"
}
```

**参数**:
- `workspace_id`: 可选，绑定时自动加入的工作空间
- `max_uses`: 可选，最大使用次数（默认 1）
- `expires_at`: 可选，过期时间（默认 7 天）

**响应**:
```json
{
  "success": true,
  "message": "邀请码生成成功",
  "invite_code": "INV-ABC1234567890",
  "workspace_id": "workspace-uuid",
  "max_uses": 10,
  "expires_at": "2026-03-18T00:00:00Z"
}
```

---

## 🔌 API 端点

### 管理员绑定
- **端点**: `POST /api/auth/bind-admin`
- **权限**: 无需认证
- **参数**:
  - `qq`: QQ 号（必填）
  - `email`: 邮箱（可选）
  - `password`: 密码（可选）

### 客户绑定
- **端点**: `POST /api/auth/bind-client`
- **权限**: 无需认证
- **参数**:
  - `qq`: QQ 号（必填）
  - `invite_code`: 邀请码（必填）
  - `email`: 邮箱（可选）
  - `password`: 密码（可选）

### 通过 QQ 获取用户
- **端点**: `GET /api/auth/user-by-qq/:qq`
- **权限**: 无需认证
- **返回**: 用户信息和 token

### 生成邀请码
- **端点**: `POST /api/auth/generate-invite`
- **权限**: 超级管理员
- **参数**:
  - `workspace_id`: 工作空间 ID（可选）
  - `max_uses`: 最大使用次数（可选，默认 1）
  - `expires_at`: 过期时间（可选）

---

## 🗄️ 数据库表

### users 表更新

```sql
ALTER TABLE users
ADD COLUMN qq VARCHAR(20) UNIQUE AFTER email,
ADD INDEX idx_qq (qq);
```

### invite_codes 表

```sql
CREATE TABLE invite_codes (
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
);
```

---

## 🚀 使用示例

### 1. 生成邀请码

```bash
# 使用超级管理员 token
curl -X POST http://localhost:3001/api/auth/generate-invite \
  -H "Authorization: Bearer <superadmin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "workspace_id": "workspace-uuid",
    "max_uses": 10,
    "expires_at": "2026-03-18T00:00:00Z"
  }'
```

### 2. 管理员绑定

```bash
curl -X POST http://localhost:3001/api/auth/bind-admin \
  -H "Content-Type: application/json" \
  -d '{
    "qq": "123456789",
    "email": "admin@example.com",
    "password": "password123"
  }'
```

### 3. 客户绑定

```bash
curl -X POST http://localhost:3001/api/auth/bind-client \
  -H "Content-Type: application/json" \
  -d '{
    "qq": "987654321",
    "invite_code": "INV-ABC1234567890",
    "email": "client@example.com",
    "password": "password456"
  }'
```

---

## 🤖 QQ Bot 集成

### 处理 QQ 消息

```typescript
// 在 QQ Bot 中处理绑定命令
async function handleQQBindCommand(qq: string, command: string) {
  const [type, ...args] = command.split(' ');

  if (type === '/bind-admin') {
    // 处理管理员绑定
    const [, qqNum, email, password] = args;

    const response = await fetch('http://localhost:3001/api/auth/bind-admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        qq: qqNum || qq,
        email,
        password,
      }),
    });

    const result = await response.json();

    if (result.success) {
      // 发送绑定成功消息
      sendQQMessage(qq, `✅ 管理员绑定成功\nToken: ${result.token}`);
    }
  } else if (type === '/bind-client') {
    // 处理客户绑定
    const [, qqNum, inviteCode, email, password] = args;

    const response = await fetch('http://localhost:3001/api/auth/bind-client', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        qq: qqNum || qq,
        invite_code: inviteCode,
        email,
        password,
      }),
    });

    const result = await response.json();

    if (result.success) {
      // 发送绑定成功消息
      sendQQMessage(qq, `✅ 客户绑定成功\nToken: ${result.token}`);
    }
  }
}
```

---

## 📊 邀请码状态

| 状态 | 描述 |
|------|------|
| `active` | 激活，可以使用 |
| `expired` | 已过期 |
| `disabled` | 已禁用 |

---

## 🔒 安全考虑

- ✅ 管理员绑定不需要邀请码（只有超级管理员可以绑定）
- ✅ 客户绑定必须使用有效的邀请码
- ✅ 邀请码有使用次数限制
- ✅ 邀请码有过期时间
- ✅ QQ 号唯一性约束
- ✅ 密码强度验证

---

**更新日期**: 2026-03-11
**版本**: 1.0.0
