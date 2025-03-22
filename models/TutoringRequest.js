/**
 * 家教需求请求模型
 * 定义家长发布的家教需求信息，包括学生年级、科目、地点和偏好等
 * @module models/TutoringRequest
 */

// 导入 Mongoose 库
const mongoose = require('mongoose');

/**
 * 科目模式
 * 定义学生需要辅导的科目信息，包括当前成绩和目标成绩
 * @typedef {Object} SubjectSchema
 */
const SubjectSchema = new mongoose.Schema({
    /**
     * 科目名称
     * 如数学、英语、物理等
     * @type {String}
     */
    name: {
        type: String,
        required: true  // 必填字段
    },
    /**
     * 当前成绩
     * 学生在该科目的当前成绩
     * @type {String}
     */
    currentScore: {
        type: String,
        required: true  // 必填字段
    },
    /**
     * 目标成绩
     * 期望通过辅导达到的成绩
     * @type {String}
     */
    targetScore: {
        type: String,
        required: true  // 必填字段
    },
    /**
     * 难度级别
     * 学生学习该科目的难度评估
     * @type {String}
     */
    difficulty: {
        type: String,
        required: true  // 必填字段
    }
});

/**
 * 位置信息模式
 * 定义家教上课的地理位置信息
 * @typedef {Object} LocationSchema
 */
const LocationSchema = new mongoose.Schema({
    /**
     * 详细地址
     * 家教上课的具体地址
     * @type {String}
     */
    address: {
        type: String,
        required: true  // 必填字段
    },
    /**
     * 区域
     * 所在的区县
     * @type {String}
     */
    district: {
        type: String,
        required: true  // 必填字段
    },
    /**
     * 城市
     * 所在的城市
     * @type {String}
     */
    city: {
        type: String,
        required: true  // 必填字段
    },
    /**
     * 地理坐标
     * 用于地理位置查询和距离计算
     * @type {Object}
     */
    coordinates: {
        /**
         * GeoJSON 格式的坐标数组 [longitude, latitude]
         * @type {Array}
         */
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point',
            required: true
        },
        coordinates: {
            type: [Number],  // [longitude, latitude] 格式
            required: true  // 必填字段
        }
    }
});

/**
 * 教学偏好模式
 * 定义家长对家教的偏好和要求
 * @typedef {Object} PreferencesSchema
 */
const PreferencesSchema = new mongoose.Schema({
    /**
     * 教学地点
     * 家长期望的教学地点
     * @type {String}
     */
    teachingLocation: {
        type: String,
        enum: ['家里', '教师家', '其他'],  // 限定可选值
        required: true  // 必填字段
    },
    /**
     * 教师性别偏好
     * 家长对教师性别的偏好
     * @type {String}
     */
    teacherGender: {
        type: String,
        enum: ['男', '女', '不限'],  // 限定可选值
        default: '不限'  // 默认不限制性别
    },
    /**
     * 教学风格偏好
     * 家长期望的教学风格特点
     * @type {Array<String>}
     */
    teachingStyle: [{
        type: String
    }],
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
            required: true  // 必填字段
        },
        /**
         * 最高预算
         * 家长能接受的最高价格
         * @type {Number}
         */
        max: {
            type: Number,
            required: true  // 必填字段
        },
        /**
         * 计费周期
         * 价格的计算单位
         * @type {String}
         */
        period: {
            type: String,
            enum: ['per_hour', 'per_session'],  // 按小时或按课时计费
            required: true  // 必填字段
        }
    }
});

/**
 * 家教需求帖子模式
 * 定义家长发布的家教需求的完整信息
 * @typedef {Object} TutoringRequestSchema
 */
const TutoringRequestSchema = new mongoose.Schema({
    /**
     * 请求ID
     * 唯一标识家教需求请求的ID，格式为 REQUEST_ParentId_时间戳-序列号
     * @type {String}
     */
    requestId: {
        type: String,
        unique: true,
        required: true
    },
    
    /**
     * 帖子状态
     * 标识帖子的当前状态（已发布、待审核、已拒绝）
     * @type {String}
     */
    status: {
        type: String,
        enum: ['published', 'pending', 'rejected'],
        default: 'pending'
    },
    
    /**
     * 审核时间
     * 记录帖子被审核的时间
     * @type {Date}
     */
    reviewedAt: Date,
    
    /**
     * 审核人
     * 记录进行审核的管理员ID
     * @type {String}
     */
    reviewedBy: String,
    
    /**
     * 审核备注
     * 审核人对帖子的备注信息
     * @type {String}
     */
    reviewNote: String,
    
    /**
     * 举报信息
     * 记录用户对帖子的举报
     * @type {Array}
     */
    reports: [{
        /**
         * 举报人
         * 进行举报的用户ID
         * @type {String}
         */
        reportedBy: String,
        
        /**
         * 举报原因
         * 用户举报的具体原因
         * @type {String}
         */
        reason: String,
        
        /**
         * 举报时间
         * 记录举报的时间
         * @type {Date}
         */
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    
    /**
     * 家长ID
     * 发布需求的家长用户ID，关联到Parent模型
     * @type {mongoose.Schema.Types.ObjectId}
     */
    parentId: {
        type: String,
        ref: 'Parent',  // 引用Parent模型
        required: true  // 必填字段
    },
    /**
     * 孩子ID
     * 需要辅导的孩子ID，关联到Parent模型中的children数组
     * @type {String}
     */
    childId: {
        type: String,
        required: true,  // 必填字段
        description: '关联的子女ID'
    },
    /**
     * 年级
     * 需要辅导的学生年级
     * @type {String}
     */
    grade: {
        type: String,
        enum: [
            '小学一年级', '小学二年级', '小学三年级', '小学四年级', '小学五年级', '小学六年级',
            '初中一年级', '初中二年级', '初中三年级',
            '高中一年级', '高中二年级', '高中三年级'
        ],
        required: true  // 必填字段
    },
    /**
     * 上课地点
     * 家教上课的地理位置信息
     * @type {LocationSchema}
     */
    location: {
        type: LocationSchema,
        required: true  // 必填字段
    },
    /**
     * 需辅导科目列表
     * 需要辅导的科目信息列表
     * @type {Array<SubjectSchema>}
     */
    subjects: [SubjectSchema],
    /**
     * 教学偏好
     * 家长对家教的偏好和要求
     * @type {PreferencesSchema}
     */
    preferences: {
        type: PreferencesSchema,
        required: true  // 必填字段
    },
    /**
     * 需求状态
     * 家教需求的当前状态
     * @type {String}
     */
    status: {
        type: String,
        enum: ['open', 'closed', 'archived'],  // 开放、关闭、归档
        default: 'open'  // 默认为开放状态
    }
}, {
    /**
     * 模式配置选项
     * @property {Boolean} timestamps - 自动添加 createdAt 和 updatedAt 字段
     */
    timestamps: true  // 自动管理创建时间和更新时间
});

/**
 * 添加地理位置索引
 * 支持基于地理位置的查询，如查找附近的家教需求
 */
TutoringRequestSchema.index({ 'location.coordinates.coordinates': '2dsphere' });

/**
 * 添加查询方法
 * 根据状态查询需求
 */
TutoringRequestSchema.statics.findByStatus = function(status) {
    return this.find({ status: status });
};

/**
 * 添加查询方法
 * 查找特定科目的需求
 */
TutoringRequestSchema.statics.findBySubject = function(subjectName) {
    return this.find({ 'subjects.name': subjectName });
};

/**
 * 添加实例方法
 * 关闭需求
 */
TutoringRequestSchema.methods.closeRequest = function() {
    this.status = 'closed';
    return this.save();
};

/**
 * 导出家教需求模型
 * @type {mongoose.Model}
 */
module.exports = mongoose.model('TutoringRequest', TutoringRequestSchema);
