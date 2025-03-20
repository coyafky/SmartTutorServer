/**
 * 通知模型
 * 用于存储系统通知
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const NotificationSchema = new Schema({
  // 接收通知的用户ID
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // 通知标题
  title: {
    type: String,
    required: true,
    trim: true
  },
  
  // 通知内容
  content: {
    type: String,
    required: true,
    trim: true
  },
  
  // 通知类型
  type: {
    type: String,
    enum: ['system', 'lesson', 'homework', 'message', 'payment'],
    default: 'system'
  },
  
  // 附加数据
  metadata: {
    type: Schema.Types.Mixed,
    default: {}
  },
  
  // 是否已读
  isRead: {
    type: Boolean,
    default: false
  },
  
  // 阅读时间
  readAt: {
    type: Date,
    default: null
  },
  
  // 创建时间
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// 索引
NotificationSchema.index({ userId: 1, createdAt: -1 });
NotificationSchema.index({ userId: 1, isRead: 1 });

const Notification = mongoose.model('Notification', NotificationSchema);

module.exports = Notification;
