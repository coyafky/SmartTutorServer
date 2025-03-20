/**
 * 通知控制器
 * 处理与通知相关的HTTP请求
 */

const NotificationService = require('../services/NotificationService');
const { validationResult } = require('express-validator');

class NotificationController {
  /**
   * 获取用户的通知列表
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   * @returns {Object} - JSON响应
   */
  static async getUserNotifications(req, res) {
    try {
      const userId = req.user.id;
      const { unreadOnly, limit, skip } = req.query;
      
      const notifications = await NotificationService.getUserNotifications(
        userId,
        unreadOnly === 'true',
        limit ? parseInt(limit) : 20,
        skip ? parseInt(skip) : 0
      );
      
      return res.status(200).json({
        success: true,
        count: notifications.length,
        data: notifications
      });
    } catch (error) {
      console.error('获取用户通知列表失败:', error);
      return res.status(500).json({
        success: false,
        message: error.message || '获取用户通知列表失败'
      });
    }
  }
  
  /**
   * 标记通知为已读
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   * @returns {Object} - JSON响应
   */
  static async markAsRead(req, res) {
    try {
      const { notificationId } = req.params;
      const userId = req.user.id;
      
      const notification = await NotificationService.markAsRead(notificationId, userId);
      
      return res.status(200).json({
        success: true,
        message: '通知已标记为已读',
        data: notification
      });
    } catch (error) {
      console.error('标记通知为已读失败:', error);
      return res.status(500).json({
        success: false,
        message: error.message || '标记通知为已读失败'
      });
    }
  }
  
  /**
   * 标记所有通知为已读
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   * @returns {Object} - JSON响应
   */
  static async markAllAsRead(req, res) {
    try {
      const userId = req.user.id;
      
      const count = await NotificationService.markAllAsRead(userId);
      
      return res.status(200).json({
        success: true,
        message: `${count}条通知已标记为已读`,
        count
      });
    } catch (error) {
      console.error('标记所有通知为已读失败:', error);
      return res.status(500).json({
        success: false,
        message: error.message || '标记所有通知为已读失败'
      });
    }
  }
  
  /**
   * 删除通知
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   * @returns {Object} - JSON响应
   */
  static async deleteNotification(req, res) {
    try {
      const { notificationId } = req.params;
      const userId = req.user.id;
      
      const success = await NotificationService.deleteNotification(notificationId, userId);
      
      if (!success) {
        return res.status(404).json({
          success: false,
          message: '通知不存在或已删除'
        });
      }
      
      return res.status(200).json({
        success: true,
        message: '通知已删除'
      });
    } catch (error) {
      console.error('删除通知失败:', error);
      return res.status(500).json({
        success: false,
        message: error.message || '删除通知失败'
      });
    }
  }
  
  /**
   * 获取未读通知数量
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   * @returns {Object} - JSON响应
   */
  static async getUnreadCount(req, res) {
    try {
      const userId = req.user.id;
      
      const count = await NotificationService.getUnreadCount(userId);
      
      return res.status(200).json({
        success: true,
        count
      });
    } catch (error) {
      console.error('获取未读通知数量失败:', error);
      return res.status(500).json({
        success: false,
        message: error.message || '获取未读通知数量失败'
      });
    }
  }
}

module.exports = NotificationController;
