const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// 获取用户列表
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, email, name, role, status, created_at FROM users ORDER BY created_at DESC'
    );

    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 获取单个用户
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, email, name, role, status, created_at FROM users WHERE id = ?',
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      data: rows[0]
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 创建用户
router.post('/', async (req, res) => {
  try {
    const { email, name, password, role } = req.body;

    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      'INSERT INTO users (email, name, password, role, status) VALUES (?, ?, ?, ?, ?)',
      [email, name, hashedPassword, role || 'user', 'active']
    );

    res.status(201).json({
      success: true,
      data: {
        id: result.insertId,
        email,
        name,
        role: role || 'user'
      }
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 更新用户
router.put('/:id', async (req, res) => {
  try {
    const { email, name, role, status } = req.body;

    await pool.query(
      'UPDATE users SET email = ?, name = ?, role = ?, status = ? WHERE id = ?',
      [email, name, role, status, req.params.id]
    );

    res.json({
      success: true,
      message: 'User updated successfully'
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 删除用户
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM users WHERE id = ?', [req.params.id]);

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
