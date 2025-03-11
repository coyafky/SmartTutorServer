const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const successCaseSchema = new Schema({
  description: String, // 案例描述
  improvement: Number, // 提升程度
  duration: Number, // 教学时长
});

const subjectSchema = new Schema({
  name: String, // 科目名称
  grades: [String], // 适用年级
  experience: Number, // 该科目教龄
  successCases: [successCaseSchema],
});

const sessionSchema = new Schema({
  day: {
    type: String,
    enum: ['周六', '周日'],
    required: true,
  },
  period: {
    type: String,
    enum: ['早上', '下午', '晚上'],
    required: true,
  },
  available: {
    type: Boolean,
    default: true,
  },
  timeSlot: {
    startTime: {
      type: String,
      required: true,
      validate: {
        validator: function (v) {
          return /^([01]\d|2[0-3]):([0-5]\d)$/.test(v);
        },
        message: '时间格式应为 HH:MM',
      },
    },
    endTime: {
      type: String,
      required: true,
      validate: {
        validator: function (v) {
          return /^([01]\d|2[0-3]):([0-5]\d)$/.test(v);
        },
        message: '时间格式应为 HH:MM',
      },
    },
  },
  duration: {
    // 课程时长（分钟）
    type: Number,
    required: true,
    default: 120,
  },
  status: {
    type: String,
    enum: ['available', 'booked', 'blocked'],
    default: 'available',
  },
});

const TutorProfileSchema = new Schema({
  tutorId: {
    // 教师自定义ID
    type: String,
    required: true,
    unique: true,
    match: /^TUTOR_\d{14}$/,
    index: true,
  },
  // 修改 userId 字段定义，只保留一种索引定义方式
  // 方法1：只使用 index: true
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  firstName: String, // 名
  lastName: String, // 姓
  gender: String, // 性别：男/女
  education: {
    level: String, // 学历：985/211/一本/二本/其他
    school: String, // 毕业院校
    major: String, // 专业
    graduationYear: Number, // 毕业年份
  },
  teachingExperience: {
    years: Number, // 教龄
    subjects: [subjectSchema], // 教授科目
  },
  availabilityStatus: {
    // 当前接单状态
    type: String,
    enum: ['available', 'busy', 'offline'],
    default: 'available',
  },
  schedule: {
    weekend: {
      sessions: [sessionSchema],
      defaultTimes: {
        // 默认时间设置
        早上: {
          startTime: {
            type: String,
            default: '09:00',
          },
          endTime: {
            type: String,
            default: '12:00',
          },
        },
        下午: {
          startTime: {
            type: String,
            default: '14:00',
          },
          endTime: {
            type: String,
            default: '17:00',
          },
        },
        晚上: {
          startTime: {
            type: String,
            default: '19:00',
          },
          endTime: {
            type: String,
            default: '21:00',
          },
        },
      },
    },
  },
  location: {
    address: String,
    district: String,
    city: String,
    geo: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number],
        required: true,
        validate: {
          validator: function(v) {
            return v[0] >= -180 && v[0] <= 180 && 
                   v[1] >= -90 && v[1] <= 90;
          },
          message: '无效的坐标范围'
        }
      }
    }
  },
  pricing: {
    // 价格设置
    basePrice: Number, // 基础价格（每小时）
  },
  teachingStyle: {
    // 教学风格
    description: String, // 风格描述
    keywords: [String], // 关键词标签
    strengths: [String], // 教学特长
  },
  ratings: {
    // 多维度评分
    overall: {
      type: Number,
      default: 0,
    },
    teachingQuality: {
      type: Number,
      default: 0,
    },
    attitude: {
      type: Number,
      default: 0,
    },
    punctuality: {
      type: Number,
      default: 0,
    },
    communication: {
      type: Number,
      default: 0,
    },
    effectiveness: {
      type: Number,
      default: 0,
    },
  },
  statistics: {
    // 统计数据
    totalStudents: {
      type: Number,
      default: 0,
    },
    totalClasses: {
      type: Number,
      default: 0,
    },
    completionRate: {
      type: Number,
      default: 0,
    },
    repeatRate: {
      type: Number,
      default: 0,
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// 创建索引
// 如果使用方法2，保留这行
TutorProfileSchema.index({ userId: 1 });

TutorProfileSchema.index({ 'teachingExperience.subjects.name': 1 });
TutorProfileSchema.index({ 'location.coordinates': '2dsphere' });

// 修改地理空间索引
TutorProfileSchema.index({ 'location.geo': '2dsphere' });

module.exports = mongoose.model('TutorProfile', TutorProfileSchema);
