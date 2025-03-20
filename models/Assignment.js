/**
 * 作业模型
 * 用于存储家教作业信息
 * 与课程模型关联
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * 作业附件模式
 * 用于存储作业相关的附件
 * @typedef {Object} AttachmentSchema
 */
const AttachmentSchema = new Schema({
  /**
   * 附件名称
   * @type {String}
   */
  name: {
    type: String,
    required: true,
    trim: true
  },
  
  /**
   * 附件描述
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
    enum: ['document', 'image', 'video', 'audio', 'code', 'other'],
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
   * 文件大小（字节）
   * @type {Number}
   */
  fileSize: {
    type: Number
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
 * 作业提交模式
 * 用于记录学生提交的作业
 * @typedef {Object} SubmissionSchema
 */
const SubmissionSchema = new Schema({
  /**
   * 提交者ID（学生）
   * @type {Schema.Types.ObjectId}
   */
  studentId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  /**
   * 提交时间
   * @type {Date}
   */
  submittedAt: {
    type: Date,
    default: Date.now
  },
  
  /**
   * 提交内容
   * @type {String}
   */
  content: {
    type: String,
    trim: true
  },
  
  /**
   * 提交状态
   * @type {String}
   */
  status: {
    type: String,
    enum: ['submitted', 'reviewed', 'returned', 'late'],
    default: 'submitted'
  },
  
  /**
   * 附件列表
   * @type {[AttachmentSchema]}
   */
  attachments: [AttachmentSchema],
  
  /**
   * 评分
   * @type {Number}
   */
  score: {
    type: Number,
    min: 0,
    max: 100
  },
  
  /**
   * 教师反馈
   * @type {String}
   */
  feedback: {
    type: String,
    trim: true
  },
  
  /**
   * 评分时间
   * @type {Date}
   */
  gradedAt: Date,
  
  /**
   * 评分者ID（教师）
   * @type {Schema.Types.ObjectId}
   */
  gradedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
});

/**
 * 作业模式
 * 定义家教作业的完整信息
 * @typedef {Object} AssignmentSchema
 */
const AssignmentSchema = new Schema({
  /**
   * 作业标题
   * @type {String}
   */
  title: {
    type: String,
    required: true,
    trim: true
  },
  
  /**
   * 作业描述
   * @type {String}
   */
  description: {
    type: String,
    trim: true
  },
  
  /**
   * 作业编号
   * 自动生成的作业编号，格式为 ASSIGN_加上14位时间戳
   * @type {String}
   */
  assignmentId: {
    type: String,
    unique: true,
    default: () => `ASSIGN_${Date.now()}`
  },
  
  /**
   * 关联课程ID
   * @type {Schema.Types.ObjectId}
   */
  lessonId: {
    type: Schema.Types.ObjectId,
    ref: 'Lesson',
    required: true
  },
  
  /**
   * 教师ID
   * @type {Schema.Types.ObjectId}
   */
  tutorId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  /**
   * 学生ID列表
   * @type {[Schema.Types.ObjectId]}
   */
  studentIds: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  /**
   * 作业类型
   * @type {String}
   */
  assignmentType: {
    type: String,
    enum: ['homework', 'quiz', 'test', 'project', 'other'],
    default: 'homework'
  },
  
  /**
   * 学科
   * @type {String}
   */
  subject: {
    type: String,
    required: true
  },
  
  /**
   * 年级
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
   * 发布时间
   * @type {Date}
   */
  publishedAt: {
    type: Date,
    default: Date.now
  },
  
  /**
   * 截止日期
   * @type {Date}
   */
  dueDate: {
    type: Date,
    required: true
  },
  
  /**
   * 总分值
   * @type {Number}
   */
  totalPoints: {
    type: Number,
    default: 100,
    min: 0
  },
  
  /**
   * 作业状态
   * @type {String}
   */
  status: {
    type: String,
    enum: ['draft', 'published', 'closed', 'archived'],
    default: 'draft'
  },
  
  /**
   * 附件列表
   * @type {[AttachmentSchema]}
   */
  attachments: [AttachmentSchema],
  
  /**
   * 提交列表
   * @type {[SubmissionSchema]}
   */
  submissions: [SubmissionSchema],
  
  /**
   * 提醒设置
   * @type {Object}
   */
  reminders: {
    // 发布提醒
    onPublish: {
      type: Boolean,
      default: true
    },
    // 截止日期前提醒（小时）
    beforeDue: {
      type: Number,
      default: 24
    },
    // 自定义提醒时间
    customReminders: [{
      time: Date,
      sent: {
        type: Boolean,
        default: false
      }
    }]
  },
  
  /**
   * 创建时间
   * @type {Date}
   */
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  /**
   * 更新时间
   * @type {Date}
   */
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

/**
 * 静态方法：获取课程的所有作业
 * @param {ObjectId} lessonId - 课程ID
 * @param {String} status - 作业状态筛选
 * @returns {Promise<Array>} 作业列表
 */
AssignmentSchema.statics.getAssignmentsByLesson = async function(lessonId, status) {
  const query = { lessonId };
  
  if (status) {
    query.status = status;
  }
  
  return this.find(query).sort({ dueDate: 1 });
};

/**
 * 静态方法：获取教师发布的所有作业
 * @param {ObjectId} tutorId - 教师ID
 * @param {String} status - 作业状态筛选
 * @returns {Promise<Array>} 作业列表
 */
AssignmentSchema.statics.getAssignmentsByTutor = async function(tutorId, status) {
  const query = { tutorId };
  
  if (status) {
    query.status = status;
  }
  
  return this.find(query).sort({ createdAt: -1 });
};

/**
 * 静态方法：获取学生的所有作业
 * @param {ObjectId} studentId - 学生ID
 * @param {String} status - 作业状态筛选
 * @returns {Promise<Array>} 作业列表
 */
AssignmentSchema.statics.getAssignmentsByStudent = async function(studentId, status) {
  const query = { studentIds: studentId };
  
  if (status) {
    query.status = status;
  }
  
  return this.find(query).sort({ dueDate: 1 });
};

/**
 * 静态方法：获取即将到期的作业
 * @param {Number} hours - 提前多少小时
 * @returns {Promise<Array>} 作业列表
 */
AssignmentSchema.statics.getUpcomingDueAssignments = async function(hours = 24) {
  const now = new Date();
  const future = new Date(now.getTime() + hours * 60 * 60 * 1000);
  
  return this.find({
    status: 'published',
    dueDate: {
      $gt: now,
      $lte: future
    }
  }).sort({ dueDate: 1 });
};

/**
 * 静态方法：提交作业
 * @param {ObjectId} assignmentId - 作业ID
 * @param {ObjectId} studentId - 学生ID
 * @param {Object} submissionData - 提交数据
 * @returns {Promise<Object>} 更新后的作业
 */
AssignmentSchema.statics.submitAssignment = async function(assignmentId, studentId, submissionData) {
  const assignment = await this.findById(assignmentId);
  
  if (!assignment) {
    throw new Error('作业不存在');
  }
  
  // 检查学生是否有权限提交该作业
  if (!assignment.studentIds.includes(studentId)) {
    throw new Error('无权提交此作业');
  }
  
  // 检查是否已经提交过
  const existingSubmissionIndex = assignment.submissions.findIndex(
    sub => sub.studentId.toString() === studentId.toString()
  );
  
  // 设置提交状态（如果已过期则标记为迟交）
  const now = new Date();
  const status = now > assignment.dueDate ? 'late' : 'submitted';
  
  const submission = {
    studentId,
    submittedAt: now,
    content: submissionData.content,
    status,
    attachments: submissionData.attachments || []
  };
  
  // 更新或添加提交
  if (existingSubmissionIndex >= 0) {
    assignment.submissions[existingSubmissionIndex] = {
      ...assignment.submissions[existingSubmissionIndex].toObject(),
      ...submission
    };
  } else {
    assignment.submissions.push(submission);
  }
  
  assignment.updatedAt = now;
  return assignment.save();
};

/**
 * 静态方法：评分作业
 * @param {ObjectId} assignmentId - 作业ID
 * @param {ObjectId} submissionId - 提交ID
 * @param {ObjectId} tutorId - 教师ID
 * @param {Object} gradingData - 评分数据
 * @returns {Promise<Object>} 更新后的作业
 */
AssignmentSchema.statics.gradeSubmission = async function(assignmentId, submissionId, tutorId, gradingData) {
  const assignment = await this.findById(assignmentId);
  
  if (!assignment) {
    throw new Error('作业不存在');
  }
  
  // 检查教师是否有权限评分
  if (assignment.tutorId.toString() !== tutorId.toString()) {
    throw new Error('无权评分此作业');
  }
  
  // 找到对应的提交
  const submissionIndex = assignment.submissions.findIndex(
    sub => sub._id.toString() === submissionId
  );
  
  if (submissionIndex < 0) {
    throw new Error('提交记录不存在');
  }
  
  // 更新评分信息
  assignment.submissions[submissionIndex].score = gradingData.score;
  assignment.submissions[submissionIndex].feedback = gradingData.feedback;
  assignment.submissions[submissionIndex].status = 'reviewed';
  assignment.submissions[submissionIndex].gradedAt = new Date();
  assignment.submissions[submissionIndex].gradedBy = tutorId;
  
  assignment.updatedAt = new Date();
  return assignment.save();
};

/**
 * 静态方法：添加附件
 * @param {ObjectId} assignmentId - 作业ID
 * @param {Object} attachment - 附件信息
 * @returns {Promise<Object>} 更新后的作业
 */
AssignmentSchema.statics.addAttachment = async function(assignmentId, attachment) {
  return this.findByIdAndUpdate(
    assignmentId,
    {
      $push: { attachments: attachment },
      $set: { updatedAt: new Date() }
    },
    { new: true }
  );
};

/**
 * 静态方法：获取作业完成统计
 * @param {ObjectId} assignmentId - 作业ID
 * @returns {Promise<Object>} 统计结果
 */
AssignmentSchema.statics.getAssignmentStats = async function(assignmentId) {
  const assignment = await this.findById(assignmentId);
  
  if (!assignment) {
    throw new Error('作业不存在');
  }
  
  const totalStudents = assignment.studentIds.length;
  const submissions = assignment.submissions;
  
  // 计算各种统计数据
  const stats = {
    totalStudents,
    submitted: submissions.length,
    notSubmitted: totalStudents - submissions.length,
    reviewed: submissions.filter(sub => sub.status === 'reviewed').length,
    late: submissions.filter(sub => sub.status === 'late').length,
    averageScore: 0,
    highestScore: 0,
    lowestScore: 100,
    scoreDistribution: {
      '90-100': 0,
      '80-89': 0,
      '70-79': 0,
      '60-69': 0,
      'below-60': 0
    }
  };
  
  // 计算分数相关统计
  const scoredSubmissions = submissions.filter(sub => sub.score !== undefined);
  
  if (scoredSubmissions.length > 0) {
    // 计算平均分
    const totalScore = scoredSubmissions.reduce((sum, sub) => sum + sub.score, 0);
    stats.averageScore = Math.round((totalScore / scoredSubmissions.length) * 10) / 10;
    
    // 计算最高分和最低分
    stats.highestScore = Math.max(...scoredSubmissions.map(sub => sub.score));
    stats.lowestScore = Math.min(...scoredSubmissions.map(sub => sub.score));
    
    // 计算分数分布
    scoredSubmissions.forEach(sub => {
      const score = sub.score;
      if (score >= 90) stats.scoreDistribution['90-100']++;
      else if (score >= 80) stats.scoreDistribution['80-89']++;
      else if (score >= 70) stats.scoreDistribution['70-79']++;
      else if (score >= 60) stats.scoreDistribution['60-69']++;
      else stats.scoreDistribution['below-60']++;
    });
  }
  
  return stats;
};

const Assignment = mongoose.model('Assignment', AssignmentSchema);

module.exports = Assignment;
