/**
 * 课程模型
 * 用于存储家教课程信息
 * 结合家长和教师模型的信息
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * 课程材料模式
 * 用于存储课程相关的教学资料
 * @typedef {Object} MaterialSchema
 */
const MaterialSchema = new Schema({
  /**
   * 材料标题
   * @type {String}
   */
  title: {
    type: String,
    required: true,
    trim: true
  },
  
  /**
   * 材料描述
   * @type {String}
   */
  description: {
    type: String,
    trim: true
  },
  
  /**
   * 文件类型
   * @type {String}
   */
  fileType: {
    type: String,
    enum: ['document', 'image', 'video', 'audio', 'other'],
    default: 'document'
  },
  
  /**
   * 文件URL
   * @type {String}
   */
  fileUrl: {
    type: String,
    required: true
  },
  
  /**
   * 上传时间
   * @type {Date}
   */
  uploadedAt: {
    type: Date,
    default: Date.now
  },
  
  /**
   * 上传者ID
   * @type {Schema.Types.ObjectId}
   */
  uploadedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

/**
 * 提醒模式
 * 用于设置课程提醒
 * @typedef {Object} ReminderSchema
 */
const ReminderSchema = new Schema({
  /**
   * 提醒时间
   * @type {Date}
   */
  time: {
    type: Date,
    required: true
  },
  
  /**
   * 提醒类型
   * @type {String}
   */
  type: {
    type: String,
    enum: ['before_24h', 'before_1h', 'custom'],
    default: 'before_24h'
  },
  
  /**
   * 提醒消息
   * @type {String}
   */
  message: {
    type: String,
    default: '您有一节课程即将开始'
  },
  
  /**
   * 是否已发送
   * @type {Boolean}
   */
  sent: {
    type: Boolean,
    default: false
  },
  
  /**
   * 发送时间
   * @type {Date}
   */
  sentAt: Date
});

/**
 * 课程模式
 * 定义家教课程的完整信息
 * @typedef {Object} LessonSchema
 */
const LessonSchema = new Schema({
  /**
   * 课程标题
   * 课程的名称或标题
   * @type {String}
   */
  title: {
    type: String,
    required: true,
    trim: true
  },
  
  /**
   * 课程描述
   * 课程的详细描述和内容概述
   * @type {String}
   */
  description: {
    type: String,
    trim: true
  },
  
  /**
   * 课程编号
   * 自动生成的课程编号，格式为 LESSON_加上14位时间戳
   * @type {String}
   */
  lessonId: {
    type: String,
    unique: true,
    default: () => `LESSON_${Date.now()}`
  },
  
  /**
   * 学科
   * 课程所属的学科类别
   * @type {String}
   */
  subject: {
    type: String,
    required: true
  },
  
  /**
   * 年级
   * 课程适用的年级
   * @type {String}
   */
  grade: {
    type: String,
    enum: [
      '小学一年级', '小学二年级', '小学三年级', '小学四年级', '小学五年级', '小学六年级',
      '初中一年级', '初中二年级', '初中三年级',
      '高中一年级', '高中二年级', '高中三年级'
    ],
    required: true
  },
  
  /**
   * 教师ID
   * 关联到教师用户
   * @type {Schema.Types.ObjectId}
   */
  tutorId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  /**
   * 教师资料ID
   * 关联到教师资料
   * @type {String}
   */
  tutorProfileId: {
    type: String,
    match: /^TUTOR_\d{14}$/
  },
  
  /**
   * 家长ID
   * 关联到家长用户
   * @type {Schema.Types.ObjectId}
   */
  parentId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  /**
   * 家长资料ID
   * 关联到家长资料
   * @type {String}
   */
  parentProfileId: {
    type: String,
    match: /^PARENT_\d{14}$/
  },
  
  /**
   * 学生信息
   * 学生的详细信息
   * @type {Object}
   */
  student: {
    /**
     * 学生姓名
     * @type {String}
     */
    name: {
      type: String,
      required: true,
      trim: true
    },
    
    /**
     * 学生年龄
     * @type {Number}
     */
    age: {
      type: Number,
      min: 3,
      max: 18
    },
    
    /**
     * 学生年级
     * @type {String}
     */
    grade: {
      type: String,
      enum: [
        '小学一年级', '小学二年级', '小学三年级', '小学四年级', '小学五年级', '小学六年级',
        '初中一年级', '初中二年级', '初中三年级',
        '高中一年级', '高中二年级', '高中三年级'
      ]
    },
    
    /**
     * 当前成绩
     * 学生在该科目的当前成绩
     * @type {String}
     */
    currentScore: String,
    
    /**
     * 目标成绩
     * 期望达到的成绩
     * @type {String}
     */
    targetScore: String,
    
    /**
     * 学习难度
     * 学生学习该科目的难度评估
     * @type {String}
     */
    difficulty: {
      type: String,
      enum: ['简单', '中等', '困难']
    },
    
    /**
     * 学生备注
     * 关于学生的特殊情况或要求
     * @type {String}
     */
    notes: String
  },
  
  /**
   * 课程日期
   * 课程安排的日期
   * @type {Date}
   */
  date: {
    type: Date,
    required: true
  },
  
  /**
   * 开始时间
   * 课程开始的时间，格式为 HH:MM，24小时制
   * @type {String}
   */
  startTime: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /^([01]\d|2[0-3]):([0-5]\d)$/.test(v); // 验证时间格式
      },
      message: '时间格式应为 HH:MM'
    }
  },
  
  /**
   * 结束时间
   * 课程结束的时间，格式为 HH:MM，24小时制
   * @type {String}
   */
  endTime: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /^([01]\d|2[0-3]):([0-5]\d)$/.test(v); // 验证时间格式
      },
      message: '时间格式应为 HH:MM'
    }
  },
  
  /**
   * 课程时长
   * 课程的持续时间，单位为分钟
   * @type {Number}
   */
  duration: {
    type: Number,
    min: 30,
    max: 240,
    default: 120 // 默认为120分钟（2小时）
  },
  
  /**
   * 授课地点
   * 课程进行的地点
   * @type {Object}
   */
  location: {
    /**
     * 地点类型
     * @type {String}
     */
    type: {
      type: String,
      enum: ['家里', '教师家', '其他', '线上'],
      default: '线上'
    },
    
    /**
     * 地址详情
     * @type {String}
     */
    address: String,
    
    /**
     * 区域
     * @type {String}
     */
    district: String,
    
    /**
     * 城市
     * @type {String}
     */
    city: String,
    
    /**
     * 地理坐标
     * @type {Object}
     */
    coordinates: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number],
        validate: {
          validator: function(v) {
            if (!v || v.length === 0) return true;
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
   * 授课模式
   * 课程的授课方式
   * @type {String}
   */
  mode: {
    type: String,
    enum: ['online', 'offline'],
    default: 'online'
  },
  
  /**
   * 课程状态
   * 课程的当前状态
   * @type {String}
   */
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed', 'rescheduled'],
    default: 'pending'
  },
  
  /**
   * 课程费用
   * 课程的费用信息
   * @type {Object}
   */
  fee: {
    /**
     * 费用金额
     * @type {Number}
     */
    amount: {
      type: Number,
      default: 0
    },
    
    /**
     * 计费周期
     * @type {String}
     */
    period: {
      type: String,
      enum: ['per_hour', 'per_session'],
      default: 'per_hour'
    },
    
    /**
     * 支付状态
     * @type {String}
     */
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'paid', 'refunded'],
      default: 'unpaid'
    },
    
    /**
     * 支付时间
     * @type {Date}
     */
    paidAt: Date
  },
  
  /**
   * 课程材料/资源
   * 课程相关的教学资料
   * @type {MaterialSchema[]}
   */
  materials: [MaterialSchema],
  
  /**
   * 课程笔记
   * 教师对课程的记录和笔记
   * @type {String}
   */
  notes: {
    type: String,
    trim: true
  },
  
  /**
   * 关联的消息ID
   * 用于追踪课程创建和变更的消息
   * @type {Schema.Types.ObjectId[]}
   */
  relatedMessageIds: [{
    type: Schema.Types.ObjectId,
    ref: 'Message'
  }],
  
  /**
   * 提醒设置
   * 课程相关的提醒配置
   * @type {ReminderSchema[]}
   */
  reminders: [ReminderSchema],
  
  /**
   * 作业列表
   * 课程相关的作业
   * @type {Schema.Types.ObjectId[]}
   */
  homeworks: [{
    type: Schema.Types.ObjectId,
    ref: 'Homework'
  }],
  
  /**
   * 评价
   * 课程结束后的评价信息
   * @type {Object}
   */
  rating: {
    /**
     * 家长评分
     * 家长对课程的评分
     * @type {Number}
     */
    parentRating: {
      type: Number,
      min: 1,
      max: 5
    },
    
    /**
     * 家长评价
     * 家长对课程的评价内容
     * @type {String}
     */
    parentComment: String,
    
    /**
     * 教师评分
     * 教师对学生的评分
     * @type {Number}
     */
    tutorRating: {
      type: Number,
      min: 1,
      max: 5
    },
    
    /**
     * 教师评价
     * 教师对学生的评价
     * @type {String}
     */
    tutorComment: String,
    
    /**
     * 评价时间
     * @type {Date}
     */
    ratedAt: Date
  },
  
  /**
   * 创建时间
   * 课程创建的时间
   * @type {Date}
   */
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  /**
   * 更新时间
   * 课程最后更新的时间
   * @type {Date}
   */
  updatedAt: {
    type: Date,
    default: Date.now
  },
  
  /**
   * 创建者
   * 课程创建者的ID
   * @type {Schema.Types.ObjectId}
   */
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
});

/**
 * 中间件：更新时自动更新updatedAt字段
 */
LessonSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

/**
 * 中间件：创建课程时自动设置创建者
 */
LessonSchema.pre('save', function(next) {
  if (this.isNew && !this.createdBy) {
    // 如果是教师创建的课程，设置创建者为教师
    // 如果是家长创建的课程，设置创建者为家长
    this.createdBy = this.tutorId || this.parentId;
  }
  next();
});

/**
 * 静态方法：获取用户的所有课程
 * 根据用户角色（教师或家长）获取相关课程
 * @param {ObjectId} userId - 用户ID
 * @param {String} role - 用户角色（tutor或parent）
 * @param {String} status - 课程状态筛选
 * @param {Date} startDate - 开始日期
 * @param {Date} endDate - 结束日期
 * @returns {Promise<Array>} 课程列表
 */
LessonSchema.statics.getUserLessons = async function(userId, role, status, startDate, endDate) {
  const query = {};
  
  // 根据角色设置查询条件
  if (role === 'tutor') {
    query.tutorId = userId;
  } else if (role === 'parent') {
    query.parentId = userId;
  } else {
    // 如果未指定角色，查询用户作为教师或家长的所有课程
    query.$or = [{ tutorId: userId }, { parentId: userId }];
  }
  
  // 根据状态筛选
  if (status && status !== 'all') {
    query.status = status;
  }
  
  // 根据日期范围筛选
  if (startDate || endDate) {
    query.date = {};
    if (startDate) {
      query.date.$gte = new Date(startDate);
    }
    if (endDate) {
      query.date.$lte = new Date(endDate);
    }
  }
  
  return this.find(query)
    .populate('tutorId', 'username avatar role')
    .populate('parentId', 'username avatar role')
    .populate('createdBy', 'username avatar role')
    .sort({ date: 1, startTime: 1 })
    .exec();
};

/**
 * 静态方法：获取指定日期范围内的课程
 * 用于日历视图和时间表展示
 * @param {ObjectId} userId - 用户ID
 * @param {String} role - 用户角色（tutor或parent）
 * @param {Date} startDate - 开始日期
 * @param {Date} endDate - 结束日期
 * @returns {Promise<Array>} 课程列表
 */
LessonSchema.statics.getLessonsByDateRange = async function(userId, role, startDate, endDate) {
  const query = {};
  
  // 根据角色设置查询条件
  if (role === 'tutor') {
    query.tutorId = userId;
  } else if (role === 'parent') {
    query.parentId = userId;
  } else {
    // 如果未指定角色，查询用户作为教师或家长的所有课程
    query.$or = [{ tutorId: userId }, { parentId: userId }];
  }
  
  // 设置日期范围
  query.date = {
    $gte: new Date(startDate),
    $lte: new Date(endDate)
  };
  
  // 只获取未取消的课程
  query.status = { $ne: 'cancelled' };
  
  return this.find(query)
    .populate('tutorId', 'username avatar role')
    .populate('parentId', 'username avatar role')
    .populate('createdBy', 'username avatar role')
    .sort({ date: 1, startTime: 1 })
    .exec();
};

/**
 * 静态方法：更新课程状态
 * @param {ObjectId} lessonId - 课程ID
 * @param {String} status - 新状态
 * @returns {Promise<Object>} 更新后的课程
 */
LessonSchema.statics.updateStatus = async function(lessonId, status) {
  return this.findByIdAndUpdate(
    lessonId,
    { $set: { status, updatedAt: Date.now() } },
    { new: true }
  ).populate('tutorId', 'username email')
    .populate('parentId', 'username email');
};

/**
 * 静态方法：添加课程材料
 * @param {ObjectId} lessonId - 课程ID
 * @param {Object} material - 材料信息
 * @returns {Promise<Object>} 更新后的课程
 */
LessonSchema.statics.addMaterial = async function(lessonId, material) {
  return this.findByIdAndUpdate(
    lessonId,
    { 
      $push: { materials: material },
      $set: { updatedAt: Date.now() }
    },
    { new: true }
  );
};

/**
 * 静态方法：获取即将到来的课程
 * 用于发送课程提醒
 * @param {Number} hours - 提前多少小时
 * @returns {Promise<Array>} 课程列表
 */
LessonSchema.statics.getUpcomingLessons = async function(hours = 24) {
  const now = new Date();
  const future = new Date(now.getTime() + hours * 60 * 60 * 1000);
  
  return this.find({
    date: { $gte: now, $lte: future },
    status: 'confirmed',
    'reminders.sent': false
  })
    .populate('tutorId', 'username email phone')
    .populate('parentId', 'username email phone')
    .exec();
};

/**
 * 静态方法：添加课程提醒
 * @param {ObjectId} lessonId - 课程ID
 * @param {Object} reminder - 提醒信息
 * @returns {Promise<Object>} 更新后的课程
 */
LessonSchema.statics.addReminder = async function(lessonId, reminder) {
  return this.findByIdAndUpdate(
    lessonId,
    { 
      $push: { reminders: reminder },
      $set: { updatedAt: Date.now() }
    },
    { new: true }
  );
};

/**
 * 静态方法：标记提醒为已发送
 * @param {ObjectId} lessonId - 课程ID
 * @param {ObjectId} reminderId - 提醒ID
 * @returns {Promise<Object>} 更新后的课程
 */
LessonSchema.statics.markReminderSent = async function(lessonId, reminderId) {
  return this.findOneAndUpdate(
    { 
      _id: lessonId,
      'reminders._id': reminderId 
    },
    { 
      $set: { 
        'reminders.$.sent': true,
        'reminders.$.sentAt': Date.now(),
        updatedAt: Date.now() 
      } 
    },
    { new: true }
  );
};

/**
 * 静态方法：添加课程评价
 * @param {ObjectId} lessonId - 课程ID
 * @param {String} role - 评价者角色（parent或tutor）
 * @param {Object} ratingData - 评价数据
 * @returns {Promise<Object>} 更新后的课程
 */
LessonSchema.statics.addRating = async function(lessonId, role, ratingData) {
  const updateData = {};
  
  if (role === 'parent') {
    updateData['rating.parentRating'] = ratingData.rating;
    updateData['rating.parentComment'] = ratingData.comment;
  } else if (role === 'tutor') {
    updateData['rating.tutorRating'] = ratingData.rating;
    updateData['rating.tutorComment'] = ratingData.comment;
  }
  
  updateData['rating.ratedAt'] = Date.now();
  updateData.updatedAt = Date.now();
  
  return this.findByIdAndUpdate(
    lessonId,
    { $set: updateData },
    { new: true }
  );
};

const Lesson = mongoose.model('Lesson', LessonSchema);

module.exports = Lesson;
