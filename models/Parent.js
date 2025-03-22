/**
 * 家长模型
 * 定义家长用户的信息、孩子信息和教学偏好
 */

// 导入 Mongoose 库和 Schema 构造函数
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * 孩子信息模式
 * 定义家长的孩子信息和学习情况
 * @typedef {Object} ChildSchema
 */
const ChildSchema = new Schema({
  /**
   * 孩子ID
   * 格式为 CHILD_父母ID(去除PARENT)_序号，例如 CHILD_20250320025248_01
   * @type {String}
   */
  childId: {
    type: String,
    default: function () {
      // 默认值将在 ChildProfileService 中设置
      return undefined;
    },
    required: true,
    match: /^CHILD_\d{14}_\d{2}$/, // 验证格式
    index: true, // 创建索引提高查询效率
  },
  /**
   * 孩子昵称
   * 用于标识孩子的昵称
   * @type {String}
   */
  nickname: {
    type: String,
    required: true, // 必填字段
    trim: true, // 自动去除前后空格
  },
  /**
   * 孩子年级
   * 定义孩子当前的学习年级
   * @type {String}
   */
  grade: {
    type: String,
    enum: [
      '小学一年级',
      '小学二年级',
      '小学三年级',
      '小学四年级',
      '小学五年级',
      '小学六年级',
      '初中一年级',
      '初中二年级',
      '初中三年级',
      '高中一年级',
      '高中二年级',
      '高中三年级',
    ],
    required: true, // 必填字段
  },
  /**
   * 孩子学习科目列表
   * 定义孩子需要辅导的科目和相关信息
   * @type {Array}
   */
  subjects: [
    {
      /**
       * 科目名称
       * 如数学、英语、物理等
       * @type {String}
       */
      name: {
        type: String,
        required: true, // 必填字段
      },

      /**
       * 当前成绩
       * 孩子在该科目上的当前成绩
       * @type {String}
       */
      currentScore: String,

      /**
       * 目标成绩
       * 家长期望孩子达到的成绩
       * @type {String}
       */
      targetScore: String,

      /**
       * 难度级别
       * 孩子学习该科目的难度评估
       * @type {String}
       */
      difficulty: {
        type: String,
        enum: ['简单', '中等', '困难'], // 限定可选值
      },
    },
  ],
});

/**
 * 家长模式
 * 定义家长用户的完整信息和偏好
 * @typedef {Object} ParentSchema
 */
const ParentSchema = new Schema(
  {
    /**
     * 家长自定义ID
     * 格式为 PARENT_加上14位时间戳
     * @type {String}
     */
    parentId: {
      type: String,
      required: true,
      unique: true, // 确保唯一性
      match: /^PARENT_\d{14}$/, // 验证格式
      index: true, // 创建索引提高查询效率
    },
    /**
     * 家长昵称
     * 家长的昵称或称呼
     * @type {String}
     */
    nickname: {
      type: String,
      required: true, // 必填字段
      trim: true, // 自动去除前后空格
    },
    /**
     * 家长位置信息
     * 定义家长的地理位置信息
     * @type {Object}
     */
    location: {
      /**
       * 区域
       * 家长所在的区域/区县
       * @type {String}
       */
      district: {
        type: String,
        required: true, // 必填字段
      },

      /**
       * 城市
       * 家长所在的城市
       * @type {String}
       */
      city: {
        type: String,
        required: true, // 必填字段
      },

      /**
       * 地理坐标信息
       * 使用 GeoJSON 格式存储坐标信息，用于地理位置查询
       * @type {Object}
       */
      coordinates: {
        /**
         * 坐标类型
         * GeoJSON 类型，固定为 Point
         * @type {String}
         */
        type: {
          type: String,
          enum: ['Point'], // 限定只能是点类型
          default: 'Point',
        },

        /**
         * 坐标数组
         * [经度, 纬度]
         * @type {Number[]}
         */
        coordinates: {
          type: [Number],
          validate: {
            validator: function (v) {
              // 如果没有提供坐标，则跳过验证
              if (!v || v.length === 0) return true;
              // 验证经度在 -180 到 180 之间，纬度在 -90 到 90 之间
              return (
                v.length === 2 &&
                v[0] >= -180 &&
                v[0] <= 180 &&
                v[1] >= -90 &&
                v[1] <= 90
              );
            },
            message: '无效的坐标范围',
          },
        },
      },
    },
    /**
     * 孩子信息列表
     * 家长的孩子信息集合
     * @type {ChildSchema[]}
     */
    children: [ChildSchema],
    /**
     * 家长偏好设置
     * 定义家长对教学的偏好和要求
     * @type {Object}
     */
    preferences: {
      /**
       * 教学地点
       * 家长期望的教学地点
       * @type {String}
       */
      teachingLocation: {
        type: String,
        enum: ['家里', '教师家', '其他'], // 限定可选值
        default: '家里', // 默认值
      },

      /**
       * 教师性别偏好
       * 家长对教师性别的偏好
       * @type {String}
       */
      teacherGender: {
        type: String,
        enum: ['男', '女', '不限'], // 限定可选值
        default: '不限', // 默认不限制性别
      },

      /**
       * 教学风格偏好
       * 家长期望的教学风格特点
       * @type {String[]}
       */
      teachingStyle: [
        {
          type: String,
        },
      ],

      /**
       * 预算设置
       * 家长的教学预算范围
       * @type {Object}
       */
      budget: {
        /**
         * 最低预算
         * 家长能接受的最低价格
         * @type {Number}
         */
        min: {
          type: Number,
          default: 100, // 默认最低预算
        },

        /**
         * 最高预算
         * 家长能接受的最高价格
         * @type {Number}
         */
        max: {
          type: Number,
          default: 300, // 默认最高预算
        },

        /**
         * 计费周期
         * 价格的计算单位
         * @type {String}
         */
        period: {
          type: String,
          enum: ['per_hour', 'per_session'], // 按小时或按课时计费
          default: 'per_hour', // 默认按小时计费
        },
      },
    },
    /**
     * 统计数据
     * 家长的使用统计信息
     * @type {Object}
     */
    statistics: {
      /**
       * 发布需求总数
       * 家长发布的教学需求总数
       * @type {Number}
       */
      totalPosts: {
        type: Number,
        default: 0, // 默认值为0
      },

      /**
       * 合作教师总数
       * 家长合作过的教师总数
       * @type {Number}
       */
      totalTeachers: {
        type: Number,
        default: 0, // 默认值为0
      },

      /**
       * 总课程数
       * 家长预约的课程总数
       * @type {Number}
       */
      totalClasses: {
        type: Number,
        default: 0, // 默认值为0
      },

      /**
       * 总消费金额
       * 家长在平台上的总消费金额
       * @type {Number}
       */
      totalSpent: {
        type: Number,
        default: 0, // 默认值为0
      },
    },
    /**
     * 账号状态
     * 家长账号的当前状态
     * @type {String}
     */
    status: {
      type: String,
      enum: ['active', 'inactive'], // 活跃或非活跃
      default: 'active', // 默认为活跃状态
    },
  },
  {
    /**
     * 模式配置选项
     * @property {Boolean} timestamps - 自动添加 createdAt 和 updatedAt 字段
     */
    timestamps: true, // 自动管理创建时间和更新时间
  }
);

/**
 * 添加文档保存前的中间件
 * 在每次修改时执行自定义逻辑
 */
ParentSchema.pre('save', function (next) {
  // 在这里可以添加保存前的逻辑，如数据验证、转换等
  next();
});

/**
 * 创建地理位置索引
 * 用于地理位置查询，如按距离查找附近的家长
 */
ParentSchema.index({ 'location.coordinates': '2dsphere' });

/**
 * 导出家长模型
 * @type {mongoose.Model}
 */
module.exports = mongoose.model('Parent', ParentSchema);
