const User = require('../../models/User');
const TutorProfile = require('../../models/TutorProfile');
const TutoringRequest = require('../../models/TutoringRequest');
const Settings = require('../../models/Settings');
const Match = require('../../models/Match');
const { AppError } = require('../utils/errorHandler');

// 用户管理服务
class AdminService {
  // 用户管理
  async getAllUsers(queryParams) {
    const { page = 1, limit = 10, role, status, search } = queryParams;
    const skip = (page - 1) * limit;

    // 构建查询条件
    const query = {};
    if (role) query.role = role;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },

        { name: { $regex: search, $options: 'i' } },
      ];
    }

    // 执行查询
    const users = await User.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .select('-password')
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    return {
      users,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getUserById(userId) {
    const user = await User.findOne({ customId: userId }).select('-password');

    if (!user) {
      throw new AppError('用户不存在', 404);
    }

    return user;
  }

  async updateUser(userId, userData) {
    const { username } = userData;

    const user = await User.findOneAndUpdate(
      { customId: userId },
      { username },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      throw new AppError('用户不存在', 404);
    }

    return user;
  }

  async deleteUser(userId) {
    const user = await User.findOneAndDelete({ customId: userId });

    if (!user) {
      throw new AppError('用户不存在', 404);
    }

    return null;
  }

  async updateUserStatus(userId, status) {
    if (!['active', 'inactive', 'suspended'].includes(status)) {
      throw new AppError('无效的状态值', 400);
    }

    const user = await User.findOneAndUpdate(
      { customId: userId },
      { status },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      throw new AppError('用户不存在', 404);
    }

    return user;
  }

  async updateUserRole(userId, role) {
    if (!['admin', 'parent', 'teacher'].includes(role)) {
      throw new AppError('无效的角色值', 400);
    }

    // 获取当前用户数据
    const currentUser = await User.findOne({ customId: userId });
    if (!currentUser) {
      throw new AppError('用户不存在', 404);
    }

    // 生成新的customId（保留时间戳部分）
    const newCustomId = `${role.toUpperCase()}_${
      currentUser.customId.split('_')[1]
    }`;

    // 同时更新角色和customId
    const user = await User.findOneAndUpdate(
      { customId: userId },
      {
        role,
        customId: newCustomId, // 新增字段更新
      },
      { new: true, runValidators: true }
    ).select('-password');

    return user;
  }

  // 教师管理
  async getAllTutors(queryParams) {
    const { page = 1, limit = 10, status, verified, search } = queryParams;
    const skip = (page - 1) * limit;

    // 构建查询条件
    const query = {};
    if (status) query.status = status;
    if (verified !== undefined) query.isVerified = verified === 'true';
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { 'subjects.name': { $regex: search, $options: 'i' } },
        { 'location.city': { $regex: search, $options: 'i' } },
      ];
    }

    // 执行查询
    const tutors = await TutorProfile.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await TutorProfile.countDocuments(query);

    return {
      tutors,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getTutorById(tutorId) {
    const tutor = await TutorProfile.findOne({ tutorId });

    if (!tutor) {
      throw new AppError('教师不存在', 404);
    }

    return tutor;
  }

  async verifyTutor(tutorId, isVerified) {
    const tutor = await TutorProfile.findOneAndUpdate(
      { tutorId },
      { isVerified, verifiedAt: isVerified ? new Date() : null },
      { new: true, runValidators: true }
    );

    if (!tutor) {
      throw new AppError('教师不存在', 404);
    }

    return tutor;
  }

  async updateTutorStatus(tutorId, status) {
    if (!['active', 'inactive', 'suspended'].includes(status)) {
      throw new AppError('无效的状态值', 400);
    }

    const tutor = await TutorProfile.findOneAndUpdate(
      { tutorId },
      { status },
      { new: true, runValidators: true }
    );

    if (!tutor) {
      throw new AppError('教师不存在', 404);
    }

    return tutor;
  }

  async getTutorsByEducationLevel(level) {
    const tutors = await TutorProfile.find({ 'education.level': level });
    return tutors;
  }

  //   //// 科目名称索引，用于按科目查询教师
  // TutorProfileSchema.index({ 'teachingExperience.subjects.name': 1 });

  async getTutorsBySubjectName(name) {
    const tutors = await TutorProfile.find({
      'teachingExperience.subjects.name': name,
    });
    return tutors;
  }

  // 根据城市名称获取教师
async getTutorsByCity(cityName, queryParams = {}) {
  try {
    const { page = 1, limit = 10, status, isVerified } = queryParams;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // 构建查询条件
    const query = { 'location.city': cityName };
    
    // 添加可选的筛选条件
    if (status) query.status = status;
    if (isVerified !== undefined) query.isVerified = isVerified === 'true';
    
    // 执行查询
    const tutors = await TutorProfile.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });
      
    // 获取总数
    const total = await TutorProfile.countDocuments(query);
    
    return {
      tutors,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    };
  } catch (error) {
    throw new AppError(`获取城市 ${cityName} 的教师失败: ${error.message}`, 500);
  }
}

  // 内容审核
  async getAllPosts(queryParams) {
    const { page = 1, limit = 10, status, type, search } = queryParams;
    const skip = (page - 1) * limit;

    // 构建查询条件
    const query = {};
    if (status) query.status = status;
    if (type) query.type = type;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
      ];
    }

    // 执行查询
    const posts = await TutoringRequest.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await TutoringRequest.countDocuments(query);

    return {
      posts,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getPostById(postId) {
    const post = await TutoringRequest.findOne({ requestId: postId });
    if (!post) {
      throw new AppError('帖子不存在', 404);
    }

    return post;
  }

  async getPostByCity(city) {
    try {
      const posts = await TutoringRequest.find({
        'location.city': city,
      });
      return posts;
    } catch (error) {
      console.error('Error fetching posts by city:', error);
      throw new AppError('获取帖子失败', 500);
    }
  }


//   // 根据城市名称获取帖子
// async getPostsByCity(cityName, queryParams = {}) {
//   try {
//     const { page = 1, limit = 10, status, grade } = queryParams;
//     const skip = (parseInt(page) - 1) * parseInt(limit);
    
//     // 构建查询条件
//     const query = { 'location.city': cityName };
    
//     // 添加可选的筛选条件
//     if (status) query.status = status;
//     if (grade) query.grade = grade;
    
//     // 执行查询
//     const posts = await TutoringRequest.find(query)
//       .skip(skip)
//       .limit(parseInt(limit))
//       .sort({ createdAt: -1 });
      
//     // 获取总数
//     const total = await TutoringRequest.countDocuments(query);
    
//     return {
//       posts,
//       pagination: {
//         total,
//         page: parseInt(page),
//         limit: parseInt(limit),
//         pages: Math.ceil(total / parseInt(limit))
//       }
//     };
//   } catch (error) {
//     throw new AppError(`获取城市 ${cityName} 的帖子失败: ${error.message}`, 500);
//   }
// }

  async updatePostStatus(postId, status, userId) {
    if (!['published', 'pending', 'rejected'].includes(status)) {
      throw new AppError('无效的状态值', 400);
    }

    const post = await TutoringRequest.findOneAndUpdate(
      { requestId: postId }, // 修改查询条件
      {
        status,
        reviewedAt: new Date(),
        reviewedBy: userId,
      },
      { new: true, runValidators: true }
    );

    if (!post) {
      throw new AppError('帖子不存在', 404);
    }

    return post;
  }

  async deletePost(postId) {
    const post = await TutoringRequest.findByIdAndDelete(postId);

    if (!post) {
      throw new AppError('帖子不存在', 404);
    }

    return null;
  }

  async getReportedPosts(queryParams) {
    const { page = 1, limit = 10 } = queryParams;
    const skip = (page - 1) * limit;

    // 查询被举报的帖子
    const posts = await TutoringRequest.find({ 'reports.0': { $exists: true } })
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ 'reports.createdAt': -1 });

    const total = await TutoringRequest.countDocuments({
      'reports.0': { $exists: true },
    });

    return {
      posts,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    };
  }

  async reviewPost(postId, action, reason, userId) {
    if (!['approve', 'reject', 'ignore'].includes(action)) {
      throw new AppError('无效的操作', 400);
    }

    let status;
    switch (action) {
      case 'approve':
        status = 'published';
        break;
      case 'reject':
        status = 'rejected';
        break;
      case 'ignore':
        status = 'pending';
        break;
    }

    const post = await TutoringRequest.findOneAndUpdate(
      { requestId: postId }, // 使用requestId查询
      {
        status,
        reviewedAt: new Date(),
        reviewedBy: userId,
        reviewNote: reason || '',
      },
      { new: true, runValidators: true }
    );

    if (!post) {
      throw new AppError('帖子不存在', 404);
    }

    return post;
  }
  // 系统设置
  async getSystemSettings() {
    // 从数据库获取系统设置
    const settings = await Settings.findOne();

    return settings;
  }

  async updateSystemSettings(settingsData, userId) {
    // 更新系统设置
    const settings = await Settings.findOneAndUpdate(
      {},
      {
        ...settingsData,
        updatedAt: new Date(),
        updatedBy: userId,
      },
      { new: true, upsert: true, runValidators: true }
    );

    return settings;
  }

  // 数据统计
  async getUserStatistics() {
    // 获取用户统计数据
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ status: 'active' });
    const newUsersToday = await User.countDocuments({
      createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
    });

    // 按角色统计
    const roleStats = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } },
    ]);

    // 按月统计新用户
    const monthlyStats = await User.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 },
    ]);

    return {
      totalUsers,
      activeUsers,
      newUsersToday,
      roleStats,
      monthlyStats,
    };
  }

  async getTutorStatistics() {
    // 获取教师统计数据
    const totalTutors = await TutorProfile.countDocuments();
    const verifiedTutors = await TutorProfile.countDocuments({
      isVerified: true,
    });
    const activeTutors = await TutorProfile.countDocuments({
      status: 'active',
    });

    // 按科目统计
    const subjectStats = await TutorProfile.aggregate([
      { $unwind: '$subjects' },
      { $group: { _id: '$subjects.name', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    // 按地区统计
    const locationStats = await TutorProfile.aggregate([
      { $group: { _id: '$location.city', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    return {
      totalTutors,
      verifiedTutors,
      activeTutors,
      subjectStats,
      locationStats,
    };
  }

  async getPostStatistics() {
    // 获取帖子统计数据
    const totalPosts = await TutoringRequest.countDocuments();
    const publishedPosts = await TutoringRequest.countDocuments({
      status: 'published',
    });
    const pendingPosts = await TutoringRequest.countDocuments({
      status: 'pending',
    });
    const rejectedPosts = await TutoringRequest.countDocuments({
      status: 'rejected',
    });

    // 按类型统计
    const typeStats = await TutoringRequest.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } },
    ]);

    // 按月统计新帖子
    const monthlyStats = await TutoringRequest.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 },
    ]);

    return {
      totalPosts,
      publishedPosts,
      pendingPosts,
      rejectedPosts,
      typeStats,
      monthlyStats,
    };
  }

  async getMatchStatistics() {
    // 获取匹配统计数据
    const totalMatches = await Match.countDocuments();
    const successfulMatches = await Match.countDocuments({
      status: 'successful',
    });
    const pendingMatches = await Match.countDocuments({ status: 'pending' });

    // 按月统计匹配
    const monthlyStats = await Match.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 },
    ]);

    return {
      totalMatches,
      successfulMatches,
      pendingMatches,
      monthlyStats,
    };
  }
}

module.exports = new AdminService();
