# OpenClaw 权限控制系统 - README

## 🎯 项目概述

完整的权限控制与独立工作空间管理系统，为 OpenClaw Gateway 提供用户认证、工作空间管理和细粒度权限控制。

### 核心功能

- **🔐 用户认证**: 用户注册、登录、JWT token 认证
- **🏢 工作空间管理**: 创建、管理多个独立工作空间
- **🎭 角色管理**: 预定义角色（Owner、Admin、Member、Viewer）+ 自定义角色
- **🔑 权限控制**: 基于作用域的细粒度权限（18 个权限作用域）
- **👑 超级管理员**: 唯一超级管理员，拥有完全控制权限
- **💬 QQ 命令绑定**: 通过 QQ 消息快速绑定管理员和客户账户
- **🌐 完整前端**: React + Ant Design 现代化管理界面
- **🐳 Docker 部署**: 一键部署，开箱即用

---

## 📦 技术栈

### 后端
- **Node.js 18+** + Express + TypeScript
- **MySQL 8.0** (mysql2/promise)
- **JWT** (jsonwebtoken)
- **密码加密** (bcryptjs)

### 前端
- **React 18** + TypeScript
- **Ant Design 5**
- **React Router 6**
- **Axios**

### 基础设施
- **Docker** + Docker Compose
- **Nginx** 反向代理
- **MySQL** 数据持久化

---

## 🚀 快速开始

### 一键部署

```bash
# 1. 进入项目目录
cd /root/.openclaw/workspace/permissions-system

# 2. 赋予执行权限
chmod +x deploy.sh stop.sh

# 3. 一键部署
./deploy.sh
```

### 访问系统

部署成功后，访问：
- **权限管理前端**: http://localhost:8998/admin/
- **后端 API**: http://localhost:8998/api/
- **默认超级管理员**: admin@openclaw.ai / SuperAdmin123!

### 手动部署

```bash
# 1. 配置环境变量
cp backend/.env.example backend/.env

# 2. 启动服务
docker-compose up -d

# 3. 查看日志
docker-compose logs -f
```

详细部署指南请参考 [DEPLOYMENT.md](./DEPLOYMENT.md)。

---

## 📋 功能特性

### 用户管理
- ✅ 用户列表和搜索
- ✅ 创建、编辑、删除用户
- ✅ 用户状态管理（活跃、禁用、待审核）
- ✅ 密码重置（超级管理员）
- ✅ 用户统计

### 工作空间管理
- ✅ 工作空间 CRUD
- ✅ 成员管理（添加、删除、角色分配）
- ✅ 成员列表和角色编辑
- ✅ 工作空间描述和配置

### 角色管理
- ✅ 角色列表和创建
- ✅ 编辑角色权限
- ✅ 18 个预定义权限作用域
- ✅ 权限分组管理
- ✅ 角色权限详情查看

### 权限管理
- ✅ 权限列表和筛选
- ✅ 创建自定义权限
- ✅ 权限检查功能
- ✅ 按资源类型/用户/角色筛选
- ✅ 权限详情展示

### QQ 命令绑定
- ✅ `/bind-admin` - 绑定超级管理员
- ✅ `/bind-client` - 绑定客户（需要邀请码）
- ✅ 邀请码生成和管理
- ✅ 自动工作空间分配

---

## 📊 项目结构

```
permissions-system/
├── backend/                 # 后端服务
│   ├── src/
│   │   ├── auth/           # 认证模块
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.middleware.ts
│   │   │   └── qq-binding.controller.ts  # QQ 绑定
│   │   ├── workspaces/     # 工作空间管理
│   │   ├── users/          # 用户管理
│   │   ├── roles/          # 角色管理
│   │   ├── permissions/    # 权限管理
│   │   ├── database/       # 数据库
│   │   └── index.ts
│   ├── Dockerfile
│   ├── package.json
│   └── .env.example
├── frontend/                # 前端管理界面
│   ├── src/
│   │   ├── pages/          # 页面
│   │   │   ├── Login.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Users.tsx
│   │   │   ├── Workspaces.tsx
│   │   │   ├── Roles.tsx
│   │   │   └── Permissions.tsx
│   │   ├── components/     # 组件
│   │   ├── services/       # API 服务
│   │   ├── contexts/       # React Context
│   │   ├── layouts/        # 布局
│   │   └── types/          # 类型定义
│   ├── Dockerfile
│   ├── package.json
│   └── vite.config.ts
├── docker-compose.yml      # Docker 编排
├── nginx.conf             # Nginx 配置
├── deploy.sh              # 一键部署脚本
├── stop.sh               # 停止脚本
├── DESIGN.md             # 设计文档
├── INTEGRATION.md        # 集成方案
├── QQ-BINDING.md        # QQ 绑定文档
├── DEPLOYMENT.md        # 部署指南
├── CHANGELOG.md         # 变更日志
└── README.md            # 本文档
```

---

## 🔌 API 文档

### 认证模块 (`/api/auth`)

| 方法 | 路径 | 描述 |
|------|------|------|
| POST | `/register` | 用户注册 |
| POST | `/login` | 用户登录 |
| GET | `/me` | 获取当前用户 |
| PUT | `/password` | 修改密码 |
| POST | `/bind-admin` | QQ 绑定管理员 ✨ |
| POST | `/bind-client` | QQ 绑定客户 ✨ |
| GET | `/user-by-qq/:qq` | 通过 QQ 获取用户 ✨ |
| POST | `/generate-invite` | 生成邀请码 ✨ |

### 工作空间模块 (`/api/workspaces`)

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | `/` | 获取工作空间列表 |
| POST | `/` | 创建工作空间 |
| GET | `/:id` | 获取工作空间详情 |
| PUT | `/:id` | 更新工作空间 |
| DELETE | `/:id` | 删除工作空间 |
| GET | `/:id/members` | 获取工作空间成员 |
| POST | `/:id/members` | 添加成员 |
| DELETE | `/:id/members/:userId` | 删除成员 |
| PUT | `/:id/members/:userId` | 更新成员角色 |

### 用户管理模块 (`/api/users`)

| 方法 | 路径 | 描述 | 权限 |
|------|------|------|------|
| GET | `/` | 获取用户列表 | 超级管理员 |
| GET | `/stats` | 获取用户统计 | 超级管理员 |
| GET | `/:id` | 获取用户详情 | 超级管理员或自己 |
| GET | `/:id/workspaces` | 获取用户工作空间 | 超级管理员或自己 |
| POST | `/` | 创建用户 | 超级管理员 |
| PUT | `/:id` | 更新用户 | 超级管理员或自己 |
| DELETE | `/:id` | 删除用户 | 超级管理员 |
| POST | `/:id/reset-password` | 重置密码 | 超级管理员 |

### 角色管理模块 (`/api/roles`)

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | `/` | 获取角色列表 |
| GET | `/scopes` | 获取可用权限作用域 |
| GET | `/:id` | 获取角色详情 |
| GET | `/:id/usage` | 获取角色使用情况 |
| GET | `/:id/users` | 获取使用此角色的用户 |
| POST | `/` | 创建角色 |
| PUT | `/:id` | 更新角色 |
| DELETE | `/:id` | 删除角色 |

### 权限管理模块 (`/api/permissions`)

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | `/` | 获取权限列表 |
| POST | `/check` | 检查权限 |
| GET | `/user/:userId` | 获取用户权限 |
| GET | `/role/:roleId` | 获取角色权限 |
| GET | `/workspace/:workspaceId` | 获取工作空间权限 |
| POST | `/` | 创建权限 |
| GET | `/:id` | 获取权限详情 |
| PUT | `/:id` | 更新权限 |
| DELETE | `/:id` | 删除权限 |

---

## 🔐 权限作用域

系统定义了 18 个权限作用域：

### 工作空间权限
- `workspace.read` - 读取工作空间
- `workspace.write` - 修改工作空间
- `workspace.admin` - 工作空间管理

### 会话权限
- `session.read` - 读取会话
- `session.write` - 写入会话
- `session.delete` - 删除会话

### 技能权限
- `skill.read` - 读取技能
- `skill.write` - 配置技能
- `skill.delete` - 删除技能

### 频道权限
- `channel.read` - 读取频道
- `channel.write` - 修改频道
- `channel.delete` - 删除频道

### 配置权限
- `config.read` - 读取配置
- `config.write` - 修改配置
- `config.delete` - 删除配置

### 用户权限
- `user.read` - 读取用户
- `user.write` - 修改用户
- `user.delete` - 删除用户

---

## 🐳 Docker 部署

### 服务架构

```
┌─────────────────────────────────────────┐
│      Nginx (端口 8998)                │
│  ┌─────────────────────────────────┐   │
│  │ /admin/  → Frontend (3000)   │   │
│  │ /api/    → Backend (3001)     │   │
│  │ /gateway/→ OpenClaw Gateway   │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
           │            │
           │            │
┌──────────▼────┐  ┌───▼────────────┐
│  Frontend    │  │   Backend      │
│  (React)     │  │   (Node.js)    │
│  端口: 3000  │  │   端口: 3001   │
└───────────────┘  └───┬────────────┘
                       │
               ┌───────▼────────┐
               │   MySQL       │
               │   端口: 3306  │
               └───────────────┘
```

### 快速部署

```bash
# 一键部署
./deploy.sh

# 停止服务
./stop.sh

# 查看日志
docker-compose logs -f

# 重启服务
docker-compose restart
```

详细部署指南请参考 [DEPLOYMENT.md](./DEPLOYMENT.md)。

---

## 📚 文档

| 文档 | 描述 |
|------|------|
| [DESIGN.md](./DESIGN.md) | 系统设计文档 |
| [INTEGRATION.md](./INTEGRATION.md) | OpenClaw Gateway 集成方案 |
| [QQ-BINDING.md](./QQ-BINDING.md) | QQ 命令绑定文档 |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | 详细部署指南 |
| [CHANGELOG.md](./CHANGELOG.md) | 变更日志 |

---

## 📝 开发状态

| 阶段 | 状态 | 完成度 |
|------|------|--------|
| Phase 1: 后端基础 | ✅ 完成 | 100% |
| Phase 2: 权限系统 | ✅ 完成 | 100% |
| QQ 命令绑定 | ✅ 完成 | 100% |
| Phase 3: 前端开发 | ✅ 完成 | 100% |
| Phase 4: Docker 部署 | ✅ 完成 | 100% |

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

## 📄 许可证

MIT License

---

**开发者**: Echo-2
**日期**: 2026-03-11
**版本**: 1.1.0
**状态**: ✅ 完美集成完成
