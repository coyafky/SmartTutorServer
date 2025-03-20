/**
 * 系统设置模型
 * 定义系统全局配置信息，包括站点信息、内容审核设置等
 * @module models/Settings
 */

const mongoose = require('mongoose');

/**
 * 系统设置模式
 * @typedef {Object} SettingsSchema
 */
const settingsSchema = new mongoose.Schema({
  /**
   * 站点名称
   * @type {String}
   */
  siteName: {
    type: String,
    default: '智能家教推荐系统'
  },
  
  /**
   * 站点Logo URL
   * @type {String}
   */
  logo: String,
  
  /**
   * 联系邮箱
   * @type {String}
   */
  contactEmail: String,
  
  /**
   * 联系电话
   * @type {String}
   */
  contactPhone: String,
  
  /**
   * 关于我们内容
   * @type {String}
   */
  aboutUs: String,
  
  /**
   * 服务条款内容
   * @type {String}
   */
  termsOfService: String,
  
  /**
   * 隐私政策内容
   * @type {String}
   */
  privacyPolicy: String,
  
  /**
   * 是否需要帖子审核
   * @type {Boolean}
   */
  requirePostApproval: {
    type: Boolean,
    default: true
  },
  
  /**
   * 是否需要教师验证
   * @type {Boolean}
   */
  requireTutorVerification: {
    type: Boolean,
    default: true
  },
  
  /**
   * 帖子被举报多少次后自动隐藏
   * @type {Number}
   */
  maxReportsBeforeHide: {
    type: Number,
    default: 3
  },
  
  /**
   * 最后更新时间
   * @type {Date}
   */
  updatedAt: {
    type: Date,
    default: Date.now
  },
  
  /**
   * 最后更新人ID
   * @type {String}
   */
  updatedBy: String
});

/**
 * 导出系统设置模型
 * @type {mongoose.Model}
 */
const Settings = mongoose.model('Settings', settingsSchema);

module.exports = Settings;
