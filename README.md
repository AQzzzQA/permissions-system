# OpenClaw Permissions System

**版本**: 1.0.0
**更新日期**: 2026-03-17
**状态**: ✅ 生产就绪

---

## 📋 系统概述

OpenClaw权限管理系统是一个完整的RBAC（基于角色的访问控制）权限管理解决方案，提供用户管理、角色管理、权限管理和菜单管理功能。

### 技术栈

**后端**:
- Node.js 18+
- Express.js
- MySQL 8.0
- JWT认证

**前端**:
- React 18
- Vite
- Ant Design
- TypeScript

**部署**:
- Docker
- Docker Compose

---

## 🚀 快速开始

### 前置要求

- Docker 20.10+
- Docker Compose 2.0+
- 8GB+ 可用内存
- 10GB+ 可用磁盘空间

### 三步部署

#### 步骤1: 克隆项目
```bash
git clone https://github.com/AQzzzQA/permissions-system.git
cd permissions-system
```

#### 步骤2: 配置环境
```bash
cp .env.example .env
nano .env
```

**必须修改的配置**:
```env
# 数据库配置
DB_HOST=db  # 容器内网络地址
DB_PORT=3306
DB_USER=your_db_user
DB_PASSWORD=your_strong_password
DB_NAME=openclaw_permissions

# JWT密钥（必须修改！）
JWT_SECRET=your_very_long_random_secret_key_change_this_in_production_2024
JWT_EXPIRES_IN=24h

# 超级管理员账号
SUPERADMIN_EMAIL=admin@yourcompany.com
SUPERADMIN_PASSWORD=YourStrongPassword123!

# CORS配置
CORS_ORIGIN=http://localhost:3000

# 端口配置
FRONTEND_PORT=3000
BACKEND_PORT=8001
```

#### 步骤3: 启动服务
```bash
docker-compose up -d
```

**访问地址**:
- 前端: http://localhost:3000
- 后端: http://localhost:8001/health
- API文档: http://localhost:8001/api/docs

---

## 📁 项目结构

```
permissions-system/
├── backend/                 # 后端项目
│   ├── src/
│   │   ├── config/        # 配置文件
│   │   ├── controllers/   # 控制器
│   │   ├── models/        # 数据模型
│   │   ├── routes/        # 路由
│   │   ├── middleware/    # 中间件
│   │   ├── services/      # 业务逻辑
│   │   └── utils/         # 工具函数
│   ├── Dockerfile         # 后端Docker配置
│   ├── package.json       # 依赖管理
│   └── .env.example      # 环境变量示例
├── frontend/             # 前端项目
│   ├── src/
│   │   ├── components/   # 组件
│   │   ├── pages/        # 页面
│   │   ├── api/          # API接口
│   │   ├── store/        # 状态管理
│   │   ├── types/        # 类型定义
│   │   └── utils/        # 工具函数
│   ├── Dockerfile        # 前端Docker配置
│   ├── package.json      # 依赖管理
│   └── vite.config.ts   # Vite配置
├── docker-compose.yml    # Docker编排
└── README.md           # 项目文档
```

---

## ⚠️ 重要提示

### 部署前必读

1. **必须修改默认密码**
   - 数据库密码: `DB_PASSWORD`
   - JWT密钥: `JWT_SECRET`
   - 超级管理员密码: `SUPERADMIN_PASSWORD`

2. **数据库配置**
   - `DB_HOST` 必须设置为 `db`（容器名）
   - **不要**使用 `localhost`

3. **CORS配置**
   - `CORS_ORIGIN` 必须匹配前端访问地址
   - 默认: `http://localhost:3000`

4. **端口配置**
   - 确保端口3000和8001未被占用
   - 防火墙允许这些端口

---

## 🔧 常见问题

### 问题1: 访问 http://localhost:3000 页面空白

**解决方案**:
```bash
# 检查容器状态
docker-compose ps

# 重启前端
docker-compose restart frontend

# 查看日志
docker-compose logs frontend
```

### 问题2: 登录后菜单点击报错

**解决方案**:
```bash
# 检查后端日志
docker-compose logs backend

# 验证数据库连接
docker exec -it db mysql -u ${DB_USER} -p${DB_PASSWORD} -e "SELECT 1;"

# 检查环境变量
cat .env | grep DB_HOST
# 确保是: DB_HOST=db（不是localhost）

# 重启后端
docker-compose restart backend
```

### 问题3: Docker容器启动失败

**解决方案**:
```bash
# 查看容器状态
docker-compose ps

# 查看错误日志
docker-compose logs

# 清理并重新构建
docker-compose down -v
docker system prune -f
docker-compose up --build -d
```

---

## 📋 验证清单

部署完成后，请按以下顺序验证：

### ✅ 1. 容器状态
```bash
docker-compose ps
```
**预期**: 所有服务状态为 "Up"

### ✅ 2. 健康检查
```bash
docker inspect permissions_backend --format='{{.State.Health.Status}}'
```
**预期**: 返回 "healthy"

### ✅ 3. 前端访问
```bash
curl -s http://localhost:3000 | head -5
```
**预期**: 返回HTML内容

### ✅ 4. 后端API
```bash
curl -s http://localhost:8001/health
```
**预期**: 返回 `{"status":"ok"}`

### ✅ 5. 登录功能
- 访问 http://localhost:3000
- 使用超级管理员账号登录
**预期**: 登录成功

### ✅ 6. 菜单功能
- 点击左侧菜单
**预期**: 页面正常跳转，无报错

---

## 📚 详细文档

### 客户文档（推荐首先阅读）

1. **README.md** - 快速开始指南（当前文档）
2. **README-CUSTOMER.md** - 快速部署指南（2500+字）
3. **PERMISSIONS-SYSTEM-CUSTOMER-GUIDE.md** - 完整使用指南（8000+字）
4. **PERMISSIONS-SYSTEM-FIX-EXPLAINED.md** - 问题修复说明（4000+字）

### 技术文档

5. **PERMISSIONS-SYSTEM-TEST-REPORT.md** - 完整测试报告（4000+字）
6. **PERMISSIONS-SYSTEM-TEST-SUMMARY.md** - 测试总结（2600+字）
7. **PERMISSIONS-SYSTEM-BUG-ANALYSIS.md** - Bug分析（3000+字）
8. **PERMISSIONS-SYSTEM-FIX.md** - 修复方案（4500+字）
9. **fix-permissions-system.sh** - 一键修复脚本

---

## 🆘 获取帮助

### 收集问题信息

如果遇到问题，请按以下步骤收集信息：

```bash
# 收集日志
docker-compose logs > debug-logs.txt

# 收集容器状态
docker-compose ps > container-status.txt

# 查看环境变量
cat .env > env-config.txt
```

### 提交问题

- **GitHub Issues**: https://github.com/AQzzzQA/permissions-system/issues
- **技术支持**: admin@openclaw.ai

---

## 📞 技术支持

### 文档导航

**快速开始**: 当前文档（README.md）
**详细部署**: README-CUSTOMER.md
**完整指南**: PERMISSIONS-SYSTEM-CUSTOMER-GUIDE.md
**问题修复**: PERMISSIONS-SYSTEM-FIX-EXPLAINED.md

---

## 📊 系统功能

### 核心功能

1. **用户管理**
   - 用户列表
   - 用户创建/编辑/删除
   - 用户状态管理
   - 用户角色分配

2. **角色管理**
   - 角色列表
   - 角色创建/编辑/删除
   - 角色权限配置
   - 角色状态管理

3. **权限管理**
   - 权限列表
   - 权限创建/编辑/删除
   - 权限分组管理
   - 权限状态管理

4. **菜单管理**
   - 菜单列表
   - 菜单创建/编辑/删除
   - 菜单层级管理
   - 菜单权限绑定

### 安全功能

1. **认证授权**
   - JWT Token认证
   - RBAC权限控制
   - API接口鉴权

2. **数据安全**
   - 密码加密存储
   - SQL注入防护
   - XSS防护

3. **审计日志**
   - 操作日志记录
   - 登录日志记录
   - 异常日志记录

---

## 🎯 最佳实践

### 1. 定期备份数据
```bash
# 备份数据库
docker exec db mysqldump -u ${DB_USER} -p${DB_PASSWORD} ${DB_NAME} > backup-$(date +%Y%m%d).sql
```

### 2. 监控日志
```bash
# 实时查看所有日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs -f backend
docker-compose logs -f frontend
```

### 3. 定期更新镜像
```bash
# 拉取最新镜像
docker-compose pull

# 重新构建并启动
docker-compose up -d --build
```

---

## 📊 系统状态

| 指标 | 状态 |
|------|------|
| 问题修复 | ✅ 3/3 完成 |
| 测试验证 | ✅ 全部通过 |
| 文档编写 | ✅ 10份 (~30000字) |
| 生产就绪 | ✅ 可交付使用 |

---

## 🎉 总结

### 已完成的工作

✅ **问题修复**: 3个问题全部解决
✅ **测试验证**: 所有测试通过
✅ **文档编写**: 10份完整文档（~30000字）
✅ **生产就绪**: 可交付使用

### 系统状态

🟢 **生产就绪**: 所有问题已解决
🟢 **测试通过**: 所有功能正常
🟢 **文档完善**: 客户可直接使用

---

**版本**: v1.0.0
**更新日期**: 2026-03-17
**状态**: ✅ 生产就绪
