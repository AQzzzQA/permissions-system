# 前端测试指南

**版本**: v1.0.0
**更新时间**: 2026-03-17 18:50

---

## 🎯 测试智能体

### Frontend-Tester（前端测试专家）

**职责**:
- 使用浏览器自动化工具测试前端应用
- 发现前端功能问题和UI/UX问题
- 协调后端开发修复API相关问题
- 向高级领导汇报无法独立解决的问题
- 生成详细测试报告

**技术栈**:
- Agent Browser（OpenClaw 内置浏览器自动化）
- Selenium WebDriver（备用方案）
- Playwright（备用方案）

---

## 🧪 测试流程

### 1. 启动测试智能体

```bash
# 使用 sessions_spawn 调用前端测试智能体
sessions_spawn \
  --runtime=subagent \
  --task="测试权限系统前端：http://43.156.131.98:3000" \
  --label="Frontend-Tester" \
  --agentId="Frontend-Tester"
```

### 2. 自动化测试脚本

```bash
# 运行完整测试套件
cd /root/.openclaw/workspace/permissions-system
node test-frontend.js http://43.156.131.98:3000

# 测试本地环境
node test-frontend.js http://localhost:3000
```

### 3. 手动测试

使用 Agent Browser 进行手动测试：

```bash
# 打开登录页面
openclaw browser open http://43.156.131.98:3000/login

# 截图
openclaw browser screenshot --output=/tmp/login.png

# 查找元素
openclaw browser snapshot --refs=aria

# 点击元素
openclaw browser act --kind=click --ref="button-submit"

# 填写表单
openclaw browser act --kind=type --ref="input-email" --text="admin@example.com"
```

---

## 📋 测试用例

### 登录测试

| 用例 | 步骤 | 预期结果 |
|-----|------|---------|
| 正常登录 | 输入正确的邮箱和密码，点击登录 | 跳转到首页，显示侧边栏 |
| 错误密码 | 输入错误的密码 | 显示错误提示 |
| 空表单 | 不输入任何内容直接提交 | 显示验证错误 |
| Token过期 | 使用过期Token访问API | 自动跳转到登录页 |

### 用户管理测试

| 用例 | 步骤 | 预期结果 |
|-----|------|---------|
| 查看用户列表 | 访问 /users | 显示用户列表表格 |
| 添加用户 | 点击"添加用户"，填写表单 | 成功添加用户，列表更新 |
| 编辑用户 | 点击"编辑"按钮，修改信息 | 成功更新用户信息 |
| 删除用户 | 点击"删除"按钮，确认删除 | 成功删除用户，列表更新 |

### 响应式测试

| 设备 | 宽度 | 测试内容 |
|-----|------|---------|
| 移动端 | < 576px | 侧边栏隐藏，菜单图标显示 |
| 平板端 | 576px - 992px | 布局自适应，表格横向滚动 |
| 桌面端 | > 992px | 完整显示，布局最优 |

---

## 🤖 协作机制

### 与 Frontend-Expert 协作

**场景**: 发现前端样式问题

```bash
# 调用前端开发专家
sessions_spawn \
  --runtime=subagent \
  --task="修复用户管理页面表格在小屏幕显示错位问题：添加表格横向滚动支持" \
  --label="Frontend-Expert"
```

### 与 Backend-Expert 协作

**场景**: 发现API问题

```bash
# 调用后端开发专家
sessions_spawn \
  --runtime=subagent \
  --task="修复用户列表API：返回数据缺少created_at字段，导致前端排序功能异常" \
  --label="Backend-Expert"
```

### 向高级领导汇报

**场景**: 发现高优先级问题

```bash
# 生成汇报
echo "
# 🚨 高级汇报：权限系统测试问题

**汇报人**: Frontend-Tester
**测试时间**: 2026-03-17 18:50
**严重程度**: 🔴 高

## 问题描述
[详细描述问题]

## 影响范围
[列出受影响的模块]

## 建议行动
[提出具体建议]
" > /tmp/high-priority-report.md
```

---

## 📊 测试报告

### 报告结构

```markdown
# 前端测试报告

**测试时间**: 2026-03-17 18:50
**测试环境**: http://43.156.131.98:3000

## 测试概览

| 指标 | 数值 |
|-----|------|
| 总用例 | 20 |
| 通过 | 18 |
| 失败 | 2 |
| 通过率 | 90% |

## 测试详情

### 登录测试 ✅

- ✅ 正常登录
- ✅ 错误密码提示
- ❌ 空表单验证（失败）

### 用户管理测试 ✅

- ✅ 查看用户列表
- ✅ 添加用户
- ✅ 编辑用户

## 发现的问题

### 问题1: 空表单验证缺失
- **严重程度**: 🟡 中
- **模块**: 登录页面
- **复现步骤**: 不输入任何内容直接点击登录
- **解决方案**: 添加表单验证

### 问题2: 表格横向滚动缺失
- **严重程度**: 🟡 中
- **模块**: 用户管理
- **复现步骤**: 在小屏幕查看用户列表
- **解决方案**: 在 Table 组件添加 `scroll={{ x: true }}`

## 建议行动

1. 立即修复两个中优先级问题
2. 完善表单验证机制
3. 增强响应式布局

---

**测试结论**: 系统整体功能正常，建议修复发现的问题后发布。
```

---

## 🚀 快速开始

### 1. 测试权限系统

```bash
# 运行自动化测试
cd /root/.openclaw/workspace/permissions-system
node test-frontend.js http://43.156.131.98:3000

# 查看报告
cat test-report.md
```

### 2. 启动测试智能体

```bash
# 调用 Frontend-Tester
sessions_spawn \
  --runtime=subagent \
  --task="测试权限系统前端：http://43.156.131.98:3000" \
  --label="Frontend-Tester" \
  --agentId="Frontend-Tester"
```

### 3. 手动测试

```bash
# 使用 Agent Browser
openclaw browser open http://43.156.131.98:3000/login

# 截图
openclaw browser screenshot --output=/tmp/test.png

# 查看快照
openclaw browser snapshot --refs=aria
```

---

## 📁 测试文件

- `test-frontend.js` - 自动化测试脚本
- `test-report.json` - JSON 格式报告
- `test-report.md` - Markdown 格式报告
- `test-screenshots/` - 测试截图目录

---

## 🔧 配置

### 测试环境

```javascript
const config = {
  baseUrl: 'http://43.156.131.98:3000',
  screenshotsDir: './test-screenshots',
  reportFile: './test-report.json',
  timeout: 10000
};
```

### 测试用例

```javascript
const testCases = [
  {
    name: '登录页面测试',
    url: '/login',
    steps: [
      { action: 'screenshot', name: 'login-page' },
      { action: 'type', ref: 'input-email', text: 'admin@example.com' },
      { action: 'type', ref: 'input-password', text: 'Admin123!' },
      { action: 'click', ref: 'button-submit' }
    ],
    expectations: [
      '应跳转到首页',
      '应显示侧边栏'
    ]
  }
];
```

---

## 🎓 最佳实践

### 1. 测试金字塔

```
        /\
       /E2E\          - 少量端到端测试
      /------\
     /  集成  \        - 适量集成测试
    /----------\
   /    单元    \      - 大量单元测试
  /______________\
```

### 2. 测试覆盖率

- **单元测试**: > 80%
- **集成测试**: > 60%
- **E2E测试**: 关键路径 100%

### 3. 问题分级

- 🔴 高优先级：立即修复（功能完全不可用）
- 🟡 中优先级：24小时内修复（功能部分可用）
- 🟢 低优先级：下个迭代修复（体验改进）

---

## 📝 注意事项

1. **测试隔离**: 每个测试用例应该独立运行
2. **数据清理**: 测试后清理测试数据
3. **环境一致性**: 确保测试环境与生产环境一致
4. **定期测试**: 每次代码变更后运行测试
5. **自动化优先**: 优先使用自动化测试

---

**文档版本**: v1.0.0
**最后更新**: 2026-03-17 18:50
