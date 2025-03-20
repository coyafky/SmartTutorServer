/**
 * 通知服务
 * 处理系统通知的发送和管理
 */

const Notification = require('../../models/Notification');
const SocketService = require('./SocketService');

class NotificationService {
  /**
   * 发送通知
   * @param {String} userId - 接收通知的用户ID
   * @param {String} title - 通知标题
   * @param {String} content - 通知内容
   * @param {String} type - 通知类型
   * @param {Object} metadata - 附加数据
   * @returns {Promise<Object>} - 创建的通知
   */
  static async sendNotification(userId, title, content, type = 'system', metadata = {}) {
    try {
      // 创建通知记录
      const notification = new Notification({
        userId,
        title,
        content,
        type,
        metadata,
        isRead: false,
        createdAt: new Date()
      });
      
      await notification.save();
      
      // 通过Socket发送实时通知
      SocketService.emitToUser(userId, 'notification', {
        notification: {
          _id: notification._id,
          title,
          content,
          type,
          metadata,
          createdAt: notification.createdAt
        }
      });
      
      return notification;
    } catch (error) {
      console.error('发送通知失败:', error);
      throw error;
    }
  }
  
  /**
   * 获取用户的通知列表
   * @param {String} userId - 用户ID
   * @param {Boolean} unreadOnly - 是否只获取未读通知
   * @param {Number} limit - 限制数量
   * @param {Number} skip - 跳过数量
   * @returns {Promise<Array>} - 通知列表
   */
  static async getUserNotifications(userId, unreadOnly = false, limit = 20, skip = 0) {
    try {
      const query = { userId };
      
      if (unreadOnly) {
        query.isRead = false;
      }
      
      const notifications = await Notification.find(query)
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip)
        .exec();
      
      return notifications;
    } catch (error) {
      console.error('获取用户通知失败:', error);
      throw error;
    }
  }
  
  /**
   * 标记通知为已读
   * @param {String} notificationId - 通知ID
   * @param {String} userId - 用户ID（用于验证权限）
   * @returns {Promise<Object>} - 更新后的通知
   */
  static async markAsRead(notificationId, userId) {
    try {
      const notification = await Notification.findById(notificationId);
      
      if (!notification) {
        throw new Error('通知不存在');
      }
      
      if (notification.userId.toString() !== userId.toString()) {
        throw new Error('无权操作此通知');
      }
      
      notification.isRead = true;
      notification.readAt = new Date();
      
      await notification.save();
      
      return notification;
    } catch (error) {
      console.error('标记通知为已读失败:', error);
      throw error;
    }
  }
  
  /**
   * 标记所有通知为已读
   * @param {String} userId - 用户ID
   * @returns {Promise<Number>} - 更新的通知数量
   */
  static async markAllAsRead(userId) {
    try {
      const result = await Notification.updateMany(
        { userId, isRead: false },
        { $set: { isRead: true, readAt: new Date() } }
      );
      
      return result.nModified || 0;
    } catch (error) {
      console.error('标记所有通知为已读失败:', error);
      throw error;
    }
  }
  
  /**
   * 删除通知
   * @param {String} notificationId - 通知ID
   * @param {String} userId - 用户ID（用于验证权限）
   * @returns {Promise<Boolean>} - 是否成功删除
   */
  static async deleteNotification(notificationId, userId) {
    try {
      const notification = await Notification.findById(notificationId);
      
      if (!notification) {
        throw new Error('通知不存在');
      }
      
      if (notification.userId.toString() !== userId.toString()) {
        throw new Error('无权操作此通知');
      }
      
      await notification.remove();
      
      return true;
    } catch (error) {
      console.error('删除通知失败:', error);
      throw error;
    }
  }
  
  /**
   * 获取用户未读通知数量
   * @param {String} userId - 用户ID
   * @returns {Promise<Number>} - 未读通知数量
   */
  static async getUnreadCount(userId) {
    try {
      return await Notification.countDocuments({ userId, isRead: false });
    } catch (error) {
      console.error('获取未读通知数量失败:', error);
      throw error;
    }
  }
}

module.exports = NotificationService;
