# 技术支持文档

**出品方**: 乐盟互动 (Lemeng Interactive)  
**版本**: 1.2.0  
**状态**: 生产就绪 ✅

---

## 📋 支持概述

本文档为 OpenClaw 权限控制系统提供完整的技术支持信息和故障排除指南。

---

## 🚀 快速开始

### 系统要求
- **硬件**: 2GB+ RAM, 20GB+ 磁盘空间
- **操作系统**: Linux (推荐 Ubuntu 20.04+)
- **Docker**: 20.10+
- **Node.js**: 18+ (开发环境)
- **MySQL**: 8.0+

### 一键部署
```bash
cd /root/.openclaw/workspace/permissions-system
chmod +x deploy.sh
./deploy.sh
```

---

## 📊 系统状态检查

### 健康检查
```bash
# 检查容器状态
docker-compose ps

# 检查前端服务
curl -s -o /dev/null -w "前端: %{http_code}\n" http://43.156.131.98:8998/admin/

# 检查后端API
curl -s -o /dev/null -w "后端: %{http_code}\n" http://43.156.131.98:8998/api/health

# 检查技能管理
curl -s -o /dev/null -w "技能: %{http_code}\n" http://43.156.131.98:8998/admin/skills
```

### 日志查看
```bash
# 查看所有服务日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mysql

# 查看实时日志
docker logs -f openclaw-permissions-backend
```

---

## 🔧 常见问题解决

### 1. 系统无法启动

**问题**: 容器启动失败
```bash
# 检查容器状态
docker ps -a | grep permission

# 重启系统
docker-compose down
docker-compose up -d

# 检查错误
docker-compose logs backend
```

**解决方案**:
- 确保端口未被占用: `netstat -tlnp | grep 8998`
- 检查 Docker 服务状态: `docker info`
- 清理 Docker 缓存: `docker system prune`

### 2. 前端页面无法访问

**问题**: HTTP 404 或 500 错误
```bash
# 检查前端服务
curl -I http://43.156.131.98:8998/admin/

# 检查前端容器
docker logs openclaw-permissions-frontend

# 重启前端
docker-compose restart frontend
```

**解决方案**:
- 重新构建前端: `docker-compose build frontend`
- 检查 Nginx 配置
- 验证环境变量设置

### 3. 后端 API 错误

**问题**: API 返回 500 或 404 错误
```bash
# 检查后端健康
curl http://localhost:3001/api/health

# 检查后端日志
docker logs openclaw-permissions-backend --since 10m

# 重启后端
docker-compose restart backend
```

**解决方案**:
- 检查数据库连接
- 验证环境变量 `.env`
- 重新构建后端: `docker-compose build backend`

### 4. 数据库连接问题

**问题**: MySQL 连接失败
```bash
# 检查 MySQL 容器
docker logs openclaw-permissions-mysql

# 测试 MySQL 连接
docker exec -it openclaw-permissions-mysql mysql -u root -p

# 检查数据库状态
docker exec openclaw-permissions-mysql mysql -u root -p -e "SHOW DATABASES;"
```

**解决方案**:
- 重新启动 MySQL 容器
- 检查 `.env` 文件中的数据库配置
- 验证 MySQL 数据卷状态

---

## 🛠️ 维护操作

### 数据库备份
```bash
# 创建数据库备份
docker exec openclaw-permissions-mysql mysqldump -u root -p permissions > backup.sql

# 自动化备份脚本
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
docker exec openclaw-permissions-mysql mysqldump -u root -p permissions > "backup_$DATE.sql"
echo "Backup created: backup_$DATE.sql"
```

### 系统更新
```bash
# 拉取最新代码
git pull origin main

# 重新构建并部署
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# 验证更新
curl -s http://43.156.131.98:8998/admin/
```

### 性能优化
```bash
# 清理 Docker 镜像
docker system prune -a

# 清理日志
docker logs --tail 100 openclaw-permissions-backend > new-logs.txt

# 监控系统资源
docker stats
```

---

## 🚨 故障排除

### 网络问题
```bash
# 检查端口映射
docker port openclaw-permissions-frontend
docker port openclaw-permissions-backend

# 测试网络连通性
telnet localhost 8998
telnet localhost 3001
telnet localhost 3000
```

### 权限问题
```bash
# 检查文件权限
ls -la deploy.sh
chmod +x deploy.sh

# 检查 Docker 权限
docker ps
```

### 环境变量问题
```bash
# 检查环境变量
docker-compose config

# 查看容器环境变量
docker inspect openclaw-permissions-backend | grep -A 10 "Env"
```

---

## 📞 联系支持

### 技术支持
- **出品方**: 乐盟互动 (Lemeng Interactive)
- **邮箱**: lemeng-interactive@example.com
- **电话**: +86 123-4567-8900
- **工作日**: 09:00 - 18:00 (GMT+8)

### 技术文档
- [用户手册](./README.md)
- [API 文档](./docs/api.md)
- [部署指南](./DEPLOYMENT.md)
- [设计文档](./DESIGN.md)

### 问题反馈
请提供以下信息以便快速解决问题:
1. 系统版本号 (当前: 1.2.0)
2. 错误信息和时间戳
3. 操作步骤重现
4. 系统日志 (docker-compose logs)
5. 浏览器控制台日志 (F12)

---

## 📝 更新日志

### v1.2.0 (2026-03-12)
- 添加完整的技能管理系统
- 完善前端管理界面
- 优化容器部署配置
- 增强错误处理和日志记录

### v1.1.0 (2026-03-11)
- 初始版本发布
- 基础权限系统
- Docker 容器化部署
- QQ 命令绑定功能

---

**最后更新**: 2026-03-12  
**维护方**: 乐盟互动 (Lemeng Interactive)  
**文档版本**: 1.2.0