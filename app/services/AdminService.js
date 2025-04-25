const User = require('../../models/User');
const TutorProfile = require('../../models/TutorProfile');
const TutoringRequest = require('../../models/TutoringRequest');
const Settings = require('../../models/Settings');
const Match = require('../../models/Match');
const Parent = require('../../models/Parent');
const { AppError } = require('../utils/errorHandler');

// 用户管理服务
class AdminService {
  // 用户管理
  async getAllUsers(queryParams) {
    const { page = 1, limit = 10, role, status, search } = queryParams;
    const skip = (page - 1) * limit;

    try {
      // 构建查询条件
      const query = {};
      if (role) query.role = role;
      if (status) query.status = status;
      if (search) {
        query.$or = [
          { username: { $regex: search, $options: 'i' } },
          { customId: { $regex: search, $options: 'i' } },
          { name: { $regex: search, $options: 'i' } },
        ];
      }

      // 使用投影只返回需要的字段，减少数据传输量
      const projection = {
        password: 0, // 排除密码字段
        __v: 0, // 排除版本字段
        // 可以根据需要添加或删除其他字段
      };

      // 并行执行查询和计数，提高性能
      const [users, total] = await Promise.all([
        User.find(query)
          .select(projection)
          .skip(skip)
          .limit(parseInt(limit))
          .sort({ createdAt: -1 })
          .lean(), // 使用 lean() 返回普通 JS 对象，提高性能

        User.countDocuments(query),
      ]);

      return {
        users,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error('获取用户列表错误:', error);
      throw new AppError('获取用户列表失败', 500);
    }
  }

  // 获取所有用户，不使用分页
  async getAllUsersWithoutPagination(queryParams) {
    try {
      const { role, status, search } = queryParams;

      // 构建查询条件
      const query = {};
      if (role) query.role = role;
      if (status) query.status = status;
      if (search) {
        query.$or = [
          { username: { $regex: search, $options: 'i' } },
          { customId: { $regex: search, $options: 'i' } },
          { name: { $regex: search, $options: 'i' } },
        ];
      }

      // 使用投影只返回需要的字段，减少数据传输量
      const projection = {
        password: 0, // 排除密码字段
        __v: 0, // 排除版本字段
      };

      // 执行查询，不使用 skip 和 limit，获取所有符合条件的用户
      const users = await User.find(query)
        .select(projection)
        .sort({ createdAt: -1 })
        .lean(); // 使用 lean() 返回普通 JS 对象，提高性能

      const total = users.length;

      return {
        users,
        total
      };
    } catch (error) {
      console.error('获取所有用户错误:', error);
      throw new AppError('获取所有用户失败', 500);
    }
  }

  async getUserById(userId) {
    try {
      const user = await User.findOne({ customId: userId }).select('-password');

      if (!user) {
        throw new AppError('用户不存在', 404);
      }

      return user;
    } catch (error) {
      console.error(`获取用户详情错误 (ID: ${userId}):`, error);
      throw new AppError(
        error.message || '获取用户详情失败',
        error.statusCode || 500
      );
    }
  }

  async updateUser(userId, userData) {
    try {
      const { username, email } = userData;

      // 验证数据
      if (!username) {
        throw new AppError('用户名不能为空', 400);
      }

      // 检查用户名是否已存在（排除当前用户）
      const existingUser = await User.findOne({
        username,
        customId: { $ne: userId },
      });

      if (existingUser) {
        throw new AppError('用户名已被使用', 400);
      }

      // 构建更新对象
      const updateData = { username };
      if (email) updateData.email = email;

      const user = await User.findOneAndUpdate(
        { customId: userId },
        updateData,
        { new: true, runValidators: true }
      ).select('-password');

      if (!user) {
        throw new AppError('用户不存在', 404);
      }

      return user;
    } catch (error) {
      console.error(`更新用户错误 (ID: ${userId}):`, error);
      throw new AppError(
        error.message || '更新用户失败',
        error.statusCode || 500
      );
    }
  }

  async deleteUser(userId) {
    try {
      const user = await User.findOneAndDelete({ customId: userId });

      if (!user) {
        throw new AppError('用户不存在', 404);
      }

      return null;
    } catch (error) {
      console.error(`删除用户错误 (ID: ${userId}):`, error);
      throw new AppError(
        error.message || '删除用户失败',
        error.statusCode || 500
      );
    }
  }

  async updateUserStatus(userId, status) {
    try {
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
    } catch (error) {
      console.error(
        `更新用户状态错误 (ID: ${userId}, 状态: ${status}):`,
        error
      );
      throw new AppError(
        error.message || '更新用户状态失败',
        error.statusCode || 500
      );
    }
  }


  

  async updateUserRole(userId, role) {
    try {
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

      if (!user) {
        throw new AppError('用户不存在', 404);
      }

      return user;
    } catch (error) {
      console.error(`更新用户角色错误 (ID: ${userId}, 角色: ${role}):`, error);
      throw new AppError(
        error.message || '更新用户角色失败',
        error.statusCode || 500
      );
    }
  }



  // 根据指定的页码和每页数量获取用户数据
  async getUsersByLimit(page = 1, limit = 10, filters = {}) {
    try {
      // 构建查询条件
      const query = {};
      const { role, status, search, sortBy = 'createdAt', sortOrder = 'desc' } = filters;
      
      if (role) query.role = role;
      if (status) query.status = status;
      if (search) {
        query.$or = [
          { username: { $regex: search, $options: 'i' } },
          { customId: { $regex: search, $options: 'i' } },
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ];
      }

      // 计算跳过的文档数
      const skip = (parseInt(page) - 1) * parseInt(limit);
      
      // 构建排序对象
      const sort = {};
      sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

      // 使用投影排除敏感字段
      const projection = {
        password: 0,
        __v: 0
      };

      // 并行执行查询和计数，提高性能
      const [users, total] = await Promise.all([
        User.find(query)
          .select(projection)
          .skip(skip)
          .limit(parseInt(limit))
          .sort(sort)
          .lean(),
        User.countDocuments(query)
      ]);

      // 返回用户数据和分页信息
      return {
        users,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit))
        }
      };
    } catch (error) {
      console.error('根据限制获取用户列表错误:', error);
      throw new AppError('获取用户列表失败', 500);
    }
  }

  // 家长管理
  async getAllParents(queryParams) {
    const { page = 1, limit = 10, status, search } = queryParams;
    const skip = (page - 1) * limit;

    // 构建查询条件
    const query = {};
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { 'nickname': { $regex: search, $options: 'i' } },
        { 'parentId': { $regex: search, $options: 'i' } },
        { 'location.city': { $regex: search, $options: 'i' } },
        { 'location.district': { $regex: search, $options: 'i' } },
      ];
    }

    try {
      // 并行执行查询和计数，提高性能
      const [parents, total] = await Promise.all([
        Parent.find(query)
          .skip(skip)
          .limit(parseInt(limit))
          .sort({ createdAt: -1 })
          .lean(),
        Parent.countDocuments(query)
      ]);

      return {
        parents,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit))
        }
      };
    } catch (error) {
      console.error('获取家长列表错误:', error);
      throw new AppError('获取家长列表失败', 500);
    }
  }

  async getParentsByLimit(page = 1, limit = 10, filters = {}) {
    try {
      const skip = (page - 1) * limit;
      
      // 构建查询条件
      const query = {};
      if (filters.status) query.status = filters.status;
      if (filters.city) query['location.city'] = filters.city;
      if (filters.district) query['location.district'] = filters.district;
      
      // 处理搜索条件
      if (filters.search) {
        query.$or = [
          { 'nickname': { $regex: filters.search, $options: 'i' } },
          { 'parentId': { $regex: filters.search, $options: 'i' } },
          { 'children.nickname': { $regex: filters.search, $options: 'i' } },
          { 'children.grade': { $regex: filters.search, $options: 'i' } },
        ];
      }
      
      // 构建排序条件
      let sort = { createdAt: -1 }; // 默认按创建时间降序
      if (filters.sortBy) {
        sort = { [filters.sortBy]: filters.sortOrder === 'desc' ? -1 : 1 };
      }

      // 并行执行查询和计数
      const [parents, total] = await Promise.all([
        Parent.find(query)
          .skip(skip)
          .limit(parseInt(limit))
          .sort(sort)
          .lean(),
        Parent.countDocuments(query)
      ]);

      // 返回家长数据和分页信息
      return {
        parents,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit))
        }
      };
    } catch (error) {
      console.error('根据限制获取家长列表错误:', error);
      throw new AppError('获取家长列表失败', 500);
    }
  }

  async getParentById(parentId) {
    try {
      const parent = await Parent.findOne({ parentId }).lean();
      
      if (!parent) {
        throw new AppError('未找到该家长', 404);
      }
      
      return parent;
    } catch (error) {
      console.error(`获取家长 ${parentId} 详情失败:`, error);
      throw new AppError(error.message, error.statusCode || 500);
    }
  }

  async getParentsByCity(cityName) {
    try {
      const parents = await Parent.find({ 'location.city': cityName }).lean();
      return parents;
    } catch (error) {
      console.error(`获取${cityName}家长列表失败:`, error);
      throw new AppError('获取家长列表失败', 500);
    }
  }

  async updateParentStatus(parentId, status) {
    try {
      const parent = await Parent.findOne({ parentId });
      
      if (!parent) {
        throw new AppError('未找到该家长', 404);
      }
      
      parent.status = status;
      await parent.save();
      
      return parent;
    } catch (error) {
      console.error(`更新家长 ${parentId} 状态失败:`, error);
      throw new AppError(error.message, error.statusCode || 500);
    }
  }

  async getParentStatistics() {
    try {
      // 家长总数
      const totalParents = await Parent.countDocuments();
      
      // 按城市分组统计
      const parentsByCity = await Parent.aggregate([
        {
          $group: {
            _id: "$location.city",
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]);
      
      // 按状态分组统计
      const parentsByStatus = await Parent.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 }
          }
        }
      ]);
      
      // 孩子年级分布
      const childrenByGrade = await Parent.aggregate([
        { $unwind: "$children" },
        {
          $group: {
            _id: "$children.grade",
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } }
      ]);
      
      // 最近注册的家长数量趋势（按天）
      const today = new Date();
      const last30Days = Array.from({ length: 30 }, (_, i) => {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        date.setHours(0, 0, 0, 0);
        return date;
      }).reverse();
      
      const registrationTrend = await Promise.all(
        last30Days.map(async (date) => {
          const nextDay = new Date(date);
          nextDay.setDate(date.getDate() + 1);
          
          const count = await Parent.countDocuments({
            createdAt: { $gte: date, $lt: nextDay }
          });
          
          return {
            date: date.toISOString().split('T')[0],
            count
          };
        })
      );
      
      return {
        totalParents,
        parentsByCity,
        parentsByStatus,
        childrenByGrade,
        registrationTrend
      };
    } catch (error) {
      console.error('获取家长统计数据失败:', error);
      throw new AppError('获取家长统计数据失败', 500);
    }
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
          pages: Math.ceil(total / parseInt(limit)),
        },
      };
    } catch (error) {
      throw new AppError(
        `获取城市 ${cityName} 的教师失败: ${error.message}`,
        500
      );
    }
  }

  // 根据指定的页码和每页数量获取教师数据
  async getTutorsByLimit(page = 1, limit = 10, filters = {}) {
    try {
      // 构建查询条件
      const query = {};
      const { 
        status, 
        isVerified, 
        city, 
        district, 
        subject, 
        search, 
        sortBy = 'createdAt', 
        sortOrder = 'desc' 
      } = filters;
      
      // 根据状态筛选
      if (status) query.status = status;
      
      // 根据验证状态筛选
      if (isVerified !== undefined) {
        query.isVerified = isVerified === 'true' || isVerified === true;
      }
      
      // 根据城市筛选
      if (city) {
        query['location.city'] = city;
      }
      
      // 根据区域筛选
      if (district) {
        query['location.district'] = district;
      }
      
      // 根据科目筛选
      if (subject) {
        query['subjects.name'] = subject;
      }
      
      // 搜索功能
      if (search) {
        query.$or = [
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
          { tutorId: { $regex: search, $options: 'i' } },
          { 'subjects.name': { $regex: search, $options: 'i' } },
          { 'location.city': { $regex: search, $options: 'i' } },
          { 'location.district': { $regex: search, $options: 'i' } }
        ];
      }

      // 计算跳过的文档数
      const skip = (parseInt(page) - 1) * parseInt(limit);
      
      // 构建排序对象
      const sort = {};
      sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

      // 并行执行查询和计数，提高性能
      const [tutors, total] = await Promise.all([
        TutorProfile.find(query)
          .skip(skip)
          .limit(parseInt(limit))
          .sort(sort)
          .lean(),
        TutorProfile.countDocuments(query)
      ]);

      // 返回教师数据和分页信息
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
      console.error('根据限制获取教师列表错误:', error);
      throw new AppError('获取教师列表失败', 500);
    }
  }

  // 内容审核
  async getAllPosts(queryParams) {
    const {
      page = 1,
      limit = 10,
      status,
      search,
      sort = 'createdAt',
    } = queryParams;
    const skip = (page - 1) * limit;

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
        sortOption = { createdAt: -1 };
        break;
      case 'grade':
        sortOption = { grade: 1 };
        break;
      case 'status':
        sortOption = { status: 1 };
        break;
      default:
        sortOption = { createdAt: -1 };
    }

    // 执行查询 - 确保返回requestId字段用于后续操作
    const posts = await TutoringRequest.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort(sortOption)
      .select(
        'requestId status grade subjects location preferences parentId createdAt reviewedAt'
      ); // 确保包含requestId

    const total = await TutoringRequest.countDocuments(query);

    // 注意：系统中所有对TutoringRequest的操作都应使用requestId而非_id
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

  async getAllPostsWithoutPagination(queryParams) {
    try {
      const { status, search, sort = 'createdAt' } = queryParams;

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
          sortOption = { createdAt: -1 };
          break;
        case 'grade':
          sortOption = { grade: 1 };
          break;
        case 'status':
          sortOption = { status: 1 };
          break;
        default:
          sortOption = { createdAt: -1 };
      }

      // 执行查询 - 不使用 skip 和 limit，获取所有符合条件的帖子
      const posts = await TutoringRequest.find(query)
        .sort(sortOption)
        .select(
          'requestId status grade subjects location preferences parentId createdAt reviewedAt'
        );

      const total = posts.length;

      return {
        posts,
        total,
      };
    } catch (error) {
      console.error('获取所有帖子错误:', error);
      throw new AppError('获取所有帖子失败', 500);
    }
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
    // 修改为使用requestId字段查找，而不是_id
    const post = await TutoringRequest.findOneAndDelete({ requestId: postId });

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
  async getRecentUsers(queryParams) {
    const { page = 1, limit = 5 } = queryParams;
    const skip = (page - 1) * limit;
    const users = await User.find({}).select('username name customId role status').sort({ createdAt: -1 }).skip(skip).limit(limit);
    return users;
  }
}

module.exports = new AdminService();
