/**
 * 通知路由
 * 处理与通知相关的API路由
 */

const express = require('express');
const router = express.Router();
const NotificationController = require('../controllers/NotificationController');
const { authenticateToken } = require('../middlewares/auth');

// 所有通知路由都需要身份验证
router.use(authenticateToken);

/**
 * @route GET /api/notifications
 * @desc 获取用户的通知列表
 * @access 私有
 */
router.get('/', NotificationController.getUserNotifications);

/**
 * @route PATCH /api/notifications/:notificationId/read
 * @desc 标记通知为已读
 * @access 私有
 */
router.patch('/:notificationId/read', NotificationController.markAsRead);

/**
 * @route PATCH /api/notifications/read-all
 * @desc 标记所有通知为已读
 * @access 私有
 */
router.patch('/read-all', NotificationController.markAllAsRead);

/**
 * @route DELETE /api/notifications/:notificationId
 * @desc 删除通知
 * @access 私有
 */
router.delete('/:notificationId', NotificationController.deleteNotification);

/**
 * @route GET /api/notifications/unread-count
 * @desc 获取未读通知数量
 * @access 私有
 */
router.get('/unread-count', NotificationController.getUnreadCount);

module.exports = router;
