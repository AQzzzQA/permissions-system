const express = require('express');
const router = express.Router();

// 获取权限列表
router.get('/', (req, res) => {
  res.json({
    success: true,
    data: [
      { id: 1, name: '用户管理', code: 'users:read', category: '用户管理' },
      { id: 2, name: '用户创建', code: 'users:write', category: '用户管理' },
      { id: 3, name: '用户删除', code: 'users:delete', category: '用户管理' },
      { id: 4, name: '角色管理', code: 'roles:read', category: '角色管理' },
      { id: 5, name: '角色创建', code: 'roles:write', category: '角色管理' },
      { id: 6, name: '角色删除', code: 'roles:delete', category: '角色管理' },
      { id: 7, name: '权限管理', code: 'permissions:read', category: '权限管理' },
      { id: 8, name: '权限创建', code: 'permissions:write', category: '权限管理' },
      { id: 9, name: '菜单管理', code: 'menus:read', category: '菜单管理' },
      { id: 10, name: '菜单创建', code: 'menus:write', category: '菜单管理' }
    ]
  });
});

// 获取单个权限
router.get('/:id', (req, res) => {
  const permissions = [
    { id: 1, name: '用户管理', code: 'users:read' },
    { id: 2, name: '用户创建', code: 'users:write' },
    { id: 3, name: '用户删除', code: 'users:delete' }
  ];

  const permission = permissions.find(p => p.id === parseInt(req.params.id));

  if (!permission) {
    return res.status(404).json({ error: 'Permission not found' });
  }

  res.json({
    success: true,
    data: permission
  });
});

// 创建权限
router.post('/', (req, res) => {
  const { name, code, category } = req.body;

  res.status(201).json({
    success: true,
    data: {
      id: Date.now(),
      name,
      code,
      category
    }
  });
});

// 更新权限
router.put('/:id', (req, res) => {
  const { name, code, category } = req.body;

  res.json({
    success: true,
    message: 'Permission updated successfully'
  });
});

// 删除权限
router.delete('/:id', (req, res) => {
  res.json({
    success: true,
    message: 'Permission deleted successfully'
  });
});

module.exports = router;
