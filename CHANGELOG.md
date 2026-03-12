# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.0] - 2026-03-12

### Added
- **🚀 技能管理系统** - 完整的技能生态系统
  - 技能商店浏览和搜索功能
  - 技能安装/卸载管理
  - 基于角色的技能权限控制
  - 工作空间级别的技能管理
  - 技能安装日志记录和审计
- **📊 完整前端管理界面**
  - 登录页面和仪表板
  - 用户管理页面
  - 工作空间管理页面
  - 角色管理页面
  - 权限管理页面
  - 技能管理页面
- **🔐 增强的权限系统**
  - 18 个权限作用域完整实现
  - 工作空间、会话、技能、频道、配置、用户权限分类
  - 细粒度权限控制
- **🏢 工作空间管理**
  - 独立工作空间创建和管理
  - 工作空间成员管理
  - 工作空间配置功能
  - 工作空间与用户绑定机制

### Fixed
- **Critical**: Dashboard API 500 错误 - 容器状态不稳定
  - 重新编译并部署整个系统
  - 修复容器启动问题
  - 更新 Docker 配置和环境变量
- **Critical**: 前端组件导入错误
  - 添加 Divider 组件导入到 Roles.tsx
  - 添加 Input 组件导入到 Permissions.tsx
- **Critical**: Vite 构建配置问题
  - 修改 tsconfig.json 包含 index.html
  - 更新 vite.config.ts 指定入口点
  - 解决 build.rollupOptions 配置

### Enhanced
- **🎨 前端界面优化**
  - 完善的 React 组件库集成
  - 响应式设计，支持移动端
  - 用户友好的操作界面
  - 实时状态反馈
- **🔧 后端 API 增强**
  - RESTful API 设计
  - JWT 认证系统
  - 错误处理和日志记录
  - 数据库操作优化
- **🐳 Docker 部署优化**
  - 完整的容器化部署方案
  - 自动化部署脚本
  - 服务健康检查
  - 日志管理

### Technical Details
- **出品方**: 乐盟互动 (Lemeng Interactive)
- **架构**: 微服务架构，前后端分离
- **前端**: React 18, TypeScript, Vite, Ant Design
- **后端**: Express 4, TypeScript, MySQL 8.0, JWT
- **基础设施**: Docker Compose, Nginx, MySQL 8.0
- **认证**: JWT with 24h expiration
- **默认管理员**: admin@openclaw.ai / SuperAdmin123!

### Database Schema
- **users**: 用户信息表
- **workspaces**: 工作空间表
- **workspace_members**: 工作空间成员表
- **roles**: 角色表
- **permissions**: 权限表
- **role_permissions**: 角色权限关联表
- **skills**: 技能信息表
- **workspace_skills**: 工作空间技能表
- **skill_permissions**: 技能权限表
- **skill_install_logs**: 技能安装日志表

### API Endpoints
- **认证模块**: `/api/auth/*` - 注册、登录、QQ绑定
- **用户管理**: `/api/users/*` - 用户CRUD、状态管理
- **工作空间**: `/api/workspaces/*` - 工作空间CRUD、成员管理
- **角色管理**: `/api/roles/*` - 角色CRUD、权限管理
- **权限管理**: `/api/permissions/*` - 权限检查、分配
- **技能管理**: `/api/skills/*` - 技能商店、安装、配置

### Deployment
- **生产地址**: http://43.156.131.98:8998/admin/
- **容器服务**: openclaw-permissions-frontend, openclaw-permissions-backend, openclaw-permissions-mysql
- **Nginx配置**: /www/server/panel/vhost/nginx/proxy/43.156.131.98/
- **技能商店支持**: skillhub (国内) + clawhub (国际) 双注册源

### Security Features
- JWT Token 认证
- 基于角色的访问控制 (RBAC)
- 权限作用域验证
- 密码加密存储 (bcrypt)
- API 访问日志
- 操作审计日志

### Known Issues
- None at this time

### Migration Notes
- Run docker-compose up -d for full deployment
- Use ./deploy.sh for automated deployment
- Check docker-compose logs -f for system health
- Super admin can be accessed via admin@openclaw.ai / SuperAdmin123!

---

## [1.1.0] - 2026-03-11

### Added
- Initial release of Permissions System
- User authentication with JWT tokens
- Role-based access control (RBAC)
- Permissions management system
- Workspace isolation
- QQ Bot binding integration
- Web-based admin panel (React + TypeScript)
- RESTful API (Express + TypeScript)
- MySQL database backend
- Docker containerization
- Nginx reverse proxy configuration

### Fixed
- **Critical**: Login API URL configuration - Vite environment variables not properly passed through Docker build
  - Modified Dockerfile to accept ARG VITE_API_BASE_URL and set as ENV
  - Updated docker-compose.yml to pass build args and environment variables
  - Full rebuild required with --no-cache flag
- **Critical**: Frontend component imports missing
  - Added Divider import to Roles.tsx
  - Added Input import to Permissions.tsx
- Build caching issues resolved by using --no-cache

### Technical Details
- Frontend: React 18, TypeScript, Vite, Ant Design
- Backend: Express 4, TypeScript, MySQL 8.0, JWT
- Infrastructure: Docker Compose, Nginx, MySQL 8.0
- Authentication: JWT with 24h expiration
- Default admin: admin@openclaw.ai / SuperAdmin123!

### Deployment
- Production URL: http://43.156.131.98:8998/admin/
- Frontend container: openclaw-permissions-frontend
- Backend container: openclaw-permissions-backend
- Database container: openclaw-permissions-mysql
- Nginx config: /www/server/panel/vhost/nginx/proxy/43.156.131.98/

### Known Issues
- None at this time

### Migration Notes
- Run init-superadmin.sh to create default admin user
- Ensure MySQL data volume persists across container restarts
- Update .env files with production credentials before deployment
