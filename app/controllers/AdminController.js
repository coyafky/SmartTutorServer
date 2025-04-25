const User = require('../../models/User');
const TutorProfile = require('../../models/TutorProfile');
const TutoringRequest = require('../../models/TutoringRequest');
const Parent = require('../../models/Parent');
const Match = require('../../models/Match');
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
    // 检查是否要获取所有用户
    const { all = false } = req.query;
    
    if (all === 'true') {
      // 获取所有用户，不使用分页
      const result = await AdminService.getAllUsersWithoutPagination(req.query);
      
      return res.status(200).json({
        status: 'success',
        data: {
          users: result.users,
          total: result.total
        },
      });
    }
    
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




exports.getAllUserByLimit = async (req, res, next) => {
  try {
    // 从请求中获取分页参数和过滤条件
    const { page = 1, limit = 10 } = req.query;
    
    // 提取过滤条件
    const filters = {
      role: req.query.role,
      status: req.query.status,
      search: req.query.search,
      sortBy: req.query.sortBy,
      sortOrder: req.query.sortOrder
    };

    // 调用 AdminService 的方法获取分页数据
    const result = await AdminService.getUsersByLimit(page, limit, filters);

    // 返回成功响应
    res.status(200).json({
      status: 'success',
      data: result.users,
      pagination: result.pagination
    });
  } catch (error) {
    // 错误处理
    console.error(`[ADMIN] 分页获取用户列表失败: ${error.message}`, error);
    next(new AppError(error.message, error.statusCode || 500));
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

// 家长管理
exports.getAllParents = async (req, res, next) => {
  try {
    // 从请求中获取查询参数
    const result = await AdminService.getAllParents(req.query);

    // 返回成功响应
    res.status(200).json({
      status: 'success',
      data: result.parents,
      pagination: result.pagination
    });
  } catch (error) {
    // 错误处理
    console.error(`[管理员] 获取家长列表失败: ${error.message}`, error);
    next(new AppError(error.message, error.statusCode || 500));
  }
};

exports.getAllParentsLimit = async (req, res, next) => {
  try {
    // 从请求中获取分页参数和过滤条件
    const { page = 1, limit = 10 } = req.query;
    
    // 提取过滤条件
    const filters = {
      status: req.query.status,
      city: req.query.city,
      district: req.query.district,
      search: req.query.search,
      sortBy: req.query.sortBy,
      sortOrder: req.query.sortOrder
    };

    // 调用 AdminService 的方法获取分页数据
    const result = await AdminService.getParentsByLimit(page, limit, filters);

    // 返回成功响应
    res.status(200).json({
      status: 'success',
      data: result.parents,
      pagination: result.pagination
    });
  } catch (error) {
    // 错误处理
    console.error(`[管理员] 分页获取家长列表失败: ${error.message}`, error);
    next(new AppError(error.message, error.statusCode || 500));
  }
};

exports.getParentById = async (req, res, next) => {
  try {
    const { parentId } = req.params;
    const parent = await AdminService.getParentById(parentId);

    res.status(200).json({
      status: 'success',
      data: parent
    });
  } catch (error) {
    console.error(`[管理员] 获取家长 ${req.params.parentId} 详情失败: ${error.message}`, error);
    next(new AppError(error.message, error.statusCode || 500));
  }
};

exports.getParentsByCity = async (req, res, next) => {
  try {
    const { cityName } = req.params;
    const parents = await AdminService.getParentsByCity(cityName);

    res.status(200).json({
      status: 'success',
      data: parents
    });
  } catch (error) {
    console.error(`[管理员] 获取${req.params.cityName}家长列表失败: ${error.message}`, error);
    next(new AppError(error.message, error.statusCode || 500));
  }
};

exports.updateParentStatus = async (req, res, next) => {
  try {
    const { parentId } = req.params;
    const { status } = req.body;

    if (!status) {
      throw new AppError('缺少状态信息', 400);
    }

    const parent = await AdminService.updateParentStatus(parentId, status);

    res.status(200).json({
      status: 'success',
      data: parent
    });
  } catch (error) {
    console.error(`[管理员] 更新家长 ${req.params.parentId} 状态失败: ${error.message}`, error);
    next(new AppError(error.message, error.statusCode || 500));
  }
};

exports.getParentStatistics = async (req, res, next) => {
  try {
    const statistics = await AdminService.getParentStatistics();

    res.status(200).json({
      status: 'success',
      data: statistics
    });
  } catch (error) {
    console.error(`[管理员] 获取家长统计数据失败: ${error.message}`, error);
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
exports.getAllTutorsLimit = async(req,res,next)=>{
  try{
    // 从请求中获取分页参数和过滤条件
    const { page = 1, limit = 10 } = req.query;
    
    // 提取过滤条件
    const filters = {
      status: req.query.status,
      isVerified: req.query.isVerified,
      city: req.query.city,
      district: req.query.district,
      subject: req.query.subject,
      search: req.query.search,
      sortBy: req.query.sortBy,
      sortOrder: req.query.sortOrder
    };

    // 调用 AdminService 的方法获取分页数据
    const result = await AdminService.getTutorsByLimit(page, limit, filters);

    // 返回成功响应
    res.status(200).json({
      status: 'success',
      data: result.tutors,
      pagination: result.pagination
    });
  } catch (error) {
    // 错误处理
    console.error(`[ADMIN] 分页获取教师列表失败: ${error.message}`, error);
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
    console.error(`[ADMIN] 获取教师信息失败: ${error.message}`, error);
    next(new AppError(`获取教师信息失败: ${error.message}`, error.statusCode || 500));
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
    // 从请求中获取分页参数和过滤条件
    const { page = 1, limit = 10, status, search, sort = 'createdAt', sortOrder = 'desc' } = req.query;
    
    // 确保 page 和 limit 是数字
    const parsedPage = parseInt(page) || 1;
    const parsedLimit = parseInt(limit) || 10;
    
    console.log(`[ADMIN] 分页获取帖子列表: page=${parsedPage}, limit=${parsedLimit}`);
    
    // 构建查询条件
    const query = {};
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { 'location.city': { $regex: search, $options: 'i' } },
        { 'location.district': { $regex: search, $options: 'i' } },
        { 'subjects.name': { $regex: search, $options: 'i' } },
      ];
    }

    // 构建排序条件
    let sortOption = {};
    switch (sort) {
      case 'createdAt':
        sortOption = { createdAt: sortOrder === 'asc' ? 1 : -1 };
        break;
      case 'grade':
        sortOption = { grade: sortOrder === 'asc' ? 1 : -1 };
        break;
      case 'status':
        sortOption = { status: sortOrder === 'asc' ? 1 : -1 };
        break;
      default:
        sortOption = { createdAt: -1 };
    }

    // 计算跳过的数量
    const skip = (parsedPage - 1) * parsedLimit;
    
    console.log(`[ADMIN] 查询条件: ${JSON.stringify(query)}, 跳过: ${skip}, 限制: ${parsedLimit}`);
    
    // 并行执行查询，获取帖子数据和总数
    const [posts, total] = await Promise.all([
      TutoringRequest.find(query)
        .sort(sortOption)
        .skip(skip)
        .limit(parsedLimit)
        .select('requestId status grade subjects location preferences parentId createdAt reviewedAt'),
      TutoringRequest.countDocuments(query)
    ]);
    
    console.log(`[ADMIN] 查询结果: 总数=${total}, 返回条数=${posts.length}`);


    // 构造分页信息
    const pagination = {
      page: parsedPage,
      limit: parsedLimit,
      total,
      pages: Math.ceil(total / parsedLimit)
    };

    // 返回成功响应
    res.status(200).json({
      status: 'success',
      data: {
        posts
      },
      pagination
    });
  } catch (error) {
    console.error(`[ADMIN] 分页获取帖子列表失败: ${error.message}`, error);
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
    const completedMatches = await Match.countDocuments({
      status: 'completed',
    });
    const pendingMatches = await Match.countDocuments({ status: 'pending' });
    const acceptedMatches = await Match.countDocuments({ status: 'accepted' });
    const rejectedMatches = await Match.countDocuments({ status: 'rejected' });
    const cancelledMatches = await Match.countDocuments({ status: 'cancelled' });

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

    // 按状态分组统计
    const statusStats = await Match.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        totalMatches,
        completedMatches,
        pendingMatches,
        acceptedMatches,
        rejectedMatches,
        cancelledMatches,
        monthlyStats,
        statusStats,
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

exports.getRecentUsers = async (req, res, next) => {
  try {
    const result = await AdminService.getRecentUsers(req.query);
    
    res.status(200).json({
      status: 'success',
      data: result
    });
  } catch (error) {
    next(new AppError(error.message, error.statusCode || 500));
  }
};
