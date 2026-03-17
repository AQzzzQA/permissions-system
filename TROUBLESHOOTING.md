# 故障排查指南

**乐盟出品，必属精品！** 🚀

**适用人群**: 所有用户
**版本**: v1.0.0

---

## 📋 目录

- [快速诊断](#快速诊断)
- [部署问题](#部署问题)
- [数据库问题](#数据库问题)
- [登录问题](#登录问题)
- [性能问题](#性能问题)
- [网络问题](#网络问题)
- [获取帮助](#获取帮助)

---

## 🔍 快速诊断

### 第1步：检查服务状态

```bash
cd permissions-system
docker-compose ps
```

**预期输出**：
```
NAME                 STATUS              PORTS
permissions_frontend   Up (healthy)         0.0.0.0:3000->80/tcp
permissions_backend    Up (healthy)         0.0.0.0:8001->8001/tcp
permissions_db        Up (healthy)         0.0.0.0:3310->3306/tcp
```

**状态说明**：
- `Up (healthy)` ✅ - 正常运行
- `Up` ⏳ - 正在启动（等待 1-2 分钟）
- `Restarting` ❌ - 不断重启（查看日志排查）
- `Exited` ❌ - 已停止（查看日志排查）

### 第2步：检查日志

```bash
# 查看所有日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs -f frontend
docker-compose logs -f backend
docker-compose logs -f db
```

### 第3步：测试网络连接

```bash
# 测试前端
curl http://localhost:3000

# 测试后端
curl http://localhost:8001/health

# 测试数据库
docker exec permissions_db mysql -uroot -prootpassword -e "SELECT 1;"
```

---

## 🚀 部署问题

### 问题1: Docker 未安装或版本过低

**症状**：
```
bash: docker: command not found
```

**解决方案**：

**Windows/Mac**:
1. 下载 Docker Desktop: https://www.docker.com/products/docker-desktop
2. 双击安装，一路"下一步"
3. 安装完成后重启电脑

**Linux (Ubuntu/Debian)**:
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
```

**验证安装**：
```bash
docker --version
docker-compose --version
```

---

### 问题2: 端口被占用

**症状**：
```
Error: Port 3000 is already in use
```

**解决方案**：

**方案1：关闭占用端口的程序**

**Windows**:
```bash
# 查找占用端口的进程
netstat -ano | findstr :3000

# 结束进程（<进程ID> 替换为实际ID）
taskkill /PID <进程ID> /F
```

**Mac/Linux**:
```bash
# 查找占用端口的进程
lsof -i :3000

# 结束进程（<进程ID> 替换为实际ID）
kill -9 <进程ID>
```

**方案2：修改端口**

编辑 `docker-compose.yml`：
```yaml
services:
  frontend:
    ports:
      - "3001:80"  # 修改为 3001

  backend:
    ports:
      - "8002:8001"  # 修改为 8002

  db:
    ports:
      - "3311:3306"  # 修改为 3311
```

重启服务：
```bash
docker-compose down
docker-compose up -d
```

---

### 问题3: 镜像下载失败

**症状**：
```
Error response from daemon: Get https://registry-1.docker.io/v2/: ...
```

**解决方案**：

**方案1：使用国内镜像源**

编辑 Docker 配置文件：

**Linux/Mac**: `~/.docker/daemon.json`
**Windows**: `C:\Users\<用户名>\.docker\daemon.json`

```json
{
  "registry-mirrors": [
    "https://docker.mirrors.ustc.edu.cn",
    "https://hub-mirror.c.163.com"
  ]
}
```

重启 Docker：
```bash
# Linux
sudo systemctl restart docker

# Windows/Mac
重启 Docker Desktop
```

**方案2：重试下载**
```bash
docker-compose pull
```

---

### 问题4: 容器启动失败

**症状**：
```
Container exited with code 1
```

**解决方案**：

1. 查看日志：
```bash
docker-compose logs <服务名>
```

2. 检查配置文件：
```bash
# 检查环境变量文件
cat backend/.env
cat frontend/.env

# 检查 docker-compose.yml
cat docker-compose.yml
```

3. 重新构建：
```bash
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

---

## 💾 数据库问题

### 问题1: 数据库连接失败

**症状**：
```
Error: connect ECONNREFUSED
```

**解决方案**：

1. 检查数据库容器状态：
```bash
docker-compose ps db
```

2. 检查数据库日志：
```bash
docker-compose logs db
```

3. 测试数据库连接：
```bash
docker exec permissions_db mysql -uroot -prootpassword -e "SELECT 1;"
```

4. 检查环境变量：
```bash
docker-compose exec backend env | grep DB_
```

5. 重启数据库：
```bash
docker-compose restart db
```

---

### 问题2: 数据库导入失败

**症状**：
```
ERROR 1045 (28000): Access denied for user 'root'
```

**解决方案**：

1. 检查数据库密码：
```bash
docker-compose ps db
```

2. 确认密码（默认是 `rootpassword`）：
```bash
docker exec -i permissions_db mysql -uroot -prootpassword < database/schema.sql
```

3. 如果密码错误，修改 `docker-compose.yml`：
```yaml
services:
  db:
    environment:
      - MYSQL_ROOT_PASSWORD=your-password
```

---

### 问题3: 数据库表不存在

**症状**：
```
Table 'permissions_system.users' doesn't exist
```

**解决方案**：

1. 检查数据库是否存在：
```bash
docker exec permissions_db mysql -uroot -prootpassword -e "SHOW DATABASES;"
```

2. 导入数据库结构：
```bash
docker exec -i permissions_db mysql -uroot -prootpassword < database/schema.sql
```

3. 验证表是否创建：
```bash
docker exec permissions_db mysql -uroot -prootpassword permissions_system -e "SHOW TABLES;"
```

---

### 问题4: 数据库字符集问题

**症状**：中文显示乱码

**解决方案**：

1. 检查字符集：
```bash
docker exec permissions_db mysql -uroot -prootpassword -e "
SELECT
    TABLE_SCHEMA,
    TABLE_NAME,
    TABLE_COLLATION
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = 'permissions_system';
"
```

2. 预期输出：`utf8mb4_unicode_ci`

3. 如果不是，修改字符集：
```bash
docker exec permissions_db mysql -uroot -prootpassword permissions_system -e "
ALTER DATABASE permissions_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE users CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE roles CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE permissions CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE menus CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
"
```

---

## 🔐 登录问题

### 问题1: 登录失败 - 用户名或密码错误

**症状**：输入正确的账号密码，但提示"用户名或密码错误"

**解决方案**：

1. 检查用户是否存在：
```bash
docker exec permissions_db mysql -uroot -prootpassword permissions_system -e "SELECT email, name FROM users;"
```

2. 如果用户不存在，重新导入数据库：
```bash
docker exec -i permissions_db mysql -uroot -prootpassword < database/schema.sql
```

3. 重置密码：
```bash
# 生成新密码哈希
node -e "const bcrypt = require('bcrypt'); bcrypt.hash('Admin123!', 10).then(h => console.log(h));"

# 更新密码（替换 NEW_HASH_HERE）
docker exec permissions_db mysql -uroot -prootpassword permissions_system -e "
UPDATE users SET password = '$2b$10$NEW_HASH_HERE' WHERE email = 'admin@example.com';
"
```

---

### 问题2: Token 过期

**症状**：操作时突然提示"Token 过期"或跳转到登录页

**解决方案**：

1. 重新登录
2. 检查 JWT 过期时间（默认 24 小时）
3. 如果需要修改，编辑 `backend/.env`：
```bash
JWT_EXPIRE=72h  # 改为 72 小时
```

---

### 问题3: 权限不足

**症状**：访问某个功能时提示"权限不足"

**解决方案**：

1. 检查用户角色：
```bash
docker exec permissions_db mysql -uroot -prootpassword permissions_system -e "SELECT email, role FROM users WHERE email = 'admin@example.com';"
```

2. 检查角色权限：
```bash
docker exec permissions_db mysql -uroot -prootpassword permissions_system -e "
SELECT
    r.name AS role,
    p.name AS permission
FROM roles r
JOIN role_permissions rp ON r.id = rp.role_id
JOIN permissions p ON rp.permission_id = p.id
WHERE r.name = 'admin';
"
```

3. 如果权限不足，在系统中为角色添加权限

---

## 🚄 性能问题

### 问题1: 页面加载慢

**症状**：页面加载时间超过 5 秒

**解决方案**：

1. 检查网络连接：
```bash
ping localhost
```

2. 检查容器资源占用：
```bash
docker stats
```

3. 优化数据库查询：
```bash
# 添加索引
docker exec permissions_db mysql -uroot -prootpassword permissions_system -e "
ALTER TABLE users ADD INDEX idx_email (email);
ALTER TABLE roles ADD INDEX idx_name (name);
"
```

4. 清理浏览器缓存

---

### 问题2: 数据库查询慢

**症状**：数据库操作响应时间超过 2 秒

**解决方案**：

1. 检查慢查询：
```bash
docker exec permissions_db mysql -uroot -prootpassword permissions_system -e "
SHOW VARIABLES LIKE 'slow_query_log';
"
```

2. 启用慢查询日志：
```bash
docker exec permissions_db mysql -uroot -prootpassword permissions_system -e "
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 1;
"
```

3. 优化数据库：
```bash
docker exec permissions_db mysql -uroot -prootpassword permissions_system -e "
OPTIMIZE TABLE users, roles, permissions, menus;
"
```

---

## 🌐 网络问题

### 问题1: 无法访问外网

**症状**：无法拉取 Docker 镜像

**解决方案**：

1. 检查网络连接：
```bash
ping google.com
```

2. 检查 DNS：
```bash
nslookup docker.io
```

3. 配置 DNS：
```bash
# Linux
echo "nameserver 8.8.8.8" | sudo tee -a /etc/resolv.conf

# Windows
网络设置 → 更改适配器选项 → 网络连接属性 → Internet 协议版本 4
```

---

### 问题2: 防火墙阻止连接

**症状**：无法访问服务

**解决方案**：

**Linux (UFW)**:
```bash
# 开放端口
sudo ufw allow 3000
sudo ufw allow 8001
sudo ufw allow 3310

# 查看规则
sudo ufw status
```

**Linux (firewalld)**:
```bash
# 开放端口
sudo firewall-cmd --add-port=3000/tcp --permanent
sudo firewall-cmd --add-port=8001/tcp --permanent
sudo firewall-cmd --add-port=3310/tcp --permanent

# 重载规则
sudo firewall-cmd --reload
```

**Windows**:
1. 控制面板 → Windows Defender 防火墙
2. 高级设置 → 入站规则
3. 新建规则 → 端口 → TCP → 特定本地端口
4. 输入 3000, 8001, 3310
5. 允许连接

---

## 🆘 获取帮助

### 1. 查看文档

- **新手指南**: [GETTING-STARTED.md](./GETTING-STARTED.md)
- **部署文档**: [DEPLOYMENT.md](./DEPLOYMENT.md)
- **数据库导入**: [DATABASE-IMPORT.md](./DATABASE-IMPORT.md)
- **API 文档**: [API.md](./API.md)

### 2. 查看日志

```bash
# 查看所有日志
docker-compose logs -f

# 查看最近 100 行日志
docker-compose logs --tail=100
```

### 3. 重启服务

```bash
# 重启所有服务
docker-compose restart

# 重启特定服务
docker-compose restart frontend
docker-compose restart backend
docker-compose restart db
```

### 4. 重新部署

```bash
# 停止服务
docker-compose down

# 删除镜像
docker-compose down --rmi all

# 重新构建
docker-compose build --no-cache

# 启动服务
docker-compose up -d
```

### 5. 提交 Issue

如果以上方法都无法解决问题，请提交 Issue：
https://github.com/AQzzzQA/permissions-system/issues

**提交 Issue 时，请提供**：
1. ✅ 错误信息（截图或日志）
2. ✅ 操作系统（Windows/Mac/Linux）
3. ✅ Docker 和 Docker Compose 版本
4. ✅ 复现步骤
5. ✅ 已尝试的解决方案

### 6. 联系支持

- **Email**: support@example.com
- **GitHub**: https://github.com/AQzzzQA/permissions-system
- **Issues**: https://github.com/AQzzzQA/permissions-system/issues

---

## 📞 技术支持

**乐盟技术团队**提供以下支持：

- 📧 Email: support@example.com
- 🌐 GitHub: https://github.com/AQzzzQA/permissions-system
- 📝 Issues: https://github.com/AQzzzQA/permissions-system/issues

**工作时间**：周一至周五 9:00 - 18:00（GMT+8）

**响应时间**：
- 紧急问题：2 小时内
- 一般问题：24 小时内
- 功能建议：3-5 个工作日

---

**乐盟出品，必属精品！** 🚀

**版本**: v1.0.0
**最后更新**: 2026-03-17
**维护人员**: 乐盟技术团队
