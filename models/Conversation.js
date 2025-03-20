/**
 * 对话模型
 * 用于管理家长和老师之间的对话
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ConversationSchema = new Schema({
  // 参与者（家长和老师的用户ID）
  participants: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  
  // 对话标题
  title: {
    type: String,
    trim: true,
    default: ''
  },
  
  // 对话类型（普通对话、咨询、课后反馈等）
  type: {
    type: String,
    enum: ['general', 'consultation', 'feedback', 'schedule'],
    default: 'general'
  },
  
  // 相关联的家教需求（如果有）
  tutoringRequestId: {
    type: Schema.Types.ObjectId,
    ref: 'TutoringRequest',
    default: null
  },
  
  // 最后一条消息的预览
  lastMessagePreview: {
    type: String,
    default: ''
  },
  
  // 最后活动时间
  lastActivityAt: {
    type: Date,
    default: Date.now
  },
  
  // 对话状态
  status: {
    type: String,
    enum: ['active', 'archived', 'deleted'],
    default: 'active'
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
ConversationSchema.index({ participants: 1 });
ConversationSchema.index({ status: 1, lastActivityAt: -1 });
ConversationSchema.index({ tutoringRequestId: 1 }, { sparse: true });

// 对话预处理
ConversationSchema.pre('save', function(next) {
  // 更新时间戳
  this.updatedAt = Date.now();
  next();
});

// 静态方法：获取用户的所有对话
ConversationSchema.statics.getUserConversations = async function(userId, status = 'active') {
  return await this.find({
    participants: userId,
    status
  })
  .sort({ lastActivityAt: -1 })
  .populate('participants', 'username avatar role')
  .exec();
};

// 静态方法：获取或创建两个用户之间的对话
ConversationSchema.statics.getOrCreateConversation = async function(user1Id, user2Id, type = 'general', title = '') {
  // 查找现有对话
  let conversation = await this.findOne({
    participants: { $all: [user1Id, user2Id] },
    type,
    status: 'active'
  });
  
  // 如果不存在，创建新对话
  if (!conversation) {
    conversation = await this.create({
      participants: [user1Id, user2Id],
      type,
      title,
      lastActivityAt: Date.now()
    });
  }
  
  return conversation;
};

// 静态方法：更新最后一条消息预览
ConversationSchema.statics.updateLastMessage = async function(conversationId, messagePreview) {
  return await this.findByIdAndUpdate(
    conversationId,
    { 
      $set: { 
        lastMessagePreview: messagePreview,
        lastActivityAt: Date.now()
      } 
    },
    { new: true }
  );
};

const Conversation = mongoose.model('Conversation', ConversationSchema);

module.exports = Conversation;
