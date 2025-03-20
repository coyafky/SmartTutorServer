/**
 * 匹配模型
 * 定义家长与教师之间的匹配关系，包括匹配状态、评价等信息
 * @module models/Match
 */

const mongoose = require('mongoose');

/**
 * 匹配模式
 * @typedef {Object} MatchSchema
 */
const matchSchema = new mongoose.Schema({
  /**
   * 匹配ID
   * 系统生成的唯一匹配标识
   * @type {String}
   */
  matchId: {
    type: String,
    required: true,
    unique: true
  },
  
  /**
   * 家长ID
   * 发起匹配的家长用户ID
   * @type {String}
   */
  parentId: {
    type: String,
    required: true,
    ref: 'Parent'
  },
  
  /**
   * 教师ID
   * 被匹配的教师用户ID
   * @type {String}
   */
  tutorId: {
    type: String,
    required: true,
    ref: 'TutorProfile'
  },
  
  /**
   * 需求ID
   * 关联的家教需求ID
   * @type {mongoose.Schema.Types.ObjectId}
   */
  requestId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'TutoringRequest'
  },
  
  /**
   * 匹配状态
   * 标识当前匹配的状态
   * @type {String}
   */
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'completed', 'cancelled'],
    default: 'pending'
  },
  
  /**
   * 家长评分
   * 家长对教师的评分
   * @type {Number}
   */
  parentRating: {
    type: Number,
    min: 1,
    max: 5
  },
  
  /**
   * 家长评价
   * 家长对教师的文字评价
   * @type {String}
   */
  parentReview: String,
  
  /**
   * 教师评分
   * 教师对家长的评分
   * @type {Number}
   */
  tutorRating: {
    type: Number,
    min: 1,
    max: 5
  },
  
  /**
   * 教师评价
   * 教师对家长的文字评价
   * @type {String}
   */
  tutorReview: String,
  
  /**
   * 创建时间
   * 记录匹配创建的时间
   * @type {Date}
   */
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  /**
   * 更新时间
   * 记录匹配最后更新的时间
   * @type {Date}
   */
  updatedAt: {
    type: Date,
    default: Date.now
  },
  
  /**
   * 完成时间
   * 记录匹配完成的时间
   * @type {Date}
   */
  completedAt: Date,
  
  /**
   * 取消时间
   * 记录匹配取消的时间
   * @type {Date}
   */
  cancelledAt: Date,
  
  /**
   * 取消原因
   * 记录匹配取消的原因
   * @type {String}
   */
  cancelReason: String
});

/**
 * 导出匹配模型
 * @type {mongoose.Model}
 */
const Match = mongoose.model('Match', matchSchema);

module.exports = Match;
