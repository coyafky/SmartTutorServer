/**
 * 消息模型
 * 用于存储家长和老师之间的交流数据
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MessageSchema = new Schema({
  // 对话ID（用于将相关消息分组）
  conversationId: {
    type: Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true
  },
  
  // 发送者ID
  senderId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // 接收者ID
  receiverId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // 消息内容
  content: {
    type: String,
    required: true,
    trim: true
  },
  
  // 消息类型（文本、图片、文件、课程相关等）
  messageType: {
    type: String,
    enum: [
      // 基础消息类型
      'text', 'image', 'file', 'audio', 
      // 教学相关消息类型
      'lesson_request', 'lesson_confirmation', 'lesson_reschedule', 
      'lesson_cancellation', 'homework_assignment', 'homework_submission',
      'progress_report', 'feedback'
    ],
    default: 'text'
  },
  
  // 如果是媒体消息，存储媒体URL
  mediaUrl: {
    type: String,
    default: null
  },
  
  // 教学相关消息的元数据
  metadata: {
    // 课程相关信息
    lesson: {
      date: Date,         // 课程日期
      startTime: String,  // 开始时间
      endTime: String,    // 结束时间
      subject: String,    // 学科
      location: String,   // 地点
      mode: {            // 授课模式
        type: String,
        enum: ['online', 'offline'],
        default: 'offline'
      },
      status: {          // 课程状态
        type: String,
        enum: ['pending', 'confirmed', 'cancelled', 'completed'],
        default: 'pending'
      }
    },
    
    // 作业相关信息
    homework: {
      title: String,      // 作业标题
      description: String, // 作业描述
      dueDate: Date,      // 截止日期
      attachments: [{     // 附件列表
        name: String,     // 文件名
        url: String       // 文件URL
      }],
      status: {          // 作业状态
        type: String,
        enum: ['assigned', 'submitted', 'graded'],
        default: 'assigned'
      }
    },
    
    // 进度报告相关信息
    progress: {
      period: String,     // 报告周期
      strengths: [String], // 优势
      weaknesses: [String], // 弱点
      recommendations: [String] // 建议
    }
  },
  
  // 阅读状态
  isRead: {
    type: Boolean,
    default: false
  },
  
  // 创建时间
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  // 更新时间
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// 创建索引以提高查询效率
MessageSchema.index({ conversationId: 1, createdAt: -1 });
MessageSchema.index({ senderId: 1, receiverId: 1 });
MessageSchema.index({ receiverId: 1, isRead: 1 });

// 消息预处理
MessageSchema.pre('save', function(next) {
  // 更新时间戳
  this.updatedAt = Date.now();
  next();
});

// 静态方法：获取未读消息数
MessageSchema.statics.getUnreadCount = async function(userId) {
  return await this.countDocuments({
    receiverId: userId,
    isRead: false
  });
};

// 静态方法：将消息标记为已读
MessageSchema.statics.markAsRead = async function(messageIds, userId) {
  return await this.updateMany(
    { 
      _id: { $in: messageIds },
      receiverId: userId
    },
    { $set: { isRead: true } }
  );
};

// 静态方法：获取对话的最后一条消息
MessageSchema.statics.getLastMessage = async function(conversationId) {
  return await this.findOne({ conversationId })
    .sort({ createdAt: -1 })
    .limit(1);
};

const Message = mongoose.model('Message', MessageSchema);

module.exports = Message;
