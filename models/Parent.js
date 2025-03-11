const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ChildSchema = new Schema({
  nickname: {
    type: String,
    required: true,
    trim: true
  },
  grade: {
    type: String,
    enum: [
      '小学一年级', '小学二年级', '小学三年级', '小学四年级', '小学五年级', '小学六年级',
      '初中一年级', '初中二年级', '初中三年级',
      '高中一年级', '高中二年级', '高中三年级'
    ],
    required: true
  },
  subjects: [{
    name: {
      type: String,
      required: true
    },
    currentScore: String,
    targetScore: String,
    difficulty: {
      type: String,
      enum: ['简单', '中等', '困难']
    }
  }]
});

const ParentSchema = new Schema(
  {
    parentId: {
      type: String,
      required: true,
      unique: true,
      match: /^PARENT_\d{14}$/,
      index: true,
    },
    nickname: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      district: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      coordinates: {
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
    children: [ChildSchema],
    preferences: {
      teachingLocation: {
        type: String,
        enum: ['家里', '教师家', '其他'],
        required: true,
      },
      teacherGender: {
        type: String,
        enum: ['男', '女', '不限'],
        default: '不限',
      },
      teachingStyle: [{
        type: String,
      }],
      budget: {
        min: {
          type: Number,
          required: true,
        },
        max: {
          type: Number,
          required: true,
        },
        period: {
          type: String,
          enum: ['per_hour', 'per_session'],
          required: true,
        },
      },
    },
    statistics: {
      totalPosts: {
        type: Number,
        default: 0,
      },
      totalTeachers: {
        type: Number,
        default: 0,
      },
      totalClasses: {
        type: Number,
        default: 0,
      },
      totalSpent: {
        type: Number,
        default: 0,
      },
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

// 添加地理位置索引
ParentSchema.index({ 'location.coordinates': '2dsphere' });

module.exports = mongoose.model('Parent', ParentSchema);
