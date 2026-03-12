# OpenClaw 权限系统集成方案

## 📋 集成目标

将权限控制与独立工作空间系统无缝集成到 OpenClaw Gateway 的 UI 中，提供统一的用户体验。

---

## 🏗️ 集成架构

### 方案 1: Nginx 反向代理集成（推荐）

```
┌─────────────────────────────────────────────────────────┐
│                     用户浏览器                          │
│              http://43.156.131.98:8998/              │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ HTTP/HTTPS
                     ▼
┌─────────────────────────────────────────────────────────┐
│                   Nginx 反向代理                        │
└────────────────────┬────────────────────────────────────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
        ▼            ▼            ▼
┌──────────────┐ ┌──────────┐ ┌──────────────┐
│ OpenClaw    │ │ 权限管理  │ │ 权限API      │
│ Gateway UI  │ │ 前端     │ │ (Backend)    │
│ (18789)     │ │ (3000)    │ │ (3001)       │
└──────────────┘ └──────────┘ └──────────────┘
```

### 方案 2: 独立管理面板 + API 拦截

```
┌─────────────────────────────────────────────────────────┐
│ OpenClaw Gateway UI                                    │
│ http://43.156.131.98:8998/                            │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ WebSocket 拦截
                     ▼
┌─────────────────────────────────────────────────────────┐
│ 权限中间件 (拦截所有 API 调用)                         │
│   - 验证用户 token                                      │
│   - 检查工作空间权限                                    │
│   - 过滤会话列表                                        │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ 权限管理系统                                           │
│   - 权限检查 API                                        │
│   - 用户管理                                           │
│   - 工作空间管理                                        │
└─────────────────────────────────────────────────────────┘
```

---

## 🔧 方案 1: Nginx 反向代理集成

### 1.1 Nginx 配置

```nginx
upstream openclaw_gateway {
    server 127.0.0.1:18789;
}

upstream permissions_ui {
    server 127.0.0.1:3000;
}

upstream permissions_api {
    server 127.0.0.1:3001;
}

server {
    listen 8998;
    server_name _;

    # OpenClaw Gateway UI (默认路径)
    location / {
        proxy_pass http://openclaw_gateway;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # WebSocket 支持
        proxy_set_header Connection "";
    }

    # 权限管理 UI (独立路径)
    location /admin/ {
        proxy_pass http://permissions_ui/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 权限管理 API
    location /api/permissions/ {
        proxy_pass http://permissions_api/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # OpenClaw Gateway WebSocket 拦截（可选）
    location /ws {
        proxy_pass http://permissions_gateway_interceptor;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

### 1.2 访问路径

- **OpenClaw Gateway UI**: http://43.156.131.98:8998/
- **权限管理 UI**: http://43.156.131.98:8998/admin/
- **权限 API**: http://43.156.131.98:8998/api/permissions/

---

## 🔌 方案 2: WebSocket 拦截集成

### 2.1 实现 WebSocket 拦截器

```typescript
// permissions-interceptor/src/index.ts
import WebSocket, { WebSocketServer } from 'ws';

const GATEWAY_WS_URL = 'ws://127.0.0.1:18789';
const INTERCEPTOR_PORT = 3002;

const wss = new WebSocketServer({ port: INTERCEPTOR_PORT });

console.log(`🔌 WebSocket 拦截器启动在端口 ${INTERCEPTOR_PORT}`);

wss.on('connection', (ws: WebSocket, req) => {
  // 从请求中获取 token
  const token = req.headers['authorization']?.replace('Bearer ', '');

  if (!token) {
    ws.close(1008, '未提供认证 token');
    return;
  }

  // 验证 token
  const { userId } = verifyToken(token);

  if (!userId) {
    ws.close(1008, '无效的 token');
    return;
  }

  // 连接到 OpenClaw Gateway
  const gatewayWs = new WebSocket(GATEWAY_WS_URL);

  gatewayWs.on('open', () => {
    console.log(`✅ 用户 ${userId} 连接到 Gateway`);

    // 拦截 Gateway 消息，添加权限过滤
    gatewayWs.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString());

        // 根据 user_id 过滤会话
        if (message.type === 'sessions_list') {
          message.data = filterSessionsByUser(userId, message.data);
        }

        // 转发过滤后的消息
        ws.send(JSON.stringify(message));
      } catch (error) {
        console.error('消息处理错误:', error);
        ws.send(data); // 转发原始消息
      }
    });
  });

  gatewayWs.on('error', (error) => {
    console.error('Gateway 连接错误:', error);
    ws.close();
  });

  gatewayWs.on('close', () => {
    ws.close();
  });

  // 拦截客户端发送的消息
  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data.toString());

      // 检查操作权限
      if (message.type === 'session_message' && message.sessionKey) {
        const hasPermission = checkSessionPermission(userId, message.sessionKey);

        if (!hasPermission) {
          ws.send(JSON.stringify({
            type: 'error',
            error: '权限不足',
          }));
          return;
        }
      }

      // 转发到 Gateway
      gatewayWs.send(data);
    } catch (error) {
      console.error('消息处理错误:', error);
      gatewayWs.send(data); // 转发原始消息
    }
  });

  ws.on('close', () => {
    gatewayWs.close();
  });
});
```

### 2.2 更新 Nginx 配置

```nginx
# WebSocket 拦截
location /ws {
    proxy_pass http://127.0.0.1:3002;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}
```

---

## 🎨 方案 3: 嵌入式 UI 扩展

### 3.1 在 OpenClaw UI 中嵌入权限管理

```typescript
// 使用 OpenClaw 的扩展机制（如果支持）
const permissionsExtension = {
  name: 'Permissions Management',
  version: '1.0.0',

  // 添加新菜单项
  menus: [
    {
      id: 'permissions',
      label: '权限管理',
      icon: 'LockOutlined',
      path: '/permissions',
    },
    {
      id: 'workspaces',
      label: '工作空间',
      icon: 'TeamOutlined',
      path: '/workspaces',
    },
    {
      id: 'users',
      label: '用户管理',
      icon: 'UserOutlined',
      path: '/users',
    },
  ],

  // 添加新路由
  routes: [
    {
      path: '/permissions',
      component: PermissionsPage,
    },
    {
      path: '/workspaces',
      component: WorkspacesPage,
    },
    {
      path: '/users',
      component: UsersPage,
    },
  ],

  // 拦截 API 调用
  apiInterceptor: {
    request: (config) => {
      // 添加权限 token
      const token = getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },

    response: (response) => {
      // 过滤权限之外的数据
      if (response.config.url === '/api/sessions') {
        response.data = filterSessions(getCurrentUserId(), response.data);
      }
      return response;
    },
  },
};

// 注册扩展
if (window.openclaw?.registerExtension) {
  window.openclaw.registerExtension(permissionsExtension);
}
```

---

## 🚀 推荐实施路径

### 步骤 1: 使用方案 1（Nginx 反向代理）

**优势**:
- ✅ 无需修改 OpenClaw 核心代码
- ✅ 独立部署，易于维护
- ✅ 不影响现有功能
- ✅ 可以独立更新

**实施**:
```bash
# 1. 部署权限管理后端
cd /root/.openclaw/workspace/permissions-system/backend
npm install
npm run migrate
npm start

# 2. 更新 Nginx 配置（如上面的配置）
sudo nano /etc/nginx/conf.d/openclaw.conf

# 3. 重启 Nginx
sudo systemctl restart nginx
```

### 步骤 2: 开发权限管理前端

**技术栈**:
- React + TypeScript
- Ant Design
- React Router
- Axios

**目录结构**:
```
permissions-system/frontend/
├── src/
│   ├── pages/
│   │   ├── Login.tsx           # 登录页
│   │   ├── Dashboard.tsx       # 控制台
│   │   ├── Workspaces.tsx      # 工作空间管理
│   │   ├── Users.tsx           # 用户管理
│   │   ├── Roles.tsx           # 角色管理
│   │   └── Permissions.tsx     # 权限管理
│   ├── components/
│   │   ├── WorkspaceCard.tsx
│   │   ├── UserTable.tsx
│   │   ├── RoleForm.tsx
│   │   └── PermissionChecker.tsx
│   ├── services/
│   │   └── api.ts             # API 调用
│   ├── App.tsx
│   └── main.tsx
├── package.json
├── vite.config.ts
└── tsconfig.json
```

### 步骤 3: 实现会话隔离

**在权限管理后端添加**:

```typescript
// backend/src/sessions/sessions.service.ts
export class SessionsService {
  async getUserSessions(userId: string, workspaceId?: string) {
    // 调用 OpenClaw Gateway API
    const sessions = await this.fetchOpenClawSessions();

    // 根据用户权限过滤
    const filtered = sessions.filter(session => {
      // 检查用户是否有访问该会话的权限
      return this.checkSessionPermission(userId, session.sessionKey);
    });

    return filtered;
  }

  private async checkSessionPermission(userId: string, sessionKey: string) {
    // 查询 user_sessions 表
    const [userSessions] = await pool.execute(
      'SELECT * FROM user_sessions WHERE user_id = ? AND session_key = ?',
      [userId, sessionKey]
    );

    return userSessions.length > 0;
  }
}
```

### 步骤 4: WebSocket 拦截（可选）

如果需要实时权限控制，实施方案 2。

---

## 📊 最终集成效果

### 用户访问路径

1. **打开 OpenClaw UI**: http://43.156.131.98:8998/
   - 查看所有会话（未登录）
   - 查看设备配对状态

2. **打开权限管理**: http://43.156.131.98:8998/admin/
   - 登录页面
   - 管理工作空间
   - 管理用户和角色

3. **权限过滤的会话列表**:
   - 只显示用户有权访问的会话
   - 根据工作空间自动分组

### 统一的用户体验

```
┌─────────────────────────────────────────────────┐
│  OpenClaw - 权限控制与工作空间管理              │
├─────────────────────────────────────────────────┤
│ [会话] [工作空间] [用户] [角色] [权限]         │
├─────────────────────────────────────────────────┤
│                                                 │
│  工作空间: My Workspace                        │
│  角色: Workspace Owner                         │
│                                                 │
│  会话列表:                                     │
│  ┌─────────────────────────────────┐             │
│  │ 📝 Echo-2 Main Session       │             │
│  │    active | 5 分钟前更新       │             │
│  └─────────────────────────────────┘             │
│                                                 │
│  ┌─────────────────────────────────┐             │
│  │ 🤖 Code Review Session        │             │
│  │    idle  | 1 小时前更新        │             │
│  └─────────────────────────────────┘             │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## 🎯 总结

### 推荐方案: **方案 1（Nginx 反向代理）**

**原因**:
- 无需修改 OpenClaw 核心代码
- 独立部署，易于维护
- 不影响现有功能
- 开发周期短

### 实施步骤

1. ✅ **后端已完成**（Phase 1 & 2）
2. ⏳ **开发前端**（Phase 3）
3. ⏳ **配置 Nginx**（集成）
4. ⏳ **测试和优化**（Phase 4）

### 需要我继续开发前端吗？

前端开发包括:
- 登录/注册页面
- Dashboard
- 用户管理界面
- 工作空间管理界面
- 角色和权限管理界面
- 会话列表（带权限过滤）

要开始吗？🚀
