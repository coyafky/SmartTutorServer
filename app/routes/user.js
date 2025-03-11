const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UserController');
const { authenticateToken, checkRole } = require('../middlewares/auth');

// 所有路由都需要认证
router.use(authenticateToken);

// 获取用户列表（仅管理员可访问）
router.get('/', checkRole('admin'), UserController.getUsers);

// 获取单个用户信息
router.get('/:customId', UserController.getUser);

// 更新用户信息
router.post('/:customId/update', UserController.updateUser);

// 更新用户状态（仅管理员可访问）
router.post('/:customId/status', checkRole('admin'), UserController.updateUserStatus);

module.exports = router;