# 部署文档

**项目**: Permissions System
**版本**: v1.0.0
**最后更新**: 2026-03-17

---

## 📋 目录

- [环境要求](#环境要求)
- [快速部署](#快速部署)
- [详细部署](#详细部署)
- [数据库部署](#数据库部署)
- [配置说明](#配置说明)
- [验证部署](#验证部署)
- [常见问题](#常见问题)

---

## 📦 环境要求

### 硬件要求
- CPU: 2核心以上
- 内存: 4GB 以上
- 磁盘: 20GB 以上
- 网络: 公网IP（可选）

### 软件要求
- Docker: 20.10+
- Docker Compose: 2.0+
- Node.js: 18+（本地开发）
- MySQL: 8.0+（可选，容器化部署不需要）

### 端口要求
| 端口 | 服务 | 说明 |
|-----|------|------|
| 3000 | 前端 | Web访问 |
| 8001 | 后端API | API接口 |
| 3310 | 数据库 | MySQL服务 |

⚠️ **注意**: 确保上述端口未被占用

---

## 🚀 快速部署

### 1. 克隆项目

```bash
git clone https://github.com/AQzzzQA/permissions-system.git
cd permissions-system
```

### 2. 启动服务

```bash
# 启动所有服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f
```

### 3. 导入数据库

```bash
# 导入 schema.sql（包含初始数据）
docker exec -i permissions_db mysql -uroot -prootpassword < database/schema.sql

# 或分步导入
docker exec -i permissions_db mysql -uroot -prootpassword < database/schema.sql
docker exec -i permissions_db mysql -uroot -prootpassword permissions_system < database/data.sql
```

### 4. 访问系统

- **前端**: http://localhost:3000
- **后端API**: http://localhost:8001
- **默认账号**: admin@example.com / Admin123!

---

## 🔧 详细部署

### 步骤1: 准备环境

#### 安装 Docker

**Ubuntu/Debian**:
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
```

**CentOS/RHEL**:
```bash
sudo yum install -y docker-ce docker-ce-cli containerd.io
```

**安装 Docker Compose**:
```bash
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

#### 验证安装

```bash
docker --version
docker-compose --version
```

### 步骤2: 克隆项目

```bash
git clone https://github.com/AQzzzQA/permissions-system.git
cd permissions-system
```

### 步骤3: 配置环境变量

#### 复制环境变量文件

```bash
cp .env.example .env
```

#### 编辑配置文件

```bash
# 编辑 .env 文件
nano .env
```

**配置说明**:
```bash
# 数据库配置
DB_HOST=permissions_db
DB_PORT=3306
DB_NAME=permissions_system
DB_USER=root
DB_PASSWORD=rootpassword

# 前端配置
FRONTEND_PORT=3000
VITE_API_BASE_URL=http://localhost:8001/api

# 后端配置
BACKEND_PORT=8001
JWT_SECRET=your-jwt-secret-key-change-in-production
JWT_EXPIRE=24h

# 日志配置
LOG_LEVEL=info
LOG_FILE=./logs/app.log
```

### 步骤4: 构建镜像

```bash
# 构建所有镜像
docker-compose build

# 或单独构建
docker-compose build frontend
docker-compose build backend
```

### 步骤5: 启动服务

```bash
# 启动所有服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db
```

### 步骤6: 导入数据库

#### 导入 schema.sql

```bash
docker exec -i permissions_db mysql -uroot -prootpassword < database/schema.sql
```

#### 验证导入

```bash
# 检查表
docker exec permissions_db mysql -uroot -prootpassword permissions_system -e "SHOW TABLES;"

# 检查数据
docker exec permissions_db mysql -uroot -prootpassword permissions_system -e "SELECT COUNT(*) FROM users;"
```

### 步骤7: 验证部署

#### 检查容器状态

```bash
docker-compose ps
```

**预期输出**:
```
NAME                 STATUS              PORTS
permissions_frontend   Up (healthy)         0.0.0.0:3000->80/tcp
permissions_backend    Up (healthy)         0.0.0.0:8001->8001/tcp
permissions_db        Up (healthy)         0.0.0.0:3310->3306/tcp
```

#### 检查健康状态

```bash
# 前端健康检查
curl http://localhost:3000/health

# 后端健康检查
curl http://localhost:8001/health

# 数据库连接测试
docker exec permissions_db mysql -uroot -prootpassword -e "SELECT 1;"
```

#### 访问系统

- **前端**: http://localhost:3000
- **后端API**: http://localhost:8001
- **默认账号**: admin@example.com / Admin123!

---

## 💾 数据库部署

### 方式1: 使用 Docker 容器

**优点**: 自动管理，易于部署

```bash
# 启动数据库容器
docker-compose up -d db

# 导入数据
docker exec -i permissions_db mysql -uroot -prootpassword < database/schema.sql
```

### 方式2: 使用外部 MySQL

**优点**: 更好的性能和可控性

#### 配置 docker-compose.yml

```yaml
# 修改 docker-compose.yml
services:
  backend:
    depends_on:
      - external_db
    environment:
      - DB_HOST=external_db
      - DB_PORT=3306

  external_db:
    image: mysql:8.0
    container_name: external_mysql
    environment:
      - MYSQL_ROOT_PASSWORD=rootpassword
      - MYSQL_DATABASE=permissions_system
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql

volumes:
  mysql_data:
```

#### 导入数据

```bash
docker exec -i external_mysql mysql -uroot -prootpassword < database/schema.sql
```

### 数据库备份和恢复

#### 备份数据库

```bash
# 备份到文件
docker exec permissions_db mysqldump -uroot -prootpassword permissions_system > backup.sql

# 自动备份（添加到 crontab）
0 2 * * * docker exec permissions_db mysqldump -uroot -prootpassword permissions_system > /backup/permissions-system-$(date +\%Y\%m\%d).sql
```

#### 恢复数据库

```bash
# 恢复数据库
docker exec -i permissions_db mysql -uroot -prootpassword permissions_system < backup.sql
```

---

## 🔐 配置说明

### 安全配置

#### 修改默认密码

```bash
# 登录系统后，立即修改管理员密码
# 或使用 SQL 修改
docker exec permissions_db mysql -uroot -prootpassword permissions_system -e "
UPDATE users SET password = '$2b$10$NEW_HASH_HERE' WHERE email = 'admin@example.com';
"
```

#### 配置 JWT 密钥

```bash
# 编辑 .env 文件
nano .env

# 修改 JWT_SECRET
JWT_SECRET=your-very-secure-random-secret-key-here
```

#### 配置 HTTPS

**使用 Nginx 反向代理**:

```nginx
# /etc/nginx/sites-available/permissions-system
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name your-domain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /api {
        proxy_pass http://localhost:8001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 性能配置

#### 配置数据库连接池

```bash
# 编辑 backend/.env
DB_POOL_SIZE=20
DB_CONNECTION_TIMEOUT=30000
```

#### 配置缓存

```bash
# 添加 Redis 支持（可选）
REDIS_HOST=localhost
REDIS_PORT=6379
```

---

## ✅ 验证部署

### 检查清单

- [ ] 所有容器运行正常
- [ ] 容器健康检查通过
- [ ] 前端可以访问
- [ ] 后端API可以访问
- [ ] 数据库连接正常
- [ ] 可以登录系统
- [ ] 用户管理功能正常
- [ ] 角色管理功能正常
- [ ] 权限管理功能正常
- [ ] 菜单管理功能正常

### 功能测试

#### 1. 登录测试

```bash
# 测试登录API
curl -X POST http://localhost:8001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"Admin123!"}'
```

#### 2. 用户管理测试

```bash
# 获取用户列表
curl http://localhost:8001/api/users \
  -H "Authorization: Bearer YOUR_TOKEN"

# 创建用户
curl -X POST http://localhost:8001/api/users \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","name":"Test User","role":"user"}'
```

#### 3. 数据库测试

```bash
# 查询用户表
docker exec permissions_db mysql -uroot -prootpassword permissions_system -e "SELECT * FROM users LIMIT 5;"

# 查询角色表
docker exec permissions_db mysql -uroot -prootpassword permissions_system -e "SELECT * FROM roles;"
```

---

## 🆘 常见问题

### 问题1: 容器无法启动

**现象**: `docker-compose up` 失败

**解决方案**:
```bash
# 检查端口占用
netstat -tuln | grep -E '3000|8001|3310'

# 修改端口配置
nano docker-compose.yml

# 重新启动
docker-compose up -d
```

### 问题2: 数据库连接失败

**现象**: 后端日志显示数据库连接错误

**解决方案**:
```bash
# 检查数据库容器
docker-compose ps db

# 检查数据库日志
docker-compose logs db

# 测试数据库连接
docker exec permissions_db mysql -uroot -prootpassword -e "SELECT 1;"

# 检查环境变量
docker-compose exec backend env | grep DB_
```

### 问题3: 前端无法访问后端

**现象**: 前端页面显示 404 或 CORS 错误

**解决方案**:
```bash
# 检查后端容器
docker-compose ps backend

# 检查后端日志
docker-compose logs backend

# 检查 API 地址配置
cat frontend/.env.production

# 检查后端健康状态
curl http://localhost:8001/health
```

### 问题4: 登录失败

**现象**: 登录时显示"用户名或密码错误"

**解决方案**:
```bash
# 检查用户表
docker exec permissions_db mysql -uroot -prootpassword permissions_system -e "SELECT email, name FROM users;"

# 重置管理员密码
# 生成新密码哈希
node -e "const bcrypt = require('bcrypt'); bcrypt.hash('Admin123!', 10).then(h => console.log(h));"

# 更新密码
docker exec permissions_db mysql -uroot -prootpassword permissions_system -e "
UPDATE users SET password = '$2b$10$NEW_HASH_HERE' WHERE email = 'admin@example.com';
"
```

### 问题5: 容器健康检查失败

**现象**: 容器状态显示 `unhealthy`

**解决方案**:
```bash
# 检查健康检查配置
docker inspect permissions_backend | grep -A 10 Healthcheck

# 手动测试健康检查
curl http://localhost:8001/health

# 查看容器日志
docker-compose logs -f backend

# 重启容器
docker-compose restart backend
```

---

## 📊 监控和日志

### 查看日志

```bash
# 查看所有日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db

# 查看最近100行日志
docker-compose logs --tail=100 backend
```

### 监控容器状态

```bash
# 实时监控容器状态
watch -n 1 'docker-compose ps'

# 查看容器资源使用
docker stats
```

### 配置日志收集

```bash
# 添加日志收集服务（可选）
# 修改 docker-compose.yml
services:
  backend:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

---

## 🔄 升级和维护

### 升级系统

```bash
# 拉取最新代码
git pull origin main

# 停止服务
docker-compose down

# 重新构建镜像
docker-compose build --no-cache

# 启动服务
docker-compose up -d

# 验证升级
docker-compose ps
curl http://localhost:3000/health
```

### 定期维护

```bash
# 清理未使用的镜像
docker image prune -a

# 清理未使用的卷
docker volume prune

# 备份数据库
docker exec permissions_db mysqldump -uroot -prootpassword permissions_system > backup-$(date +%Y%m%d).sql

# 优化数据库
docker exec permissions_db mysql -uroot -prootpassword permissions_system -e "OPTIMIZE TABLE users, roles, permissions, menus;"
```

---

## 📞 技术支持

- **GitHub**: https://github.com/AQzzzQA/permissions-system
- **Issues**: https://github.com/AQzzzQA/permissions-system/issues
- **Email**: support@example.com

---

**最后更新**: 2026-03-17
**维护人员**: Echo-2 (Agentic AI)
**版本**: v1.0.0
