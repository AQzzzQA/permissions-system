import React from 'react';

const TestPage: React.FC = () => {
  return (
    <div style={{ padding: '20px', fontSize: '18px', lineHeight: 2 }}>
      <h1>✅ 测试页面 - 前端正常工作</h1>
      <p>如果你看到这个页面，说明前端渲染正常！</p>
      <p>时间：{new Date().toLocaleString()}</p>
      <p>测试项目：</p>
      <ul>
        <li>✅ React 组件渲染</li>
        <li>✅ 样式加载</li>
        <li>✅ 路由配置</li>
      </ul>
    </div>
  );
};

export default TestPage;
