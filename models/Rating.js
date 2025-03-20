/**
 * 评价系统模型
 * 定义多维度的教学评价系统，包括教学质量、课堂表现、学生进步程度等
 * @module models/Rating
 */

const mongoose = require('mongoose');

/**
 * 评价模式
 * @typedef {Object} RatingSchema
 */
const ratingSchema = new mongoose.Schema({
  /**
   * 关联的匹配ID
   * 标识该评价属于哪个匹配关系
   * @type {mongoose.Schema.Types.ObjectId}
   */
  matchId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Match'
  },
  
  /**
   * 评价者ID
   * 发起评价的用户ID（可能是家长或教师）
   * @type {String}
   */
  ratedBy: {
    type: String,
    required: true
  },
  
  /**
   * 评价者类型
   * 标识评价者是家长还是教师
   * @type {String}
   */
  raterType: {
    type: String,
    enum: ['parent', 'tutor'],
    required: true
  },
  
  /**
   * 被评价者ID
   * 被评价的用户ID（可能是家长或教师）
   * @type {String}
   */
  ratedUser: {
    type: String,
    required: true
  },
  
  /**
   * 总体评分
   * 对整体服务的评分
   * @type {Number}
   */
  overallRating: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  
  /**
   * 教学质量评分
   * 评价教师的教学质量（仅当评价对象为教师时适用）
   * @type {Number}
   */
  teachingQuality: {
    type: Number,
    min: 1,
    max: 5
  },
  
  /**
   * 课堂表现评分
   * 评价教师的课堂表现或学生的课堂表现
   * @type {Number}
   */
  classroomPerformance: {
    type: Number,
    min: 1,
    max: 5
  },
  
  /**
   * 学生进步程度评分
   * 评价学生在教师辅导下的进步程度（仅当评价对象为教师时适用）
   * @type {Number}
   */
  studentProgress: {
    type: Number,
    min: 1,
    max: 5
  },
  
  /**
   * 沟通能力评分
   * 评价用户的沟通能力
   * @type {Number}
   */
  communication: {
    type: Number,
    min: 1,
    max: 5
  },
  
  /**
   * 准时率评分
   * 评价用户的准时情况
   * @type {Number}
   */
  punctuality: {
    type: Number,
    min: 1,
    max: 5
  },
  
  /**
   * 文字评价
   * 详细的文字评价内容
   * @type {String}
   */
  reviewText: {
    type: String,
    maxlength: 1000
  },
  
  /**
   * 标签
   * 评价标签，如"耐心", "专业", "有趣"等
   * @type {Array}
   */
  tags: [{
    type: String
  }],
  
  /**
   * 创建时间
   * 记录评价创建的时间
   * @type {Date}
   */
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  /**
   * 更新时间
   * 记录评价最后更新的时间
   * @type {Date}
   */
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

/**
 * 导出评价模型
 * @type {mongoose.Model}
 */
const Rating = mongoose.model('Rating', ratingSchema);

module.exports = Rating;
