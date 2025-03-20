/**
 * 教师资料模型
 * 定义教师的详细信息、教学经验、时间安排和评价等
 */

// 导入 Mongoose 库和 Schema 构造函数
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * 成功案例模式
 * 用于记录教师的成功教学案例
 * @typedef {Object} SuccessCaseSchema
 */
const successCaseSchema = new Schema({
  /** 案例描述 - 详细说明教学成果 @type {String} */
  description: String,

  /** 提升程度 - 学生成绩提升百分比 @type {Number} */
  improvement: Number,

  /** 教学时长 - 该案例的教学周期(周) @type {Number} */
  duration: Number,
});

/**
 * 科目模式
 * 定义教师教授的科目信息和相关经验
 * @typedef {Object} SubjectSchema
 */
const subjectSchema = new Schema({
  /** 科目名称 - 如数学、物理、化学等 @type {String} */
  name: String,

  /** 适用年级 - 如小学、初中、高中等 @type {String[]} */
  grades: [String],

  /** 科目教龄 - 该科目的教学年限 @type {Number} */
  experience: Number,

  /** 成功案例列表 - 该科目的成功教学案例 @type {SuccessCaseSchema[]} */
  successCases: [successCaseSchema],
});

/**
 * 教学时段模式
 * 定义教师的可教学时间段和状态
 * @typedef {Object} SessionSchema
 */
const sessionSchema = new Schema({
  /**
   * 教学日期
   * 指定可教学的周几
   * @type {String}
   */
  day: {
    type: String,
    enum: ['周六', '周日'], // 限定只能选择周六或周日
    required: true,
  },

  /**
   * 时间段
   * 指定一天中的时间段
   * @type {String}
   */
  period: {
    type: String,
    enum: ['早上', '下午', '晚上'], // 限定只能选择早上、下午或晚上
    required: true,
  },

  /**
   * 是否可用
   * 标记该时间段是否可预约
   * @type {Boolean}
   */
  available: {
    type: Boolean,
    default: true, // 默认为可用
  },
  /**
   * 时间段详细信息
   * 定义开始和结束时间
   * @type {Object}
   */
  timeSlot: {
    /**
     * 开始时间
     * 格式为 HH:MM，24小时制
     * @type {String}
     */
    startTime: {
      type: String,
      required: true,
      validate: {
        validator: function (v) {
          return /^([01]\d|2[0-3]):([0-5]\d)$/.test(v); // 验证时间格式
        },
        message: '时间格式应为 HH:MM',
      },
    },

    /**
     * 结束时间
     * 格式为 HH:MM，24小时制
     * @type {String}
     */
    endTime: {
      type: String,
      required: true,
      validate: {
        validator: function (v) {
          return /^([01]\d|2[0-3]):([0-5]\d)$/.test(v); // 验证时间格式
        },
        message: '时间格式应为 HH:MM',
      },
    },
  },
  /**
   * 课程时长
   * 每节课的持续时间，单位为分钟
   * @type {Number}
   */
  duration: {
    type: Number,
    required: true,
    default: 120, // 默认为120分钟（2小时）
  },

  /**
   * 时间段状态
   * 标记该时间段的当前状态
   * @type {String}
   */
  status: {
    type: String,
    enum: ['available', 'booked', 'blocked'], // 可预约、已预约、已屏蔽
    default: 'available', // 默认为可预约
  },
});

/**
 * 教师资料模式
 * 定义教师的完整信息和属性
 * @typedef {Object} TutorProfileSchema
 */
const TutorProfileSchema = new Schema({
  /**
   * 是否已验证
   * 标识教师资料是否已经过管理员验证
   * @type {Boolean}
   */
  isVerified: {
    type: Boolean,
    default: false
  },

  /**
   * 验证时间
   * 记录教师资料被验证的时间
   * @type {Date}
   */
  verifiedAt: Date,

  /**
   * 教师状态
   * 标识教师账号的当前状态
   * @type {String}
   */
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },

  /**
   * 教师自定义ID
   * 格式为 TUTOR_加上14位时间戳
   * @type {String}
   */
  tutorId: {
    type: String,
    required: true,
    unique: true, // 确保唯一性
    match: /^TUTOR_\d{14}$/, // 验证格式
    index: true, // 创建索引提高查询效率
  },

  /**
   * 关联的用户ID
   * 关联到 User 模型，建立教师资料与用户账号的关系
   * @type {mongoose.Schema.Types.ObjectId}
   */
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // 引用 User 模型
    required: true,
  },
  /** 名 - 教师的名字 @type {String} */
  firstName: String,

  /** 姓 - 教师的姓氏 @type {String} */
  lastName: String,

  /** 性别 - 教师的性别，男/女 @type {String} */
  gender: String,
  /**
   * 教育背景
   * 教师的学历和教育信息
   * @type {Object}
   */
  education: {
    /** 学历级别 - 如985/211/一本/二本/其他 @type {String} */
    level: String,

    /** 毕业院校 - 教师的毕业学校 @type {String} */
    school: String,

    /** 专业 - 教师的专业背景 @type {String} */
    major: String,

    /** 毕业年份 - 教师的毕业年份 @type {Number} */
    graduationYear: Number,
  },
  /**
   * 教学经验
   * 教师的教学年限和教授科目
   * @type {Object}
   */
  teachingExperience: {
    /** 教龄 - 教师的总教学年限 @type {Number} */
    years: Number,

    /** 教授科目 - 教师可教授的科目列表 @type {SubjectSchema[]} */
    subjects: [subjectSchema],
  },
  /**
   * 当前接单状态
   * 标记教师当前是否可以接受新的教学请求
   * @type {String}
   */
  availabilityStatus: {
    type: String,
    enum: ['available', 'busy', 'offline'], // 可接单、繁忙、离线
    default: 'available', // 默认为可接单
  },
  /**
   * 教师时间表
   * 定义教师的可教学时间安排
   * @type {Object}
   */
  schedule: {
    /**
     * 周末时间安排
     * 定义周六和周日的教学时间
     * @type {Object}
     */
    weekend: {
      /** 教学时段列表 - 所有可教学的时间段 @type {SessionSchema[]} */
      sessions: [sessionSchema],

      /**
       * 默认时间设置
       * 各个时间段的默认开始和结束时间
       * @type {Object}
       */
      defaultTimes: {
        /**
         * 早上时间段默认设置
         * @type {Object}
         */
        早上: {
          /** 默认开始时间 @type {String} */
          startTime: {
            type: String,
            default: '09:00', // 默认为上午9点
          },
          /** 默认结束时间 @type {String} */
          endTime: {
            type: String,
            default: '12:00', // 默认为中午12点
          },
        },

        /**
         * 下午时间段默认设置
         * @type {Object}
         */
        下午: {
          /** 默认开始时间 @type {String} */
          startTime: {
            type: String,
            default: '14:00', // 默认为下午2点
          },
          /** 默认结束时间 @type {String} */
          endTime: {
            type: String,
            default: '17:00', // 默认为下午5点
          },
        },

        /**
         * 晚上时间段默认设置
         * @type {Object}
         */
        晚上: {
          /** 默认开始时间 @type {String} */
          startTime: {
            type: String,
            default: '19:00', // 默认为晚上7点
          },
          /** 默认结束时间 @type {String} */
          endTime: {
            type: String,
            default: '21:00', // 默认为晚上9点
          },
        },
      },
    },
  },
  /**
   * 教师位置信息
   * 定义教师的地理位置信息
   * @type {Object}
   */
  location: {
    /** 详细地址 - 教师的具体地址 @type {String} */
    address: String,

    /** 区域 - 教师所在的区域/区县 @type {String} */
    district: String,

    /** 城市 - 教师所在的城市 @type {String} */
    city: String,

    /**
     * 地理坐标信息
     * 使用 GeoJSON 格式存储坐标信息，用于地理位置查询
     * @type {Object}
     */
    geo: {
      /** 坐标类型 - GeoJSON 类型，固定为 Point @type {String} */
      type: {
        type: String,
        enum: ['Point'], // 限定只能是点类型
        default: 'Point',
      },

      /**
       * 坐标数组 - [经度, 纬度]
       * @type {Number[]}
       */
      coordinates: {
        type: [Number],
        required: true,
        validate: {
          validator: function (v) {
            // 验证经度在 -180 到 180 之间，纬度在 -90 到 90 之间
            return v[0] >= -180 && v[0] <= 180 && v[1] >= -90 && v[1] <= 90;
          },
          message: '无效的坐标范围',
        },
      },
    },
  },
  /**
   * 价格设置
   * 教师的教学费用信息
   * @type {Object}
   */
  pricing: {
    /** 基础价格 - 每小时的教学费用（元） @type {Number} */
    basePrice: Number,
  },
  /**
   * 教学风格
   * 教师的教学方法和特点
   * @type {Object}
   */
  teachingStyle: {
    /** 风格描述 - 教师教学风格的详细描述 @type {String} */
    description: String,

    /** 关键词标签 - 用于描述教学风格的关键词 @type {String[]} */
    keywords: [String],

    /** 教学特长 - 教师的教学优势和特长 @type {String[]} */
    strengths: [String],
  },
  /**
   * 多维度评分
   * 家长对教师的各方面评分
   * @type {Object}
   */
  ratings: {
    /**
     * 总体评分
     * 教师的总体评价分数
     * @type {Number}
     */
    overall: {
      type: Number,
      default: 0, // 默认为0，表示暂无评分
    },

    /**
     * 教学质量评分
     * 评估教师的教学水平和质量
     * @type {Number}
     */
    teachingQuality: {
      type: Number,
      default: 0,
    },

    /**
     * 教学态度评分
     * 评估教师的教学态度和耐心程度
     * @type {Number}
     */
    attitude: {
      type: Number,
      default: 0,
    },

    /**
     * 准时性评分
     * 评估教师的时间规划和准时程度
     * @type {Number}
     */
    punctuality: {
      type: Number,
      default: 0,
    },

    /**
     * 沟通能力评分
     * 评估教师与学生和家长的沟通效果
     * @type {Number}
     */
    communication: {
      type: Number,
      default: 0,
    },

    /**
     * 教学效果评分
     * 评估教师的教学成果和效果
     * @type {Number}
     */
    effectiveness: {
      type: Number,
      default: 0,
    },
  },
  /**
   * 统计数据
   * 教师的教学统计信息
   * @type {Object}
   */
  statistics: {
    /**
     * 总学生数
     * 教师教过的学生总数
     * @type {Number}
     */
    totalStudents: {
      type: Number,
      default: 0,
    },

    /**
     * 总课程数
     * 教师教过的课程总数
     * @type {Number}
     */
    totalClasses: {
      type: Number,
      default: 0,
    },

    /**
     * 课程完成率
     * 教师成功完成的课程比例
     * @type {Number}
     */
    completionRate: {
      type: Number,
      default: 0,
    },

    /**
     * 重复预约率
     * 学生再次选择该教师的比例
     * @type {Number}
     */
    repeatRate: {
      type: Number,
      default: 0,
    },
  },
  /**
   * 创建时间
   * 教师资料的创建时间
   * @type {Date}
   */
  createdAt: {
    type: Date,
    default: Date.now, // 默认为当前时间
  },

  /**
   * 更新时间
   * 教师资料的最后更新时间
   * @type {Date}
   */
  updatedAt: {
    type: Date,
    default: Date.now, // 默认为当前时间
  },
});

/**
 * 添加文档保存前的中间件
 * 自动更新 updatedAt 字段
 */
TutorProfileSchema.pre('save', function (next) {
  // 如果文档被修改了，更新 updatedAt 字段
  if (this.isModified()) {
    this.updatedAt = new Date();
  }
  next();
});

/**
 * 创建数据库索引
 * 用于提高查询性能
 */
// 用户ID索引，用于快速查找用户关联的教师资料
TutorProfileSchema.index({ userId: 1 });

// 科目名称索引，用于按科目查询教师
TutorProfileSchema.index({ 'teachingExperience.subjects.name': 1 });

// 坐标索引，用于地理位置查询
TutorProfileSchema.index({ 'location.coordinates': '2dsphere' });

// 地理空间索引，用于按距离查询教师
TutorProfileSchema.index({ 'location.geo': '2dsphere' });

/**
 * 导出教师资料模型
 * @type {mongoose.Model}
 */
module.exports = mongoose.model('TutorProfile', TutorProfileSchema);
