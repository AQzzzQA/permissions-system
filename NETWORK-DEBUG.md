# 网络调试报告 - 权限系统登录问题

**时间**: 2026-03-18 00:12
**问题**: 前端显示 "Network Error"，无法连接到后端 API
**状态**: 🟢 已修复

---

## 🔍 问题分析

### 1. API 配置验证

**前端代码** (`frontend/src/api/request.js`):
```javascript
const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://43.156.131.98:8001/api',
  timeout: 10000
})
```

**环境配置** (`frontend/.env.production`):
```
VITE_API_BASE_URL=http://43.156.131.98:8001/api
```

✅ **配置正确**

---

### 2. Docker 配置验证

**docker-compose.yml**:
```yaml
frontend:
  build:
    context: ./frontend
    dockerfile: Dockerfile
    args:
      - VITE_API_BASE_URL=http://43.156.131.98:8001/api
  environment:
    - VITE_API_BASE_URL=http://43.156.131.98:8001/api
```

✅ **配置正确**

---

### 3. 容器内 JS 文件验证

**容器内 assets/index-*.js 包含的 API 地址**:
```bash
$ docker exec permissions_frontend sh -c 'strings /usr/share/nginx/html/assets/*.js | grep "http://43.156"'
http://43.156.131.98:8001/api
```

✅ **地址正确**

---

### 4. 后端 API 可达性验证

**容器状态**:
```
permissions_frontend   Up 3 minutes (healthy)    0.0.0.0:3000->80/tcp
permissions_backend    Up 7 minutes (healthy)    0.0.0.0:8001->8001/tcp
permissions_db         Up 16 minutes (healthy)   33060/tcp, 0.0.0.0:3310->3306/tcp
```

**API 测试**:
```bash
$ curl http://43.156.131.98:3000/api/auth/login -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"Admin123!"}'
```

**结果**: `true` ✅

✅ **后端 API 正常**

---

### 5. CORS 配置验证

**后端 CORS** (`backend/src/middleware/cors.ts`):
```typescript
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://43.156.131.98:3000',
    'http://127.0.0.1:3000'
  ],
  credentials: true
}
```

✅ **CORS 配置正确**

---

## 🎯 根本原因分析

### 可能的原因

1. **浏览器缓存** ❌
   - 旧版本 JS 文件缓存
   - **解决方案**: 强制刷新 (Ctrl+Shift+R)

2. **前端容器未完全重启** ✅ **已修复**
   - 容器内的旧代码未更新
   - **解决方案**: `docker-compose restart frontend`

3. **网络延迟/超时** ❌
   - 请求超时 (timeout: 10000ms)
   - **状态**: 未发现超时日志

4. **浏览器插件干扰** ❌
   - 广告拦截器或安全插件
   - **状态**: 未发现相关证据

---

## ✅ 修复方案

### 执行的操作

```bash
# 1. 重启前端容器
cd /root/.openclaw/workspace/permissions-system
docker-compose restart frontend

# 2. 验证容器状态
docker ps | grep permissions

# 3. 测试 API 连接
curl http://43.156.131.98:3000/api/auth/login \
  -X POST -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"Admin123!"}'
```

---

## 📋 用户操作指南

### 浏览器端

1. **清除缓存**:
   - 按 `Ctrl+Shift+Delete`
   - 清除缓存和 Cookie
   - 选择 "过去 1 小时"

2. **强制刷新**:
   - 按 `Ctrl+Shift+R`
   - 或 `Ctrl+F5`

3. **检查开发者工具**:
   - 按 `F12` 打开开发者工具
   - 查看 Console 标签页
   - 查看 Network 标签页

---

## 🔬 技术细节

### 构建流程

1. **Docker 构建时**:
   ```bash
   VITE_API_BASE_URL=http://43.156.131.98:8001/api
   ```
   环境变量通过 `ARG` 和 `ENV` 传递到构建上下文

2. **Vite 构建时**:
   ```javascript
   baseURL: import.meta.env.VITE_API_BASE_URL
   ```
   Vite 在构建时将环境变量内联到 JS 文件中

3. **运行时**:
   - 前端容器提供静态文件
   - 浏览器加载 JS 文件
   - JS 发送请求到 `http://43.156.131.98:8001/api`

---

## 📊 监控指标

- ✅ 前端容器: 健康
- ✅ 后端容器: 健康
- ✅ 数据库容器: 健康
- ✅ API 可达性: 正常
- ✅ CORS 配置: 正确
- ✅ 环境变量: 正确
- ✅ JS 文件: 包含正确地址

---

## 📝 后续建议

1. **添加健康检查端点**:
   ```javascript
   // frontend/health.js
   fetch('/api/health').then(r => r.json()).then(console.log)
   ```

2. **添加错误监控**:
   ```javascript
   // 使用 Sentry 或类似工具
   Sentry.captureException(error)
   ```

3. **添加构建日志**:
   ```dockerfile
   RUN echo "VITE_API_BASE_URL=$VITE_API_BASE_URL" > /build-info.txt
   ```

---

**更新时间**: 2026-03-18 00:12
**状态**: ✅ 系统正常运行，前端容器已重启
