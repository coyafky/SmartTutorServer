const mongoose = require('mongoose');

// 科目模式
const SubjectSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    currentScore: {
        type: String,
        required: true
    },
    targetScore: {
        type: String,
        required: true
    },
    difficulty: {
        type: String,
        required: true
    }
});

// 位置信息模式
const LocationSchema = new mongoose.Schema({
    address: {
        type: String,
        required: true
    },
    district: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    coordinates: {
        latitude: {
            type: Number,
            required: true
        },
        longitude: {
            type: Number,
            required: true
        }
    }
});

// 教学偏好模式
const PreferencesSchema = new mongoose.Schema({
    teachingLocation: {
        type: String,
        enum: ['家里', '教师家', '其他'],
        required: true
    },
    teacherGender: {
        type: String,
        enum: ['男', '女', '不限'],
        default: '不限'
    },
    teachingStyle: [{
        type: String
    }],
    budget: {
        min: {
            type: Number,
            required: true
        },
        max: {
            type: Number,
            required: true
        },
        period: {
            type: String,
            enum: ['per_hour', 'per_session'],
            required: true
        }
    }
});

// 家教需求帖子模式
const TutoringRequestSchema = new mongoose.Schema({
    parentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Parent',
        required: true
    },
    childId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        description: '关联的子女ID'
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
    location: {
        type: LocationSchema,
        required: true
    },
    subjects: [SubjectSchema],
    preferences: {
        type: PreferencesSchema,
        required: true
    },
    status: {
        type: String,
        enum: ['open', 'closed', 'archived'],
        default: 'open'
    }
}, {
    timestamps: true // 这会自动添加 createdAt 和 updatedAt 字段
});

// 添加索引以支持地理位置查询
TutoringRequestSchema.index({ 'location.coordinates': '2dsphere' });

module.exports = mongoose.model('TutoringRequest', TutoringRequestSchema);
