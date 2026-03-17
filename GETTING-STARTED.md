# 入门指南 - 新手专用

**乐盟出品，必属精品！** 🚀

**适用人群**: 初学者、小白用户
**预计阅读时间**: 10 分钟
**版本**: v1.0.0

---

## 📋 目录

- [什么是权限管理系统？](#什么是权限管理系统)
- [系统需要什么环境？](#系统需要什么环境)
- [5分钟快速部署](#5分钟快速部署)
- [如何登录系统？](#如何登录系统)
- [系统有哪些功能？](#系统有哪些功能)
- [如何创建用户？](#如何创建用户)
- [如何分配权限？](#如何分配权限)
- [常见问题](#常见问题)
- [遇到问题怎么办？](#遇到问题怎么办)

---

## 🤔 什么是权限管理系统？

**简单来说**：一个用来管理系统用户、角色、权限的工具。

**举个例子**：
- 🏢 你有公司，有 100 个员工
- 👥 不同员工有不同的职责（人事、销售、财务）
- 🔐 你希望人事只能管理员工信息，不能看财务数据
- 📋 权限管理系统就是帮你做这件事的！

**本系统可以**：
- ✅ 管理用户（添加、删除、修改用户）
- ✅ 创建角色（管理员、普通用户、访客等）
- ✅ 分配权限（谁能看什么，能做什么）
- ✅ 管理菜单（显示哪些功能按钮）

---

## 💻 系统需要什么环境？

### 最简单的方式：Docker（推荐）

**什么是 Docker？**
Docker 就像一个虚拟电脑，你不需要安装很多软件，直接用 Docker 就可以运行整个系统。

**需要安装**：
- Docker（一个软件）
- Docker Compose（Docker 的配套工具）

**如何安装？**

**Windows/Mac**:
1. 下载 Docker Desktop: https://www.docker.com/products/docker-desktop
2. 双击安装，一路"下一步"
3. 安装完成后重启电脑

**Linux (Ubuntu/Debian)**:
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
```

### 验证安装

打开终端（命令行），输入：
```bash
docker --version
docker-compose --version
```

如果能看到版本号，说明安装成功！✅

---

## 🚀 5分钟快速部署

### 第1步：克隆项目（1分钟）

打开终端，输入：

```bash
git clone https://github.com/AQzzzQA/permissions-system.git
cd permissions-system
```

**解释**：
- `git clone`: 从 GitHub 下载项目
- `cd permissions-system`: 进入项目目录

### 第2步：启动服务（2分钟）

```bash
docker-compose up -d
```

**解释**：
- `docker-compose up`: 启动所有服务
- `-d`: 后台运行（不占用终端）

**等待时间**：首次启动需要下载镜像，大约 2-5 分钟（取决于网速）

**查看状态**：
```bash
docker-compose ps
```

**预期输出**：
```
NAME                 STATUS              PORTS
permissions_frontend   Up (healthy)         0.0.0.0:3000->80/tcp
permissions_backend    Up (healthy)         0.0.0.0:8001->8001/tcp
permissions_db        Up (healthy)         0.0.0.0:3310->3306/tcp
```

**说明**：
- `Up (healthy)`: 正常运行 ✅
- 如果看到 `Up` 或 `Restarting`，说明正在启动，稍等片刻

### 第3步：导入数据库（1分钟）

```bash
docker exec -i permissions_db mysql -uroot -prootpassword < database/schema.sql
```

**解释**：
- 把数据库结构导入到系统里

**验证导入**：
```bash
docker exec permissions_db mysql -uroot -prootpassword permissions_system -e "SHOW TABLES;"
```

**预期输出**：
```
+---------------------+
| Tables_in_...       |
+---------------------+
| menus               |
| permissions         |
| role_menus          |
| role_permissions    |
| roles              |
| users              |
+---------------------+
```

### 第4步：访问系统（1分钟）

打开浏览器，访问：
- **本地访问**: http://localhost:3000
- **服务器访问**: http://your-server-ip:3000

**默认账号**：
- 邮箱: `admin@example.com`
- 密码: `Admin123!`

⚠️ **重要**: 首次登录后请立即修改密码！

---

## 🔐 如何登录系统？

### 登录步骤

1. 打开浏览器，访问系统地址（如 http://localhost:3000）
2. 看到"登录"页面
3. 输入邮箱和密码：
   - 邮箱: `admin@example.com`
   - 密码: `Admin123!`
4. 点击"登录"按钮
5. 成功登录后，会看到"首页"或"仪表盘"

### 修改密码

⚠️ **强烈建议首次登录后修改密码！**

1. 登录后，点击右上角"用户头像"
2. 选择"系统设置" → "账号设置"
3. 输入新密码
4. 点击"保存"

---

## 📊 系统有哪些功能？

### 1. 用户管理 👥

**功能**：
- 添加新用户
- 查看、编辑、删除用户
- 修改用户密码
- 禁用/启用用户
- 查看用户操作日志

**使用场景**：
- 公司新来了员工，需要添加账号
- 员工离职，需要删除账号
- 员工忘记密码，需要重置密码

**位置**：左侧菜单 → "用户管理"

---

### 2. 角色管理 🎭

**功能**：
- 创建新角色（如：人事、财务、销售）
- 编辑、删除角色
- 为角色分配权限
- 为角色分配菜单

**使用场景**：
- 公司新设"客服"岗位，需要创建对应角色
- 客服的权限需要调整

**位置**：左侧菜单 → "角色管理"

---

### 3. 权限管理 🔐

**功能**：
- 创建新权限（如：客户列表导出）
- 编辑、删除权限
- 查看权限列表

**使用场景**：
- 新增功能需要对应权限
- 权限需要细化调整

**位置**：左侧菜单 → "权限管理"

---

### 4. 菜单管理 📋

**功能**：
- 创建新菜单
- 编辑、删除菜单
- 设置菜单层级（父菜单、子菜单）
- 设置菜单图标、路由

**使用场景**：
- 新增功能页面，需要在菜单中显示
- 调整菜单顺序

**位置**：左侧菜单 → "菜单管理"

---

## 👥 如何创建用户？

### 步骤1：进入用户管理

1. 点击左侧菜单"用户管理"
2. 看到"用户列表"页面

### 步骤2：点击"添加用户"

1. 点击右上角"添加用户"按钮
2. 弹出"添加用户"对话框

### 步骤3：填写用户信息

**必填项**：
- **邮箱**: 用户的登录邮箱（如：zhangsan@example.com）
- **姓名**: 用户真实姓名（如：张三）
- **密码**: 用户初始密码（如：123456）
- **角色**: 选择用户角色（如：user 普通用户）

**选填项**：
- 状态：active（启用）/ inactive（禁用）

### 步骤4：保存

点击"确定"或"保存"按钮

### 步骤5：通知用户

告知用户：
- 登录地址（如：http://your-server-ip:3000）
- 登录邮箱
- 登录密码
- ⚠️ 提示用户首次登录后修改密码

---

## 🔐 如何分配权限？

### 方式1：通过角色分配（推荐）

**适用场景**：批量分配权限（如：所有财务人员的权限）

#### 步骤1：创建角色

1. 进入"角色管理"
2. 点击"添加角色"
3. 填写角色信息：
   - 角色名称：如"财务"
   - 角色描述：如"财务部门角色"
4. 点击"保存"

#### 步骤2：分配权限

1. 找到刚创建的角色
2. 点击"权限"按钮
3. 勾选需要的权限：
   - ✅ 用户管理（如果需要）
   - ✅ 财务报表（如果需要）
   - ✅ 数据导出（如果需要）
4. 点击"保存"

#### 步骤3：分配菜单

1. 点击角色列表中的"菜单"按钮
2. 勾选需要显示的菜单：
   - ✅ 首页
   - ✅ 财务报表
   - ✅ 系统设置
3. 点击"保存"

#### 步骤4：分配给用户

1. 进入"用户管理"
2. 编辑用户
3. 修改角色为"财务"
4. 保存

### 方式2：单独分配权限

**适用场景**：特殊权限（如：某个临时用户需要特殊权限）

1. 进入"用户管理"
2. 编辑用户
3. 如果系统支持单独分配权限，可以直接勾选
4. 保存

---

## ❓ 常见问题

### Q1: 部署失败，端口被占用怎么办？

**症状**：
```
Error: Port 3000 is already in use
```

**解决方案**：

**方案1：关闭占用端口的程序**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <进程ID> /F

# Mac/Linux
lsof -i :3000
kill -9 <进程ID>
```

**方案2：修改端口**

编辑 `docker-compose.yml`，修改端口映射：
```yaml
ports:
  - "3001:80"  # 改为 3001
```

重启服务：
```bash
docker-compose down
docker-compose up -d
```

---

### Q2: 数据库导入失败怎么办？

**症状**：
```
ERROR 1045 (28000): Access denied for user 'root'
```

**解决方案**：

1. 检查数据库密码：
```bash
docker-compose ps db
```

2. 确认密码（默认是 `rootpassword`）
```bash
docker exec -i permissions_db mysql -uroot -prootpassword < database/schema.sql
```

---

### Q3: 登录失败怎么办？

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

---

### Q4: 页面显示 404 或空白怎么办？

**症状**：访问系统时显示 404 或空白页面

**解决方案**：

1. 检查服务是否启动：
```bash
docker-compose ps
```

2. 检查日志：
```bash
docker-compose logs frontend
docker-compose logs backend
```

3. 重启服务：
```bash
docker-compose restart
```

---

### Q5: 如何备份数据？

**解决方案**：

```bash
# 备份数据库
docker exec permissions_db mysqldump -uroot -prootpassword permissions_system > backup.sql

# 恢复数据库
docker exec -i permissions_db mysql -uroot -prootpassword permissions_system < backup.sql
```

---

## 🆘 遇到问题怎么办？

### 第1步：查看文档

- **新手指南**: [GETTING-STARTED.md](./GETTING-STARTED.md)（本文档）
- **部署文档**: [DEPLOYMENT.md](./DEPLOYMENT.md)
- **故障排查**: [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
- **数据库导入**: [DATABASE-IMPORT.md](./DATABASE-IMPORT.md)

### 第2步：查看日志

```bash
# 查看所有日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs -f frontend
docker-compose logs -f backend
docker-compose logs -f db
```

### 第3步：重启服务

```bash
# 重启所有服务
docker-compose restart

# 重启特定服务
docker-compose restart frontend
```

### 第4步：提交 Issue

如果以上方法都无法解决问题，请提交 Issue：
https://github.com/AQzzzQA/permissions-system/issues

**提交 Issue 时，请提供**：
1. 错误信息（截图或日志）
2. 操作系统（Windows/Mac/Linux）
3. Docker 和 Docker Compose 版本
4. 复现步骤

---

## 📚 进阶学习

### 想了解更多？

- **完整部署文档**: [DEPLOYMENT.md](./DEPLOYMENT.md)
- **功能文档**: [FEATURES.md](./FEATURES.md)
- **API 文档**: [API.md](./API.md)
- **数据库文档**: [DATABASE.md](./DATABASE.md)

### 想参与开发？

- **贡献指南**: 查看 [README.md](./README.md) 的"贡献"部分
- **代码规范**: 提交 PR 前请阅读代码规范

---

## 🎉 恭喜！

如果你已经成功部署并登录系统，恭喜你！你已经掌握了基本的使用方法。

**下一步建议**：
1. 创建几个测试用户，熟悉用户管理
2. 创建不同角色，测试权限分配
3. 根据实际需求，调整权限和菜单

---

**乐盟出品，必属精品！** 🚀

**版本**: v1.0.0
**最后更新**: 2026-03-17
**维护人员**: 乐盟技术团队
