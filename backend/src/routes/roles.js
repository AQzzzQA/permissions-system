const express = require('express');
const router = express.Router();

// 获取角色列表
router.get('/', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: 1,
        name: '超级管理员',
        code: 'superadmin',
        description: '拥有所有权限',
        permissions: ['all'],
        createdAt: '2024-01-01T00:00:00Z'
      },
      {
        id: 2,
        name: '管理员',
        code: 'admin',
        description: '管理权限',
        permissions: ['users:read', 'users:write', 'roles:read', 'roles:write'],
        createdAt: '2024-01-01T00:00:00Z'
      },
      {
        id: 3,
        name: '普通用户',
        code: 'user',
        description: '普通用户权限',
        permissions: ['users:read'],
        createdAt: '2024-01-01T00:00:00Z'
      }
    ]
  });
});

// 获取单个角色
router.get('/:id', (req, res) => {
  const roles = [
    { id: 1, name: '超级管理员', code: 'superadmin', permissions: ['all'] },
    { id: 2, name: '管理员', code: 'admin', permissions: ['users:read', 'users:write'] },
    { id: 3, name: '普通用户', code: 'user', permissions: ['users:read'] }
  ];

  const role = roles.find(r => r.id === parseInt(req.params.id));

  if (!role) {
    return res.status(404).json({ error: 'Role not found' });
  }

  res.json({
    success: true,
    data: role
  });
});

// 创建角色
router.post('/', (req, res) => {
  const { name, code, description, permissions } = req.body;

  res.status(201).json({
    success: true,
    data: {
      id: Date.now(),
      name,
      code,
      description,
      permissions: permissions || []
    }
  });
});

// 更新角色
router.put('/:id', (req, res) => {
  const { name, code, description, permissions } = req.body;

  res.json({
    success: true,
    message: 'Role updated successfully'
  });
});

// 删除角色
router.delete('/:id', (req, res) => {
  res.json({
    success: true,
    message: 'Role deleted successfully'
  });
});

module.exports = router;
