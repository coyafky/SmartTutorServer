/**
 * 消息路由
 * 定义与家长和老师交流相关的路由
 * @module routes/messageRoutes
 */

const express = require('express');
const router = express.Router();
const MessageController = require('../controllers/MessageController');
const { authenticateToken } = require('../middlewares/auth');

// 所有路由都需要认证
router.use(authenticateToken);

/**
 * @route GET /api/messages/conversations
 * @desc 获取用户的所有对话
 * @access 私有
 */
router.get('/conversations', MessageController.getConversations);

/**
 * @route POST /api/messages/conversations
 * @desc 获取或创建与特定用户的对话
 * @access 私有
 */
router.post('/conversations', MessageController.getOrCreateConversation);

/**
 * @route GET /api/messages/conversations/:conversationId
 * @desc 获取对话消息
 * @access 私有
 */
router.get('/conversations/:conversationId', MessageController.getMessages);

/**
 * @route POST /api/messages/send
 * @desc 发送消息
 * @access 私有
 */
router.post('/send', MessageController.sendMessage);

/**
 * @route POST /api/messages/mark-read
 * @desc 标记消息为已读
 * @access 私有
 */
router.post('/mark-read', MessageController.markAsRead);

/**
 * @route GET /api/messages/unread
 * @desc 获取未读消息数
 * @access 私有
 */
router.get('/unread', MessageController.getUnreadCount);

/**
 * @route DELETE /api/messages/:messageId
 * @desc 删除消息
 * @access 私有
 */
router.delete('/:messageId', MessageController.deleteMessage);

/**
 * @route PATCH /api/messages/conversations/:conversationId/archive
 * @desc 归档对话
 * @access 私有
 */
router.patch(
  '/conversations/:conversationId/archive',
  MessageController.archiveConversation
);

/**
 * @route PATCH /api/messages/conversations/:conversationId/restore
 * @desc 恢复已归档的对话
 * @access 私有
 */
router.patch(
  '/conversations/:conversationId/restore',
  MessageController.restoreConversation
);

/**
 * @route POST /api/messages/lesson-request
 * @desc 发送课程请求消息
 * @access 私有
 */
router.post('/lesson-request', MessageController.sendLessonRequest);

/**
 * @route POST /api/messages/lesson-confirmation
 * @desc 发送课程确认消息
 * @access 私有
 */
router.post('/lesson-confirmation', MessageController.sendLessonConfirmation);

/**
 * @route POST /api/messages/lesson-reschedule
 * @desc 发送课程变更消息
 * @access 私有
 */
router.post('/lesson-reschedule', MessageController.sendLessonReschedule);

/**
 * @route POST /api/messages/lesson-cancellation
 * @desc 发送课程取消消息
 * @access 私有
 */
router.post('/lesson-cancellation', MessageController.sendLessonCancellation);

/**
 * @route POST /api/messages/homework-assignment
 * @desc 发送作业布置消息
 * @access 私有
 */
router.post('/homework-assignment', MessageController.sendHomeworkAssignment);

/**
 * @route POST /api/messages/homework-submission
 * @desc 发送作业提交消息
 * @access 私有
 */
router.post('/homework-submission', MessageController.sendHomeworkSubmission);

/**
 * @route POST /api/messages/progress-report
 * @desc 发送进度报告消息
 * @access 私有
 */
router.post('/progress-report', MessageController.sendProgressReport);

module.exports = router;
