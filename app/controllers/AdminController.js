const User = require('../../models/User');
const TutorProfile = require('../../models/TutorProfile');
const TutoringRequest = require('../../models/TutoringRequest');
const { AppError } = require('../utils/errorHandler');
const { getAllUsers, getUserById, updateUser, } = require('../services/AdminService');

// 用户管理
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await getAllUsers();

    res.status(200).json({
      status: 'success',
      data: {
        users,
      },
    });
  } catch (error) {
    next(new AppError('获取用户列表失败', 500));
  }
};

exports.getUserById = async (req, res, next) => {
  try {
    const user = await getUserById(req.params.userId);
    res.status(200).json({
      status: 'success',
      data: {
        user,
      },
    });
  } catch (error) {
    next(new AppError('获取用户信息失败', 500));
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
    const user = await User.findOneAndDelete({ customId: req.params.userId });

    if (!user) {
      return next(new AppError('用户不存在', 404));
    }

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    next(new AppError('删除用户失败', 500));
  }
};

exports.updateUserStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!['active', 'inactive', 'suspended'].includes(status)) {
      return next(new AppError('无效的状态值', 400));
    }

    const user = await User.findOneAndUpdate(
      { customId: req.params.userId },
      { status },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return next(new AppError('用户不存在', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        user,
      },
    });
  } catch (error) {
    next(new AppError('更新用户状态失败', 500));
  }
};

exports.updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;

    if (!['admin', 'parent', 'teacher', 'student'].includes(role)) {
      return next(new AppError('无效的角色值', 400));
    }

    const user = await User.findOneAndUpdate(
      { customId: req.params.userId },
      { role },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return next(new AppError('用户不存在', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        user,
      },
    });
  } catch (error) {
    next(new AppError('更新用户角色失败', 500));
  }
};

// 教师管理
exports.getAllTutors = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, verified, search } = req.query;
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

    res.status(200).json({
      status: 'success',
      data: {
        tutors,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    next(new AppError('获取教师列表失败', 500));
  }
};

exports.getTutorById = async (req, res, next) => {
  try {
    const tutor = await TutorProfile.findOne({ tutorId: req.params.tutorId });

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
    next(new AppError('获取教师信息失败', 500));
  }
};

exports.verifyTutor = async (req, res, next) => {
  try {
    const { isVerified } = req.body;

    const tutor = await TutorProfile.findOneAndUpdate(
      { tutorId: req.params.tutorId },
      { isVerified, verifiedAt: isVerified ? new Date() : null },
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
    next(new AppError('更新教师验证状态失败', 500));
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
    const post = await TutoringRequest.findById(req.params.postId);

    if (!post) {
      return next(new AppError('帖子不存在', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        post,
      },
    });
  } catch (error) {
    next(new AppError('获取帖子信息失败', 500));
  }
};

exports.updatePostStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!['published', 'pending', 'rejected'].includes(status)) {
      return next(new AppError('无效的状态值', 400));
    }

    const post = await TutoringRequest.findByIdAndUpdate(
      req.params.postId,
      {
        status,
        reviewedAt: new Date(),
        reviewedBy: req.user.customId,
      },
      { new: true, runValidators: true }
    );

    if (!post) {
      return next(new AppError('帖子不存在', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        post,
      },
    });
  } catch (error) {
    next(new AppError('更新帖子状态失败', 500));
  }
};

exports.deletePost = async (req, res, next) => {
  try {
    const post = await TutoringRequest.findByIdAndDelete(req.params.postId);

    if (!post) {
      return next(new AppError('帖子不存在', 404));
    }

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    next(new AppError('删除帖子失败', 500));
  }
};

exports.getReportedPosts = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    // 查询被举报的帖子
    const posts = await TutoringRequest.find({ 'reports.0': { $exists: true } })
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ 'reports.createdAt': -1 });

    const total = await TutoringRequest.countDocuments({
      'reports.0': { $exists: true },
    });

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
    next(new AppError('获取被举报帖子列表失败', 500));
  }
};

exports.reviewPost = async (req, res, next) => {
  try {
    const { action, reason } = req.body;

    if (!['approve', 'reject', 'ignore'].includes(action)) {
      return next(new AppError('无效的操作', 400));
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

    const post = await TutoringRequest.findByIdAndUpdate(
      req.params.postId,
      {
        status,
        reviewedAt: new Date(),
        reviewedBy: req.user.customId,
        reviewNote: reason || '',
      },
      { new: true, runValidators: true }
    );

    if (!post) {
      return next(new AppError('帖子不存在', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        post,
      },
    });
  } catch (error) {
    next(new AppError('审核帖子失败', 500));
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
