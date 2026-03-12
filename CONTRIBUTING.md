# 贡献指南

**出品方**: 乐盟互动 (Lemeng Interactive)  
**版本**: 1.2.0  

---

## 🤝 如何贡献

我们欢迎所有形式的贡献！无论是代码、文档、问题报告还是功能建议。

---

## 📋 开发环境设置

### 前置要求
- Node.js 18+
- npm 8+
- Docker 20.10+
- MySQL 8.0+
- Git

### 克隆和设置
```bash
# 克隆项目
git clone https://github.com/openclaw/permissions-system.git
cd permissions-system

# 安装依赖
cd backend && npm install
cd ../frontend && npm install

# 配置环境变量
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# 启动开发环境
cd ..
docker-compose up -d

# 运行测试
cd backend && npm test
cd ../frontend && npm run test
```

---

## 🏗️ 项目结构

```
permissions-system/
├── backend/                 # 后端服务
│   ├── src/
│   │   ├── auth/           # 认证模块
│   │   ├── workspaces/     # 工作空间管理
│   │   ├── users/          # 用户管理
│   │   ├── roles/          # 角色管理
│   │   ├── permissions/    # 权限管理
│   │   ├── skills/         # 技能管理
│   │   ├── database/       # 数据库
│   │   └── index.ts
│   ├── tests/              # 测试文件
│   ├── Dockerfile
│   ├── package.json
│   └── .env.example
├── frontend/                # 前端管理界面
│   ├── src/
│   │   ├── pages/          # 页面
│   │   ├── components/     # 组件
│   │   ├── services/       # API 服务
│   │   ├── contexts/       # React Context
│   │   ├── layouts/        # 布局
│   │   └── types/          # 类型定义
│   ├── tests/              # 测试文件
│   ├── Dockerfile
│   ├── package.json
│   └── vite.config.ts
└── docs/                   # 文档目录
```

---

## 📝 代码规范

### TypeScript/JavaScript
- 使用 TypeScript 严格模式
- 遵循 ESLint 配置
- 使用 Prettier 格式化代码
- 编写 JSDoc 注释

```typescript
// 好的示例
/**
 * 验证用户权限
 * @param userId 用户ID
 * @param permission 权限名称
 * @returns 是否有权限
 */
async function checkUserPermission(userId: string, permission: string): Promise<boolean> {
  // 实现...
}
```

### API 设计
- 使用 RESTful 设计
- 统一错误处理
- 输入参数验证
- 适当的 HTTP 状态码

```typescript
// 好的 API 示例
router.post('/users', async (req, res) => {
  try {
    const userData = validateUserInput(req.body);
    const user = await userService.create(userData);
    res.status(201).json({ success: true, data: user });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});
```

### React 组件
- 使用函数组件和 Hooks
- 适当的类型定义
- 组件拆分和复用
- 状态管理优化

```typescript
// 好的组件示例
interface UserListProps {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (userId: string) => void;
}

const UserList: React.FC<UserListProps> = ({ users, onEdit, onDelete }) => {
  const [loading, setLoading] = useState(false);

  const handleDelete = async (userId: string) => {
    setLoading(true);
    try {
      await onDelete(userId);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="user-list">
      {users.map(user => (
        <UserCard 
          key={user.id} 
          user={user} 
          onEdit={onEdit}
          onDelete={() => handleDelete(user.id)}
          loading={loading}
        />
      ))}
    </div>
  );
};
```

---

## 🧪 测试规范

### 测试类型
1. **单元测试**: 测试单个函数和组件
2. **集成测试**: 测试模块间交互
3. **端到端测试**: 测试完整用户流程

### 测试工具
- **后端**: Jest + Supertest
- **前端**: Jest + React Testing Library
- **E2E**: Playwright

### 测试要求
- 测试覆盖率 > 80%
- 测试文件与源码同目录
- 测试描述清晰明确
- 包含异常情况测试

```typescript
// 好的测试示例
describe('UserService', () => {
  describe('createUser', () => {
    it('should create a new user successfully', async () => {
      const userData = { email: 'test@example.com', password: 'password123' };
      const user = await userService.create(userData);
      
      expect(user).toMatchObject({ email: userData.email });
      expect(user.id).toBeDefined();
    });

    it('should throw error for invalid email', async () => {
      const invalidData = { email: 'invalid-email', password: 'password123' };
      
      await expect(userService.create(invalidData)).rejects.toThrow();
    });
  });
});
```

---

## 🔍 代码审查

### 审查流程
1. 开发者创建 Pull Request
2. 自动 CI/CD 检查
3. 至少一位开发者审查
4. 测试验证通过
5. 合并到主分支

### 审查标准
- 代码质量和技术标准
- 功能正确性和安全性
- 性能和可维护性
- 文档完整性
- 测试覆盖率

### 审查清单
- [ ] 代码符合项目规范
- [ ] 所有测试通过
- [ ] 无安全漏洞
- [ ] 性能影响已评估
- [ ] 文档已更新
- [ ] 变更日志已更新

---

## 📋 Pull Request 流程

### 创建 PR
1. 创建新分支: `git checkout -b feature/new-feature`
2. 提交更改: `git commit -m "Add new feature"`
3. 推送分支: `git push origin feature/new-feature`
4. 创建 Pull Request

### PR 模板
```markdown
## 变更描述
简要描述这个 PR 的目的和内容。

## 变更类型
- [ ] Bug 修复
- [ ] 新功能
- [ ] 文档更新
- [ ] 性能优化
- [ ] 重构

## 测试
- [ ] 单元测试已添加
- [ ] 集成测试已添加
- [ ] 端到端测试已添加

## 破坏性变更
- [ ] 有破坏性变更
- [ ] 无破坏性变更

## 截图（如适用）
![功能截图]

## 相关 Issue
Closes #123
```

---

## 📚 文档贡献

### 文档更新规范
- 保持文档同步代码更新
- 使用清晰的标题和结构
- 包含代码示例
- 添加截图和图表

### Markdown 规范
- 使用标准的 Markdown 格式
- 代码块使用正确的语言标识
- 表格格式统一
- 链接格式一致

---

## 🏆 贡献者

感谢所有为这个项目做出贡献的人！

### 贡献者权益
- 在项目主页显示贡献者列表
- 获得项目更新通知
- 参与项目决策讨论
- 优先获得技术支持

### 贡献者等级
- **贡献者**: 提交有价值的问题报告或文档
- **开发者**: 提交代码修复或新功能
- **核心贡献者**: 持续贡献代码和文档
- **维护者**: 管理项目代码和版本发布

---

## 📞 联系方式

- **GitHub Issues**: [提交问题](https://github.com/openclaw/permissions-system/issues)
- **讨论区**: [参与讨论](https://github.com/openclaw/permissions-system/discussions)
- **邮件**: lemeng-interactive@example.com
- **微信**: Lemeng-Interactive

---

## 📝 贡献协议

通过贡献代码，你同意按照项目的开源许可证授权你的贡献。

---

**最后更新**: 2026-03-12  
**维护方**: 乐盟互动 (Lemeng Interactive)  
**文档版本**: 1.2.0