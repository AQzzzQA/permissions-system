# OpenClaw 权限控制与独立工作空间系统设计

## 📋 需求分析

### 1. 独立工作空间
- 每个工作空间拥有独立的数据隔离
- 支持多工作空间管理
- 工作空间级别的配置和资源管理

### 2. 权限控制
- 用户级别的权限管理
- 角色基础的访问控制（RBAC）
- 工作空间级别的权限隔离
- 细粒度权限配置（会话、技能、频道等）

### 3. 用户管理
- 用户注册/登录
- 用户组管理
- 用户状态管理（启用/禁用）

## 🏗️ 系统架构

```
┌─────────────────────────────────────────────────────────────┐
│                     OpenClaw Gateway                       │
│                  (核心网关，不做修改)                       │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ WebSocket / HTTP API
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              Permissions Service (新增)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Auth       │  │   Workspace  │  │   ACL        │  │
│  │   Service    │  │   Service    │  │   Service    │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ 数据库层
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                      Database                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐│
│  │  Users   │  │ Workspaces│  │  Roles   │  │  ACL     ││
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘│
└─────────────────────────────────────────────────────────────┘
                       │
                       │ WebSocket / HTTP API
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              Admin UI (新增前端)                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐│
│  │用户管理  │  │工作空间  │  │角色管理  │  │权限配置  ││
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘│
└─────────────────────────────────────────────────────────────┘
```

## 🗄️ 数据库设计

### users 表
```sql
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    status ENUM('active', 'disabled', 'pending') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### workspaces 表
```sql
CREATE TABLE workspaces (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    owner_id VARCHAR(36) NOT NULL,
    description TEXT,
    config JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id)
);
```

### workspace_members 表
```sql
CREATE TABLE workspace_members (
    id VARCHAR(36) PRIMARY KEY,
    workspace_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    role_id VARCHAR(36) NOT NULL,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (workspace_id) REFERENCES workspaces(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (role_id) REFERENCES roles(id),
    UNIQUE KEY unique_member (workspace_id, user_id)
);
```

### roles 表
```sql
CREATE TABLE roles (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    description TEXT,
    scopes JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### permissions 表 (ACL)
```sql
CREATE TABLE permissions (
    id VARCHAR(36) PRIMARY KEY,
    resource_type ENUM('workspace', 'session', 'skill', 'channel', 'config') NOT NULL,
    resource_id VARCHAR(36),
    user_id VARCHAR(36),
    role_id VARCHAR(36),
    actions JSON NOT NULL,  // ['read', 'write', 'delete', 'admin']
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (role_id) REFERENCES roles(id)
);
```

### user_sessions 表 (用于会话隔离)
```sql
CREATE TABLE user_sessions (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    workspace_id VARCHAR(36) NOT NULL,
    session_key VARCHAR(100) NOT NULL,
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (workspace_id) REFERENCES workspaces(id)
);
```

## 🔐 权限模型

### 默认角色

#### 1. Workspace Owner (工作空间所有者)
- 完全控制工作空间
- 可以添加/删除成员
- 可以配置所有权限

#### 2. Workspace Admin (工作空间管理员)
- 管理工作空间资源
- 可以添加/删除普通成员
- 不能删除工作空间

#### 3. Workspace Member (工作空间成员)
- 访问分配的资源
- 不能管理其他用户

#### 4. Viewer (只读用户)
- 只能查看分配的资源
- 不能修改任何配置

### 权限作用域 (Scopes)

```
workspace.read    - 读取工作空间信息
workspace.write   - 修改工作空间配置
workspace.admin   - 工作空间管理权限
session.read      - 读取会话
session.write     - 写入会话
session.delete    - 删除会话
skill.read        - 读取技能
skill.write       - 配置技能
channel.read      - 读取频道配置
channel.write     - 修改频道配置
config.read       - 读取配置
config.write      - 修改配置
```

## 🔌 API 设计

### 认证 API

```
POST /api/auth/register     - 用户注册
POST /api/auth/login       - 用户登录
POST /api/auth/logout      - 用户登出
GET  /api/auth/me         - 获取当前用户信息
```

### 用户管理 API

```
GET    /api/users              - 获取用户列表
GET    /api/users/:id          - 获取用户详情
POST   /api/users              - 创建用户
PUT    /api/users/:id          - 更新用户
DELETE /api/users/:id          - 删除用户
PUT    /api/users/:id/status   - 更新用户状态
```

### 工作空间 API

```
GET    /api/workspaces              - 获取工作空间列表
GET    /api/workspaces/:id          - 获取工作空间详情
POST   /api/workspaces              - 创建工作空间
PUT    /api/workspaces/:id          - 更新工作空间
DELETE /api/workspaces/:id          - 删除工作空间
GET    /api/workspaces/:id/members  - 获取工作空间成员
POST   /api/workspaces/:id/members  - 添加成员
DELETE /api/workspaces/:id/members/:userId - 删除成员
```

### 角色 API

```
GET    /api/roles              - 获取角色列表
GET    /api/roles/:id          - 获取角色详情
POST   /api/roles              - 创建角色
PUT    /api/roles/:id          - 更新角色
DELETE /api/roles/:id          - 删除角色
```

### 权限 API

```
GET    /api/permissions              - 获取权限列表
POST   /api/permissions              - 创建权限
PUT    /api/permissions/:id          - 更新权限
DELETE /api/permissions/:id          - 删除权限
GET    /api/permissions/check       - 检查权限
```

## 🎨 前端设计

### 技术栈
- React + TypeScript
- Ant Design
- React Router
- Axios

### 主要页面

#### 1. 登录/注册页 (`/login`, `/register`)
- 用户名/邮箱登录
- 用户注册

#### 2. Dashboard (`/`)
- 工作空间概览
- 快捷操作

#### 3. 用户管理 (`/users`)
- 用户列表
- 创建/编辑用户
- 用户状态管理

#### 4. 工作空间管理 (`/workspaces`)
- 工作空间列表
- 创建/编辑工作空间
- 成员管理

#### 5. 角色管理 (`/roles`)
- 角色列表
- 创建/编辑角色
- 权限配置

#### 6. 权限配置 (`/permissions`)
- 资源权限列表
- 创建/编辑权限

## 🚀 实施计划

### Phase 1: 后端基础 (1-2天)
- [ ] 数据库设计和创建
- [ ] 认证服务实现
- [ ] 用户 API 实现
- [ ] 工作空间 API 实现

### Phase 2: 权限系统 (1-2天)
- [ ] 角色和权限 API 实现
- [ ] 权限中间件
- [ ] 权限检查逻辑

### Phase 3: 前端开发 (2-3天)
- [ ] 前端框架搭建
- [ ] 登录/注册页面
- [ ] 用户管理页面
- [ ] 工作空间管理页面
- [ ] 角色和权限管理页面

### Phase 4: 集成测试 (1天)
- [ ] 集成测试
- [ ] 文档编写
- [ ] 部署指南

## 📦 项目结构

```
permissions-system/
├── backend/
│   ├── src/
│   │   ├── auth/
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   └── auth.middleware.ts
│   │   ├── users/
│   │   │   ├── users.controller.ts
│   │   │   ├── users.service.ts
│   │   │   └── users.model.ts
│   │   ├── workspaces/
│   │   │   ├── workspaces.controller.ts
│   │   │   ├── workspaces.service.ts
│   │   │   └── workspaces.model.ts
│   │   ├── roles/
│   │   │   ├── roles.controller.ts
│   │   │   ├── roles.service.ts
│   │   │   └── roles.model.ts
│   │   ├── permissions/
│   │   │   ├── permissions.controller.ts
│   │   │   ├── permissions.service.ts
│   │   │   └── permissions.middleware.ts
│   │   ├── database/
│   │   │   └── database.ts
│   │   └── index.ts
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Users.tsx
│   │   │   ├── Workspaces.tsx
│   │   │   ├── Roles.tsx
│   │   │   └── Permissions.tsx
│   │   ├── components/
│   │   │   ├── UserList.tsx
│   │   │   ├── WorkspaceList.tsx
│   │   │   └── RoleList.tsx
│   │   ├── services/
│   │   │   └── api.ts
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
├── docker-compose.yml
└── README.md
```

## 🔧 集成方式

### 与 OpenClaw Gateway 集成

1. **反向代理集成**
   - 在 Nginx/Caddy 中配置路由
   - `/` → OpenClaw Gateway UI
   - `/api/permissions` → Permissions Service
   - `/admin` → Permissions Admin UI

2. **WebSocket 拦截**
   - 拦截 Gateway WebSocket 连接
   - 验证用户 token
   - 注入工作空间上下文

3. **Session 隔离**
   - 在 `user_sessions` 表中记录会话归属
   - 根据 user_id 和 workspace_id 过滤会话

## 📝 配置示例

### openclaw.json 配置扩展

```json
{
  "permissions": {
    "enabled": true,
    "database": {
      "host": "localhost",
      "port": 3306,
      "username": "openclaw",
      "password": "password",
      "database": "openclaw_permissions"
    },
    "jwt": {
      "secret": "your-jwt-secret-key",
      "expiresIn": "24h"
    }
  }
}
```

## 🎯 核心特性

1. **完全隔离的工作空间** - 每个工作空间独立数据
2. **细粒度权限控制** - 资源级别的权限管理
3. **用户级别的认证** - 独立于设备配对
4. **角色基础的访问控制** - RBAC 模型
5. **Web UI 管理** - 直观的管理界面
6. **与 OpenClaw Gateway 无缝集成** - 不修改核心代码

---

**下一步**: 开始实施 Phase 1
