const express = require('express');
const router = express.Router();

// 获取菜单列表
router.get('/', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: 1,
        name: '首页',
        path: '/',
        icon: 'dashboard',
        component: 'Dashboard',
        children: []
      },
      {
        id: 2,
        name: '用户管理',
        path: '/users',
        icon: 'user',
        component: 'UserManagement',
        children: [
          { id: 21, name: '用户列表', path: '/users/list', icon: 'list' },
          { id: 22, name: '用户添加', path: '/users/add', icon: 'plus' }
        ]
      },
      {
        id: 3,
        name: '角色管理',
        path: '/roles',
        icon: 'team',
        component: 'RoleManagement',
        children: [
          { id: 31, name: '角色列表', path: '/roles/list', icon: 'list' },
          { id: 32, name: '角色添加', path: '/roles/add', icon: 'plus' }
        ]
      },
      {
        id: 4,
        name: '权限管理',
        path: '/permissions',
        icon: 'key',
        component: 'PermissionManagement',
        children: []
      },
      {
        id: 5,
        name: '菜单管理',
        path: '/menus',
        icon: 'menu',
        component: 'MenuManagement',
        children: []
      }
    ]
  });
});

// 获取单个菜单
router.get('/:id', (req, res) => {
  const menus = [
    { id: 1, name: '首页', path: '/' },
    { id: 2, name: '用户管理', path: '/users' },
    { id: 3, name: '角色管理', path: '/roles' }
  ];

  const menu = menus.find(m => m.id === parseInt(req.params.id));

  if (!menu) {
    return res.status(404).json({ error: 'Menu not found' });
  }

  res.json({
    success: true,
    data: menu
  });
});

// 创建菜单
router.post('/', (req, res) => {
  const { name, path, icon, component, parentId } = req.body;

  res.status(201).json({
    success: true,
    data: {
      id: Date.now(),
      name,
      path,
      icon,
      component,
      parentId: parentId || null
    }
  });
});

// 更新菜单
router.put('/:id', (req, res) => {
  const { name, path, icon, component, parentId } = req.body;

  res.json({
    success: true,
    message: 'Menu updated successfully'
  });
});

// 删除菜单
router.delete('/:id', (req, res) => {
  res.json({
    success: true,
    message: 'Menu deleted successfully'
  });
});

module.exports = router;
