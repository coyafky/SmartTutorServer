/**
 * 用户模型
 * 定义系统中的用户实体，包括家长、教师和管理员
 */

// 导入 Mongoose 库和 Schema 构造函数
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * 用户模式定义
 * @typedef {Object} UserSchema
 */
const UserSchema = new Schema({
  /**
   * 自定义用户ID
   * 格式为：角色前缀_14位时间戳，如 TUTOR_20230101120000
   * @type {String}
   */
  customId: {
    type: String,
    required: true,
    unique: true,
    match: /^(TUTOR|PARENT|ADMIN)_\d{14}$/,  // 验证格式
    index: true,  // 创建索引提高查询效率
  },
  /**
   * 用户名
   * 用户登录系统的唯一标识符
   * @type {String}
   */
  username: {
    type: String,
    required: true,
    unique: true,     // 保证用户名唯一
    index: true,      // 创建索引
    trim: true,       // 自动去除空格
    minlength: 3,     // 最小长度限制
    maxlength: 30,    // 最大长度限制
  },
  /**
   * 密码
   * 存储加密后的密码哈希值
   * @type {String}
   */
  password: {
    type: String,
    required: true,
    minlength: 8,     // 密码最小长度要求
    select: false,    // 默认查询不返回密码字段，提高安全性
  },
  /**
   * 用户角色
   * 定义用户在系统中的角色和权限
   * @type {String}
   */
  role: {
    type: String,
    enum: ['parent', 'teacher', 'admin'],  // 限定可选值：家长、教师、管理员
    required: true,
    index: true,  // 创建索引，方便按角色查询
  },
  /**
   * 用户头像
   * 存储用户头像的URL地址
   * @type {String}
   */
  avatar: {
    type: String,
    default: process.env.DEFAULT_AVATAR_URL,  // 使用环境变量中的默认头像
    validate: {
      validator: (v) => /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/.test(v),  // URL格式验证
      message: '无效的URL格式',
    },
  },
  /**
   * 用户状态
   * 标记用户当前的活动状态
   * @type {String}
   */
  status: {
    type: String,
    enum: ['active', 'inactive', 'banned'],  // 活跃、非活跃、已封禁
    default: 'active',  // 默认为活跃状态
    index: true,  // 创建索引，方便按状态查询
  },
  /**
   * 创建时间
   * 记录用户账号的创建时间
   * @type {Date}
   */
  createdAt: {
    type: Date,
    default: Date.now,  // 默认为当前时间
  },
  
  /**
   * 更新时间
   * 记录用户信息的最后更新时间
   * @type {Date}
   */
  updatedAt: {
    type: Date,
    default: Date.now,  // 默认为当前时间
  },
  
  /**
   * 最后登录时间
   * 记录用户最后一次登录系统的时间
   * @type {Date}
   */
  lastLoginAt: Date,
  
  /**
   * 账号验证时间
   * 记录用户账号通过验证的时间
   * @type {Date}
   */
  verifiedAt: Date,
  
  /**
   * 用户位置信息
   * 定义用户的地理位置信息
   * @type {Object}
   */
  location: {
    /**
     * 详细地址
     * 用户的具体地址
     * @type {String}
     */
    address: String,
    
    /**
     * 区域
     * 用户所在的区域/区县
     * @type {String}
     */
    district: String,
    
    /**
     * 城市
     * 用户所在的城市
     * @type {String}
     */
    city: String,
    
    /**
     * 省份
     * 用户所在的省份
     * @type {String}
     */
    province: String,
    
    /**
     * 地理坐标信息
     * 使用 GeoJSON 格式存储坐标信息，用于地理位置查询
     * @type {Object}
     */
    geo: {
      /**
       * 坐标类型
       * GeoJSON 类型，固定为 Point
       * @type {String}
       */
      type: {
        type: String,
        enum: ['Point'],  // 限定只能是点类型
        default: 'Point'
      },
      
      /**
       * 坐标数组
       * [经度, 纬度]
       * @type {Number[]}
       */
      coordinates: {
        type: [Number],
        validate: {
          validator: function(v) {
            // 如果没有提供坐标，则跳过验证
            if (!v || v.length === 0) return true;
            // 验证经度在 -180 到 180 之间，纬度在 -90 到 90 之间
            return v.length === 2 && 
                   v[0] >= -180 && v[0] <= 180 && 
                   v[1] >= -90 && v[1] <= 90;
          },
          message: '无效的坐标范围'
        }
      }
    }
  },
  
  /**
   * 用户常用地址列表
   * 存储用户添加的常用地址
   * @type {Array}
   */
  savedAddresses: [{
    /**
     * 地址名称
     * 如：家、公司、学校等
     * @type {String}
     */
    name: {
      type: String,
      required: true
    },
    
    /**
     * 详细地址
     * 完整的地址信息
     * @type {String}
     */
    address: {
      type: String,
      required: true
    },
    
    /**
     * 区域
     * 地址所在的区域/区县
     * @type {String}
     */
    district: String,
    
    /**
     * 城市
     * 地址所在的城市
     * @type {String}
     */
    city: String,
    
    /**
     * 省份
     * 地址所在的省份
     * @type {String}
     */
    province: String,
    
    /**
     * 地理坐标
     * [经度, 纬度]
     * @type {Number[]}
     */
    coordinates: {
      type: [Number],
      validate: {
        validator: function(v) {
          // 验证经度在 -180 到 180 之间，纬度在 -90 到 90 之间
          return v.length === 2 && 
                 v[0] >= -180 && v[0] <= 180 && 
                 v[1] >= -90 && v[1] <= 90;
        },
        message: '无效的坐标范围'
      }
    },
    
    /**
     * 是否为默认地址
     * @type {Boolean}
     */
    isDefault: {
      type: Boolean,
      default: false
    },
    
    /**
     * 创建时间
     * @type {Date}
     */
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
});

/**
 * 在保存前自动更新 updatedAt 字段
 */
UserSchema.pre('save', function(next) {
  // 如果文档被修改了，更新 updatedAt 字段
  if (this.isModified()) {
    this.updatedAt = new Date();
  }
  next();
});

/**
 * 导出 User 模型
 * @type {mongoose.Model}
 */
module.exports = mongoose.model('User', UserSchema);
