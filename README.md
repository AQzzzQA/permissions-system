# Permissions System - 权限管理系统

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version: v1.0.0](https://img.shields.io/badge/Version-v1.0.0-blue.svg)](https://github.com/AQzzzQA/permissions-system)
[![Status: Production Ready](https://img.shields.io/badge/Status-Production%20Ready-success.svg)](https://github.com/AQzzzQA/permissions-system)

**乐盟出品，必属精品！** 🚀

一个功能完善的权限管理系统，支持用户、角色、权限、菜单的灵活配置和管理。

---

## 📋 目录

- [功能特性](#功能特性)
- [快速开始](#快速开始)
- [项目结构](#项目结构)
- [数据库](#数据库)
- [部署](#部署)
- [功能文档](#功能文档)
- [技术栈](#技术栈)
- [测试](#测试)
- [常见问题](#常见问题)
- [故障排查](#故障排查)
- [贡献](#贡献)
- [许可证](#许可证)

---

## ✨ 功能特性

### 核心功能

- ✅ **用户管理** - 创建、查看、编辑、删除用户，支持密码修改、启用/禁用
- ✅ **角色管理** - 灵活的角色配置和权限分配，支持角色权限和菜单绑定
- ✅ **权限管理** - 细粒度的权限控制，支持按资源和操作分类
- ✅ **菜单管理** - 支持层级结构的菜单配置，支持图标、排序、路由配置
- ✅ **RBAC权限系统** - 基于角色的访问控制，完整的权限验证机制

### 安全功能

- ✅ **JWT认证** - 安全的 Token 认证机制，支持 Token 自动刷新
- ✅ **密码加密** - bcrypt 加密存储，盐值 10 轮
- ✅ **权限验证** - API 接口和前端路由权限控制
- ✅ **操作日志** - 完整的操作审计追踪
- ✅ **审计功能** - 数据变更审计，记录字段级变更

### UI/UX 功能

- ✅ **响应式设计** - 适配桌面、平板、移动设备
- ✅ **主题切换** - 支持亮色/暗色主题
- ✅ **现代界面** - 基于 Ant Design 的精美 UI
- ✅ **流畅交互** - 优化的用户体验，支持搜索、过滤、分页

### 系统功能

- ✅ **数据导出** - 支持 Excel、CSV、JSON 格式
- ✅ **数据备份** - 数据库备份和恢复
- ✅ **系统监控** - 实时监控系统状态
- ✅ **日志管理** - 完整的日志记录和查询

---

## 🚀 快速开始

### 方式1: Docker 部署（推荐）

#### 1. 克隆项目

```bash
git clone https://github.com/AQzzzQA/permissions-system.git
cd permissions-system
```

#### 2. 启动服务

```bash
# 启动所有服务
docker-compose up -d

# 查看服务状态
docker-compose ps
```

#### 3. 导入数据库

```bash
# 导入数据库结构 + 初始数据
docker exec -i permissions_db mysql -uroot -prootpassword < database/schema.sql

# 或导入完整初始数据
docker exec -i permissions_db mysql -uroot -prootpassword permissions_system < database/data.sql
```

#### 4. 访问系统

- **前端**: http://localhost:3000
- **后端API**: http://localhost:8001
- **默认账号**: admin@example.com / Admin123!

### 方式2: 本地开发

#### 1. 安装依赖

```bash
# 后端
cd backend
npm install

# 前端
cd frontend
npm install
```

#### 2. 配置环境

```bash
# 复制环境变量文件
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# 编辑配置
nano backend/.env
nano frontend/.env
```

#### 3. 启动服务

```bash
# 启动后端
cd backend
npm run dev

# 启动前端（新终端）
cd frontend
npm run dev
```

#### 4. 访问系统

- **前端**: http://localhost:3000
- **后端API**: http://localhost:8001

---

## 📁 项目结构

```
permissions-system/
├── backend/                   # 后端服务
│   ├── src/
│   │   ├── index.js          # 入口文件
│   │   ├── routes/          # API 路由
│   │   ├── middleware/      # 中间件
│   │   └── models/          # 数据模型
│   ├── package.json
│   └── Dockerfile
├── frontend/                  # 前端服务
│   ├── src/
│   │   ├── pages/           # 页面组件
│   │   ├── components/      # 公共组件
│   │   ├── api/            # API 接口
│   │   └── utils/          # 工具函数
│   ├── package.json
│   └── Dockerfile
├── database/                 # 数据库文件
│   ├── schema.sql           # 数据库结构 + 初始数据
│   ├── data.sql             # 完整初始数据
│   ├── FILES.md            # 数据库文件清单
│   ├── README.md           # 完整数据库文档
│   └── QUICK-START.md      # 快速开始指南
├── docker-compose.yml         # Docker 编排配置
├── DATABASE.md               # 数据库文档
├── DEPLOYMENT.md            # 部署文档
├── DATABASE-IMPORT.md        # 数据库导入文档
├── FEATURES.md              # 功能文档
├── API.md                   # API 文档
├── TROUBLESHOOTING.md       # 故障排查
├── GETTING-STARTED.md       # 入门指南（小白专用）
├── FINAL-FIX.md             # 登录问题修复报告
├── LOGIN-DEBUG-LOG.md       # 登录调试日志
└── README.md                # 项目文档
```

---

## 💾 数据库

### 数据库文件

所有数据库文件位于 `database/` 目录：

| 文件 | 大小 | 描述 |
|-----|------|------|
| schema.sql | ~8 KB | 数据库结构 + 初始数据 |
| data.sql | ~6 KB | 完整初始数据 |
| FILES.md | ~6 KB | 数据库文件清单 |
| README.md | ~12 KB | 完整数据库文档 |
| QUICK-START.md | ~2 KB | 快速开始指南 |

### 快速导入

```bash
# 方式1: 一键导入
docker exec -i permissions_db mysql -uroot -prootpassword < database/schema.sql

# 方式2: 分步导入
docker exec -i permissions_db mysql -uroot -prootpassword < database/schema.sql
docker exec -i permissions_db mysql -uroot -prootpassword permissions_system < database/data.sql
```

### 数据库结构

**7个数据表**:
- `users` - 用户表
- `roles` - 角色表
- `permissions` - 权限表
- `menus` - 菜单表
- `role_permissions` - 角色权限关联表
- `role_menus` - 角色菜单关联表
- `user_roles` - 用户角色关联表

### 默认账号

| 邮箱 | 密码 | 姓名 | 角色 | 权限数 | 菜单数 |
|-----|------|------|------|--------|--------|
| admin@example.com | Admin123! | Super Admin | admin | 18 | 9 |
| user@example.com | Admin123! | Test User | user | 5 | 1 |
| editor@example.com | Admin123! | Content Editor | editor | 10 | 2 |
| auditor@example.com | Admin123! | Data Auditor | auditor | 5 | 9 |

⚠️ **重要**: 首次登录后请立即修改默认密码！

### 详细文档

- **文件清单**: [database/FILES.md](./database/FILES.md)
- **完整文档**: [database/README.md](./database/README.md)
- **快速开始**: [database/QUICK-START.md](./database/QUICK-START.md)
- **数据库导入**: [DATABASE-IMPORT.md](./DATABASE-IMPORT.md)

---

## 📖 文档

### 完整文档

| 文档 | 描述 | 适用人群 |
|-----|------|---------|
| [GETTING-STARTED.md](./GETTING-STARTED.md) | 入门指南（小白专用） | 初学者 |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | 完整部署文档 | 运维人员 |
| [DATABASE-IMPORT.md](./DATABASE-IMPORT.md) | 数据库导入文档 | 开发/运维 |
| [DATABASE.md](./DATABASE.md) | 数据库文档 | 开发人员 |
| [FEATURES.md](./FEATURES.md) | 功能文档 | 产品/测试 |
| [API.md](./API.md) | API 文档 | 开发人员 |
| [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) | 故障排查 | 所有用户 |

### 数据库文档

| 文档 | 描述 | 适用人群 |
|-----|------|---------|
| [database/FILES.md](./database/FILES.md) | 数据库文件清单 | 所有用户 |
| [database/README.md](./database/README.md) | 完整数据库文档 | 开发人员 |
| [database/QUICK-START.md](./database/QUICK-START.md) | 快速开始指南 | 所有用户 |

### 修复和调试文档

| 文档 | 描述 |
|-----|------|
| [FINAL-FIX.md](./FINAL-FIX.md) | 登录问题修复报告（2026-03-17） |
| [LOGIN-DEBUG-LOG.md](./LOGIN-DEBUG-LOG.md) | 登录调试日志 |

---

## 🔧 部署

### Docker 部署（推荐）

详细部署步骤请查看: [DEPLOYMENT.md](./DEPLOYMENT.md)

```bash
# 快速部署
git clone https://github.com/AQzzzQA/permissions-system.git
cd permissions-system
docker-compose up -d
docker exec -i permissions_db mysql -uroot -prootpassword < database/schema.sql
```

### 服务端口

| 服务 | 端口 | 说明 |
|-----|------|------|
| 前端 | 3000 | Web 访问 |
| 后端 | 8001 | API 接口 |
| 数据库 | 3310 | MySQL 服务 |

### 环境变量

```bash
# 后端配置
DB_HOST=permissions_db
DB_PORT=3306
DB_NAME=permissions_system
DB_USER=root
DB_PASSWORD=rootpassword
JWT_SECRET=your-jwt-secret-key-change-in-production
JWT_EXPIRE=24h

# 前端配置
VITE_API_BASE_URL=http://localhost:8001/api
```

---

## 💻 技术栈

### 前端

- **框架**: React 18
- **UI库**: Ant Design 5
- **路由**: React Router 6
- **HTTP客户端**: Axios
- **状态管理**: React Hooks
- **构建工具**: Vite

### 后端

- **运行时**: Node.js 18
- **框架**: Express
- **认证**: JWT (jsonwebtoken)
- **密码加密**: bcrypt
- **数据库**: MySQL 8.0
- **ORM**: 自定义（无ORM）

### 基础设施

- **容器**: Docker + Docker Compose
- **Web服务器**: Nginx
- **进程管理**: PM2（可选）

---

## 🧪 测试

### 功能测试

- ✅ 用户管理CRUD
- ✅ 角色管理CRUD
- ✅ 权限管理CRUD
- ✅ 菜单管理CRUD
- ✅ 登录认证
- ✅ 权限验证
- ✅ 数据导出
- ✅ 操作日志

### 测试结果

- ✅ 20/20 测试用例通过（100%）
- ✅ 容器健康检查全部通过
- ✅ 外网访问正常
- ✅ API功能正常
- ✅ 前端界面正常
- ✅ 数据库连接正常

详细测试报告: [FINAL-TEST-REPORT.md](./FINAL-TEST-REPORT.md)

---

## ❓ 常见问题

### Q1: 如何快速开始？

**A**: 如果你是新手，请先阅读 [GETTING-STARTED.md](./GETTING-STARTED.md)，这是专门为小白准备的入门指南。

### Q2: 部署失败怎么办？

**A**: 请查看 [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)，里面列出了常见问题和解决方案。

### Q3: 如何导入数据库？

**A**: 请参考 [DATABASE-IMPORT.md](./DATABASE-IMPORT.md)，有详细的导入步骤和验证方法。

### Q4: 如何修改默认密码？

**A**: 登录后进入"系统设置" → "账号设置"，修改密码即可。

### Q5: 需要什么环境？

**A**: 需要 Docker 和 Docker Compose。如果使用本地开发，还需要 Node.js 18+ 和 MySQL 8.0+。

---

## 🐛 故障排查

### 登录问题修复（2026-03-17）

如果遇到登录失败，请参考 [FINAL-FIX.md](./FINAL-FIX.md) 查看完整的修复报告。

**已修复的问题**:
- ✅ 数据库字段缺失（username, is_superuser）
- ✅ 密码哈希无效（重新生成 bcryptjs 哈希）
- ✅ API 连接测试验证通过

**如果浏览器显示 "Network Error"**:
1. 强制刷新：`Ctrl+Shift+R`（Windows）或 `Cmd+Shift+R`（Mac）
2. 清除缓存：`Ctrl+Shift+Delete`，选择 "缓存图片和文件"
3. 重启前端容器：`docker-compose restart frontend`

### 更多故障排查

详细故障排查指南请查看: [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

---

## 🐛 已修复问题

### GitHub Issue #3: 登录后页面点击无反应 ✅
- 修复API路径配置错误
- 统一前后端API配置
- 增强错误日志和401自动跳转

### GitHub Issue #4: 页面排版错位 ✅
- 优化响应式布局
- 修复Ant Design组件样式
- 添加移动端媒体查询

### 登录问题修复（2026-03-17）✅
- 修复数据库字段缺失（username, is_superuser）
- 修复密码哈希无效（重新生成有效哈希）
- API 连接测试验证通过

---

## 🤝 贡献

欢迎贡献！请遵循以下步骤：

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

### 贡献指南

- 遵循现有代码风格
- 添加必要的测试
- 更新相关文档
- 提交清晰的commit message

---

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

---

## 📞 技术支持

- **GitHub**: https://github.com/AQzzzQA/permissions-system
- **Issues**: https://github.com/AQzzzQA/permissions-system/issues
- **Email**: support@example.com

---

## 🎉 致谢

感谢所有贡献者的支持！

---

**乐盟出品，必属精品！** 🚀

**版本**: v1.0.0
**状态**: ✅ 生产就绪
**最后更新**: 2026-03-18
**维护人员**: 乐盟技术团队
