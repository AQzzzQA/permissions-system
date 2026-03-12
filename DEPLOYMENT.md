# OpenClaw 权限控制系统 - 完整部署指南

## 🚀 一键部署

### 前置要求

- Docker 20.10+
- Docker Compose 2.0+
- 至少 2GB 可用内存

### 快速启动

```bash
# 1. 克隆或进入项目目录
cd /root/.openclaw/workspace/permissions-system

# 2. 赋予执行权限
chmod +x deploy.sh stop.sh

# 3. 一键部署
./deploy.sh
```

### 手动部署

```bash
# 1. 配置环境变量
cp backend/.env.example backend/.env
# 编辑 backend/.env，设置数据库密码和 JWT secret

# 2. 启动服务
docker-compose up -d

# 3. 查看日志
docker-compose logs -f
```

---

## 📋 服务架构

```
┌─────────────────────────────────────────────┐
│         Nginx (端口 8998)                 │
│  ┌─────────────────────────────────────┐   │
│  │ /admin/  → Frontend (3000)       │   │
│  │ /api/    → Backend (3001)         │   │
│  │ /gateway/→ OpenClaw Gateway       │   │
│  │ /ws      → WebSocket             │   │
│  └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
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

---

## 🔧 配置说明

### 后端配置 (`backend/.env`)

```env
# 服务器配置
PORT=3001
NODE_ENV=production

# 数据库配置
DB_HOST=mysql
DB_PORT=3306
DB_USER=openclaw
DB_PASSWORD=your_password_here
DB_NAME=openclaw_permissions

# JWT 配置
JWT_SECRET=your_jwt_secret_key_here_change_this_in_production
JWT_EXPIRES_IN=24h

# CORS 配置
CORS_ORIGIN=http://localhost:3000

# 超级管理员配置
SUPERADMIN_EMAIL=admin@openclaw.ai
SUPERADMIN_PASSWORD=SuperAdmin123!

# OpenClaw Gateway 配置
GATEWAY_URL=ws://127.0.0.1:18789
GATEWAY_TOKEN=your_gateway_token_here
```

### 前端配置 (`frontend/.env`)

```env
VITE_API_BASE_URL=http://localhost:3001/api
```

---

## 🌐 访问地址

部署成功后，可以通过以下地址访问：

| 服务 | URL | 说明 |
|------|-----|------|
| 权限管理前端 | http://localhost:8998/admin/ | React 管理界面 |
| 后端 API | http://localhost:8998/api/ | RESTful API |
| 健康检查 | http://localhost:8998/health | 服务健康状态 |
| OpenClaw Gateway | http://localhost:8998/gateway/ | OpenClaw UI |

---

## 🔑 默认账户

**超级管理员**:
- **邮箱**: admin@openclaw.ai
- **密码**: SuperAdmin123!

⚠️ **生产环境请务必修改默认密码！**

---

## 🛠️ 常用命令

### 服务管理

```bash
# 启动服务
docker-compose up -d

# 停止服务
./stop.sh
# 或
docker-compose down

# 重启服务
docker-compose restart

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mysql
```

### 数据库管理

```bash
# 进入 MySQL 容器
docker-compose exec mysql mysql -u openclaw -popenclaw_password openclaw_permissions

# 备份数据库
docker-compose exec mysql mysqldump -u openclaw -popenclaw_password openclaw_permissions > backup.sql

# 恢复数据库
docker-compose exec -T mysql mysql -u openclaw -popenclaw_password openclaw_permissions < backup.sql
```

### 重新部署

```bash
# 停止并删除容器
docker-compose down

# 重新构建并启动
./deploy.sh
```

---

## 🔍 故障排查

### 1. 服务无法启动

```bash
# 检查端口占用
lsof -i :8998
lsof -i :3000
lsof -i :3001
lsof -i :3306

# 检查服务日志
docker-compose logs
```

### 2. 数据库连接失败

```bash
# 检查 MySQL 是否就绪
docker-compose exec mysql mysqladmin ping -h localhost

# 等待 MySQL 完全启动
docker-compose up -d mysql
sleep 10
docker-compose up -d backend
```

### 3. 前端无法访问后端

```bash
# 检查环境变量
cat frontend/.env

# 检查后端服务
curl http://localhost:3001/health
```

### 4. Nginx 502 Bad Gateway

```bash
# 检查后端服务是否正常运行
docker-compose ps

# 检查后端日志
docker-compose logs backend

# 重启 Nginx
docker-compose restart nginx
```

---

## 📊 性能优化

### 1. 数据库优化

```bash
# 在 MySQL 容器中执行
docker-compose exec mysql mysql -u openclaw -popenclaw_password openclaw_permissions

-- 添加索引
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_qq ON users(qq);
CREATE INDEX idx_workspace_members_workspace ON workspace_members(workspace_id);
```

### 2. 后端优化

```env
# 在 backend/.env 中添加
NODE_ENV=production
NODE_OPTIONS=--max-old-space-size=2048
```

### 3. Nginx 优化

```nginx
# 在 nginx.conf 中添加
gzip on;
gzip_types text/plain text/css application/json application/javascript;
```

---

## 🔒 安全建议

### 生产环境

1. **修改默认密码**
   ```bash
   # 登录后端容器
   docker-compose exec backend npm run reset-password <new_password>
   ```

2. **使用强密码和密钥**
   ```env
   # 生成随机密钥
   openssl rand -base64 32
   ```

3. **启用 HTTPS**
   ```nginx
   server {
       listen 443 ssl http2;
       ssl_certificate /path/to/cert.pem;
       ssl_certificate_key /path/to/key.pem;
       # ...
   }
   ```

4. **限制网络访问**
   ```yaml
   # docker-compose.yml
   ports:
       - "127.0.0.1:3001:3001"  # 只允许本地访问
   ```

5. **定期备份数据**
   ```bash
   # 创建备份脚本
   #!/bin/bash
   DATE=$(date +%Y%m%d_%H%M%S)
   docker-compose exec mysql mysqldump -u openclaw -popenclaw_password openclaw_permissions > backup_${DATE}.sql
   ```

---

## 📈 监控

### 健康检查

```bash
# 检查所有服务
curl http://localhost:8998/health

# 检查后端
curl http://localhost:3001/health

# 检查前端
curl -I http://localhost:3000
```

### 日志监控

```bash
# 实时查看所有日志
docker-compose logs -f

# 查看错误日志
docker-compose logs | grep ERROR
```

---

## 🆙 更新部署

```bash
# 1. 拉取最新代码
git pull

# 2. 停止服务
docker-compose down

# 3. 重新部署
./deploy.sh
```

---

## 🤝 支持

如遇问题，请查看：
- [README.md](./README.md) - 项目文档
- [DESIGN.md](./DESIGN.md) - 设计文档
- [INTEGRATION.md](./INTEGRATION.md) - 集成方案
- [QQ-BINDING.md](./QQ-BINDING.md) - QQ 绑定文档

---

**更新日期**: 2026-03-11
**版本**: 1.1.0
