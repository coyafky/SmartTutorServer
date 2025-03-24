const User = require('../../models/User');
const TutorProfile = require('../../models/TutorProfile');
const TutoringRequest = require('../../models/TutoringRequest');
const { AppError } = require('../utils/errorHandler');
const {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  updateUserStatus,
  updateUserRole,
  getAllTutors,
  getTutorById,
  verifyTutor,
  updateTutorStatus,
  getAllPosts,
  getPostById,
  updatePostStatus,
  deletePost,
  getReportedPosts,
  reviewPost,
  getSystemSettings,
  updateSystemSettings,
  getUserStatistics,
  getTutorStatistics,
  getPostStatistics,
  getMatchStatistics,
} = require('../services/AdminService');
const AdminService = require('../services/AdminService');
// 用户管理
exports.getAllUsers = async (req, res, next) => {
  try {
    // 添加分页参数处理
    const options = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10,
    };

    // 调用服务层方法时传递必要参数
    const result = await AdminService.getAllUsers(options);

    res.status(200).json({
      status: 'success',
      data: result.users,
      pagination: result.pagination,
    });
  } catch (error) {
    // 改进错误日志记录
    console.error(`[ADMIN] 获取用户列表失败: ${error.message}`, error);
    res.status(error.statusCode || 500).json({
      status: 'error',
      message: error.message || '获取用户列表失败',
    });
  }
};

exports.getUserById = async (req, res, next) => {
  try {
    // 修改为调用 AdminService 的方法
    const user = await AdminService.getUserById(req.params.userId);

    res.status(200).json({
      status: 'success',
      data: { user },
    });
  } catch (error) {
    // 保持错误状态码传递
    next(new AppError(error.message, error.statusCode || 500));
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const user = await updateUser(req.params.userId, req.body);

    res.status(200).json({
      status: 'success',
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    // 调用服务层方法删除用户
    await AdminService.deleteUser(req.params.userId);

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    // 传递服务层抛出的原始错误状态码
    next(new AppError(error.message, error.statusCode || 500));
  }
};

exports.updateUserStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    // 调用服务层方法更新状态
    const user = await AdminService.updateUserStatus(req.params.userId, status);

    res.status(200).json({
      status: 'success',
      data: { user },
    });
  } catch (error) {
    // 传递服务层原始错误状态码
    next(new AppError(error.message, error.statusCode || 500));
  }
};

exports.updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;

    const user = await AdminService.updateUserRole(req.params.userId, role);

    res.status(200).json({
      status: 'success',
      data: { user },
    });
  } catch (error) {
    // 传递服务层原始错误信息
    next(new AppError(error.message, error.statusCode || 500));
  }
};

// 教师管理
exports.getAllTutors = async (req, res, next) => {
  try {
    const result = await AdminService.getAllTutors(req.query);

    res.status(200).json({
      status: 'success',
      data: {
        tutors: result.tutors,
        pagination: result.pagination,
      },
    });
  } catch (error) {
    next(new AppError(error.message, error.statusCode || 500));
  }
};

exports.getTutorById = async (req, res, next) => {
  try {
    const tutor = await AdminService.getTutorById(req.params.tutorId);

    res.status(200).json({
      status: 'success',
      data: {
        tutor,
      },
    });
  } catch (error) {
    next(new AppError('获取教师信息失败', 500));
  }
};

exports.verifyTutor = async (req, res, next) => {
  try {
    const { isVerified } = req.body;
    const tutor = await AdminService.verifyTutor(
      req.params.tutorId,
      isVerified
    );

    res.status(200).json({
      status: 'success',
      data: { tutor },
    });
  } catch (error) {
    next(new AppError(error.message, error.statusCode || 500));
  }
};
exports.updateTutorStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!['active', 'inactive', 'suspended'].includes(status)) {
      return next(new AppError('无效的状态值', 400));
    }

    const tutor = await TutorProfile.findOneAndUpdate(
      { tutorId: req.params.tutorId },
      { status },
      { new: true, runValidators: true }
    );

    if (!tutor) {
      return next(new AppError('教师不存在', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        tutor,
      },
    });
  } catch (error) {
    next(new AppError('更新教师状态失败', 500));
  }
};

// 内容审核
exports.getAllPosts = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, type, search } = req.query;
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

    res.status(200).json({
      status: 'success',
      data: {
        posts,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    next(new AppError('获取帖子列表失败', 500));
  }
};

exports.getPostById = async (req, res, next) => {
  try {
    const post = await AdminService.getPostById(req.params.postId);

    res.status(200).json({
      status: 'success',
      data: { post },
    });
  } catch (error) {
    next(new AppError(error.message, error.statusCode || 500));
  }
};
exports.updatePostStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const post = await AdminService.updatePostStatus(
      req.params.postId,
      status,
      req.user.customId
    );

    res.status(200).json({
      status: 'success',
      data: { post },
    });
  } catch (error) {
    next(new AppError(error.message, error.statusCode || 500));
  }
};

exports.deletePost = async (req, res, next) => {
  try {
    // 调用服务层方法，使用 requestId 进行删除
    await AdminService.deletePost(req.params.postId);

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    // 继承服务层抛出的错误信息
    next(new AppError(error.message, error.statusCode || 500));
  }
};

// ... 现有代码 ...

exports.getReportedPosts = async (req, res) => {
  try {
    // 调用 AdminService 中的 getReportedPosts 方法
    const result = await AdminService.getReportedPosts(req.query);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    return errorHandler(res, error);
  }
};

// ... 现有代码 ...

exports.reviewPost = async (req, res, next) => {
  try {
    const { action, reason } = req.body;
    const post = await AdminService.reviewPost(
      req.params.postId, // 传入requestId
      action,
      reason,
      req.user.customId
    );

    res.status(200).json({
      status: 'success',
      data: { post },
    });
  } catch (error) {
    next(new AppError(error.message, error.statusCode || 500));
  }
};

// 系统设置
exports.getSystemSettings = async (req, res, next) => {
  try {
    // 从数据库获取系统设置
    // 这里需要根据实际的数据模型进行调整
    const settings = await Settings.findOne();

    res.status(200).json({
      status: 'success',
      data: {
        settings,
      },
    });
  } catch (error) {
    next(new AppError('获取系统设置失败', 500));
  }
};

exports.updateSystemSettings = async (req, res, next) => {
  try {
    // 更新系统设置
    // 这里需要根据实际的数据模型进行调整
    const settings = await Settings.findOneAndUpdate({}, req.body, {
      new: true,
      upsert: true,
      runValidators: true,
    });

    res.status(200).json({
      status: 'success',
      data: {
        settings,
      },
    });
  } catch (error) {
    next(new AppError('更新系统设置失败', 500));
  }
};

// 数据统计
exports.getUserStatistics = async (req, res, next) => {
  try {
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

    res.status(200).json({
      status: 'success',
      data: {
        totalUsers,
        activeUsers,
        newUsersToday,
        roleStats,
        monthlyStats,
      },
    });
  } catch (error) {
    next(new AppError('获取用户统计数据失败', 500));
  }
};

exports.getTutorStatistics = async (req, res, next) => {
  try {
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

    res.status(200).json({
      status: 'success',
      data: {
        totalTutors,
        verifiedTutors,
        activeTutors,
        subjectStats,
        locationStats,
      },
    });
  } catch (error) {
    next(new AppError('获取教师统计数据失败', 500));
  }
};

exports.getPostStatistics = async (req, res, next) => {
  try {
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

    res.status(200).json({
      status: 'success',
      data: {
        totalPosts,
        publishedPosts,
        pendingPosts,
        rejectedPosts,
        typeStats,
        monthlyStats,
      },
    });
  } catch (error) {
    next(new AppError('获取帖子统计数据失败', 500));
  }
};

exports.getMatchStatistics = async (req, res, next) => {
  try {
    // 获取匹配统计数据
    // 这里需要根据实际的数据模型进行调整
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

    res.status(200).json({
      status: 'success',
      data: {
        totalMatches,
        successfulMatches,
        pendingMatches,
        monthlyStats,
      },
    });
  } catch (error) {
    next(new AppError('获取匹配统计数据失败', 500));
  }
};

exports.getPostsByCity = async (req, res, next) => {
  try {
    const { cityName } = req.params;
    const result = await AdminService.getPostsByCity(cityName, req.query);
    
    res.status(200).json({
      status: 'success',
      data: result
    });
  } catch (error) {
    next(new AppError(error.message, error.statusCode || 500));
  }
};

exports.getTutorsByCity = async (req, res, next) => {
  try {
    const { cityName } = req.params;
    const result = await AdminService.getTutorsByCity(cityName, req.query);
    
    res.status(200).json({
      status: 'success',
      data: result
    });
  } catch (error) {
    next(new AppError(error.message, error.statusCode || 500));
  }
};
