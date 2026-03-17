# Permissions System - 权限管理系统

**版本**: v1.0.0
**最后更新**: 2026-03-17
**状态**: ✅ 生产就绪

---

## 📋 项目简介

一个完整的权限管理系统，支持用户、角色、权限、菜单的灵活配置和管理。

### 核心功能

- ✅ 用户管理（创建、编辑、删除）
- ✅ 角色管理（角色CRUD）
- ✅ 权限管理（权限CRUD）
- ✅ 菜单管理（菜单CRUD）
- ✅ RBAC权限系统
- ✅ JWT认证
- ✅ 响应式UI设计

---

## 🚀 快速开始

### 访问地址

- **前端**: http://43.156.131.98:3000
- **后端API**: http://43.156.131.98:8001
- **API文档**: http://43.156.131.98:8001/docs

### 默认账号

| 邮箱 | 密码 | 角色 |
|-----|------|------|
| admin@example.com | Admin123! | 管理员 |

⚠️ **重要**: 首次登录后请立即修改默认密码！

---

## 📁 项目结构

```
permissions-system/
├── backend/              # 后端服务
│   ├── src/
│   ├── package.json
│   └── Dockerfile
├── frontend/             # 前端服务
│   ├── src/
│   ├── package.json
│   └── Dockerfile
├── database/             # 数据库文件 ✨
│   ├── schema.sql       # 数据库结构 + 初始数据
│   ├── data.sql         # 完整初始数据
│   ├── FILES.md        # 数据库文件清单
│   ├── README.md       # 完整数据库文档
│   └── QUICK-START.md # 快速开始指南
├── docker-compose.yml    # Docker编排配置
├── DATABASE.md          # 数据库文档
└── README.md           # 项目文档
```

---

## 💾 数据库

### 数据库文件位置

所有数据库文件位于 `database/` 目录：

| 文件 | 描述 | 大小 |
|-----|------|------|
| schema.sql | 数据库结构 + 初始数据 | ~8 KB |
| data.sql | 完整初始数据 | ~6 KB |
| FILES.md | 数据库文件清单 | ~6 KB |
| README.md | 完整数据库文档 | ~12 KB |
| QUICK-START.md | 快速开始指南 | ~2 KB |

### 导入数据库

```bash
# 方式1: 一键导入（schema.sql包含初始数据）
docker exec -i permissions_db mysql -uroot -prootpassword < database/schema.sql

# 方式2: 分步导入
docker exec -i permissions_db mysql -uroot -prootpassword < database/schema.sql
docker exec -i permissions_db mysql -uroot -prootpassword permissions_system < database/data.sql
```

### 数据库结构

**7个数据表**:
- users（用户表）
- roles（角色表）
- permissions（权限表）
- menus（菜单表）
- role_permissions（角色权限关联表）
- role_menus（角色菜单关联表）

**初始数据**:
- 4个角色（admin, user, editor, auditor）
- 18个权限
- 9个菜单（含子菜单）
- 4个用户（默认密码：Admin123!）

### 详细文档

- **文件清单**: [database/FILES.md](./database/FILES.md)
- **完整文档**: [database/README.md](./database/README.md)
- **快速开始**: [database/QUICK-START.md](./database/QUICK-START.md)

---

## 🐳 Docker 部署

### 启动服务

```bash
# 启动所有服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f
```

### 服务端口

| 服务 | 端口 |
|-----|------|
| 前端 | 3000 |
| 后端 | 8001 |
| 数据库 | 3310 |

---

## 🔐 安全配置

### JWT认证
- 所有API请求需要JWT Token
- Token过期时间: 24小时
- 401错误自动跳转到登录页

### 密码加密
- 使用 bcrypt 加密
- 盐值轮数: 10
- 默认密码: Admin123!

### RBAC权限
- 基于角色的访问控制
- 灵活的权限配置
- 菜单访问控制

---

## 📊 技术栈

### 前端
- **框架**: React 18
- **UI库**: Ant Design 5
- **HTTP客户端**: Axios
- **路由**: React Router 6

### 后端
- **框架**: Node.js + Express
- **数据库**: MySQL 8.0
- **认证**: JWT
- **ORM**: 自定义（无ORM）

### 基础设施
- **容器**: Docker + Docker Compose
- **Web服务器**: Nginx

---

## 📝 文档

### 项目文档
- [DATABASE.md](./DATABASE.md) - 数据库文档
- [DEPLOYMENT.md](./DEPLOYMENT.md) - 部署文档
- [API.md](./API.md) - API文档
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - 故障排查

### 数据库文档
- [database/FILES.md](./database/FILES.md) - 数据库文件清单
- [database/README.md](./database/README.md) - 完整数据库文档
- [database/QUICK-START.md](./database/QUICK-START.md) - 快速开始指南

---

## 🧪 测试

### 功能测试

- ✅ 用户管理CRUD
- ✅ 角色管理CRUD
- ✅ 权限管理CRUD
- ✅ 菜单管理CRUD
- ✅ 登录认证
- ✅ 权限验证

### 测试结果

- ✅ 15/15 测试用例通过（100%）
- ✅ 容器健康检查全部通过
- ✅ 外网访问正常
- ✅ API功能正常

详细测试报告: [FINAL-TEST-REPORT.md](./FINAL-TEST-REPORT.md)

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

---

## 📞 技术支持

- **GitHub**: https://github.com/AQzzzQA/permissions-system
- **Issues**: https://github.com/AQzzzQA/permissions-system/issues
- **Email**: support@example.com

---

## 📄 许可证

MIT License

---

## 🎉 致谢

感谢所有贡献者的支持！

---

**版本**: v1.0.0
**状态**: ✅ 生产就绪
**最后更新**: 2026-03-17
**维护人员**: Echo-2 (Agentic AI) 🚀
