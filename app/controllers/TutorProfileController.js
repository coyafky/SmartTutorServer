const TutorProfileService = require('../services/TutorProfileService');
const { AppError } = require('../utils/errorHandler');
const { log } = require('../utils/logger');
const _ = require('lodash'); // 添加这行在文件顶部
class TutorProfileController {
  /**
   * 创建教师资料卡
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   * @param {Function} next - 下一个中间件
   */
  static async createProfile(req, res, next) {
    try {
      const { user } = req;
      const profileData = req.body;

      const profile = await TutorProfileService.createProfile(
        user.customId,
        profileData
      );

      res.status(201).json({
        status: 'success',
        data: {
          profile,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取教师资料卡
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   * @param {Function} next - 下一个中间件
   */
  static async getProfile(req, res, next) {
    try {
      const { tutorId } = req.params;
      const profile = await TutorProfileService.getProfile(tutorId);

      res.status(200).json({
        status: 'success',
        data: {
          profile,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取当前教师的资料卡
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   * @param {Function} next - 下一个中间件
   */
  static async getMyProfile(req, res, next) {
    try {
      const { user } = req;
      const profile = await TutorProfileService.getProfile(user.customId);

      res.status(200).json({
        status: 'success',
        data: {
          profile,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 更新教师资料卡
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   * @param {Function} next - 下一个中间件
   */
  static async updateProfile(req, res, next) {
    try {
      const { user } = req;
      const updateData = req.body;

      const profile = await TutorProfileService.updateProfile(
        user.customId,
        updateData
      );

      res.status(200).json({
        status: 'success',
        data: {
          profile,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 删除教师资料卡
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   * @param {Function} next - 下一个中间件
   */
  static async deleteProfile(req, res, next) {
    try {
      const { user } = req;

      await TutorProfileService.deleteProfile(user.customId);

      res.status(204).json({
        status: 'success',
        data: null,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 更新教师可用状态
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   * @param {Function} next - 下一个中间件
   */
  static async updateAvailabilityStatus(req, res, next) {
    try {
      const { user } = req;
      const { status } = req.body;

      if (!status) {
        throw new AppError('状态不能为空', 400);
      }

      const profile = await TutorProfileService.updateAvailabilityStatus(
        user.customId,
        status
      );

      res.status(200).json({
        status: 'success',
        data: {
          profile,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 添加教授科目
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   * @param {Function} next - 下一个中间件
   */
  static async addSubject(req, res, next) {
    try {
      const { user } = req;
      const subjectData = req.body;

      const profile = await TutorProfileService.addSubject(
        user.customId,
        subjectData
      );

      res.status(201).json({
        status: 'success',
        data: {
          profile,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 更新教授科目
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   * @param {Function} next - 下一个中间件
   */
  static async updateSubject(req, res, next) {
    try {
      const { user } = req;
      const { subjectId } = req.params;
      const updateData = req.body;

      const profile = await TutorProfileService.updateSubject(
        user.customId,
        subjectId,
        updateData
      );

      res.status(200).json({
        status: 'success',
        data: {
          profile,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 删除教授科目
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   * @param {Function} next - 下一个中间件
   */
  static async deleteSubject(req, res, next) {
    try {
      const { user } = req;
      const { subjectId } = req.params;

      const profile = await TutorProfileService.deleteSubject(
        user.customId,
        subjectId
      );

      res.status(200).json({
        status: 'success',
        data: {
          profile,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 添加成功案例
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   * @param {Function} next - 下一个中间件
   */
  static async addSuccessCase(req, res, next) {
    try {
      const { user } = req;
      const { subjectId } = req.params;
      const caseData = req.body;

      const profile = await TutorProfileService.addSuccessCase(
        user.customId,
        subjectId,
        caseData
      );

      res.status(201).json({
        status: 'success',
        data: {
          profile,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 更新成功案例
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   * @param {Function} next - 下一个中间件
   */
  static async updateSuccessCase(req, res, next) {
    try {
      const { user } = req;
      const { subjectId, caseId } = req.params;
      const updateData = req.body;

      const profile = await TutorProfileService.updateSuccessCase(
        user.customId,
        subjectId,
        caseId,
        updateData
      );

      res.status(200).json({
        status: 'success',
        data: {
          profile,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 删除成功案例
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   * @param {Function} next - 下一个中间件
   */
  static async deleteSuccessCase(req, res, next) {
    try {
      const { user } = req;
      const { subjectId, caseId } = req.params;

      const profile = await TutorProfileService.deleteSuccessCase(
        user.customId,
        subjectId,
        caseId
      );

      res.status(200).json({
        status: 'success',
        data: {
          profile,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 添加课程时间段
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   * @param {Function} next - 下一个中间件
   */
  static async addTimeSession(req, res, next) {
    try {
      const { user } = req;
      const sessionData = req.body;

      const profile = await TutorProfileService.addTimeSession(
        user.customId,
        sessionData
      );

      res.status(201).json({
        status: 'success',
        data: {
          profile,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 更新课程时间段
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   * @param {Function} next - 下一个中间件
   */
  static async updateTimeSession(req, res, next) {
    try {
      const { user } = req;
      const { sessionId } = req.params;
      const updateData = req.body;

      const profile = await TutorProfileService.updateTimeSession(
        user.customId,
        sessionId,
        updateData
      );

      res.status(200).json({
        status: 'success',
        data: {
          profile,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 删除课程时间段
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   * @param {Function} next - 下一个中间件
   */
  static async deleteTimeSession(req, res, next) {
    try {
      const { user } = req;
      const { sessionId } = req.params;

      const profile = await TutorProfileService.deleteTimeSession(
        user.customId,
        sessionId
      );

      res.status(200).json({
        status: 'success',
        data: {
          profile,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 更新默认时间设置
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   * @param {Function} next - 下一个中间件
   */
  static async updateDefaultTimes(req, res, next) {
    try {
      const { user } = req;
      const defaultTimes = req.body;

      const profile = await TutorProfileService.updateDefaultTimes(
        user.customId,
        defaultTimes
      );

      res.status(200).json({
        status: 'success',
        data: {
          profile,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 更新教师位置信息
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   * @param {Function} next - 下一个中间件
   */
  static async updateLocation(req, res, next) {
    try {
      const { user } = req;
      const locationData = req.body;

      const profile = await TutorProfileService.updateLocation(
        user.customId,
        locationData
      );

      res.status(200).json({
        status: 'success',
        data: {
          profile,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 更新教师价格设置
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   * @param {Function} next - 下一个中间件
   */
  static async updatePricing(req, res, next) {
    try {
      const { user } = req;
      const pricingData = req.body;

      const profile = await TutorProfileService.updatePricing(
        user.customId,
        pricingData
      );

      res.status(200).json({
        status: 'success',
        data: {
          profile,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 更新教师教学风格
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   * @param {Function} next - 下一个中间件
   */
  static async updateTeachingStyle(req, res, next) {
    try {
      const { user } = req;
      const styleData = req.body;

      const profile = await TutorProfileService.updateTeachingStyle(
        user.customId,
        styleData
      );

      res.status(200).json({
        status: 'success',
        data: {
          profile,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 查询教师列表
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   * @param {Function} next - 下一个中间件
   */
  static async queryTutors(req, res, next) {
    try {
      const filters = req.query;
      const options = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10,
        sortBy: req.query.sortBy || 'ratings.overall',
        sortOrder: req.query.sortOrder === 'asc' ? 1 : -1,
        fields: req.query.fields,
      };

      const result = await TutorProfileService.queryTutors(filters, options);

      res.status(200).json({
        status: 'success',
        data: {
          tutors: result.tutors,
          pagination: result.pagination,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 根据科目查询教师
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   * @param {Function} next - 下一个中间件
   */
  static async findTutorsBySubject(req, res, next) {
    try {
      const { subject } = req.params;
      const options = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10,
        sortBy: req.query.sortBy || 'ratings.overall',
        sortOrder: req.query.sortOrder === 'asc' ? 1 : -1,
        fields: req.query.fields,
      };

      const result = await TutorProfileService.findTutorsBySubject(
        subject,
        options
      );

      res.status(200).json({
        status: 'success',
        data: {
          tutors: result.tutors,
          pagination: result.pagination,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 根据地区查询教师
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   * @param {Function} next - 下一个中间件
   */
  static async findTutorsByLocation(req, res, next) {
    try {
      const { city, district } = req.params;
      const options = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10,
        sortBy: req.query.sortBy || 'ratings.overall',
        sortOrder: req.query.sortOrder === 'asc' ? 1 : -1,
        fields: req.query.fields,
      };

      const result = await TutorProfileService.findTutorsByLocation(
        city,
        district,
        options
      );

      res.status(200).json({
        status: 'success',
        data: {
          tutors: result.tutors,
          pagination: result.pagination,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 查询附近教师
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   * @param {Function} next - 下一个中间件
   */
  static async findNearbyTutors(req, res, next) {
    try {
      const { latitude, longitude, maxDistance } = req.query;

      if (!latitude || !longitude) {
        throw new AppError('缺少位置信息', 400);
      }

      const options = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10,
        sortBy: req.query.sortBy || 'ratings.overall',
        sortOrder: req.query.sortOrder === 'asc' ? 1 : -1,
        fields: req.query.fields,
      };

      const result = await TutorProfileService.findNearbyTutors(
        parseFloat(latitude),
        parseFloat(longitude),
        parseInt(maxDistance) || 5000,
        options
      );

      res.status(200).json({
        status: 'success',
        data: {
          tutors: result.tutors,
          pagination: result.pagination,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取推荐教师
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   * @param {Function} next - 下一个中间件
   */
  static async getRecommendedTutors(req, res, next) {
    try {
      const studentPreferences = req.body;

      const options = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10,
        sortBy: req.query.sortBy || 'ratings.overall',
        sortOrder: req.query.sortOrder === 'asc' ? 1 : -1,
        fields: req.query.fields,
      };

      const result = await TutorProfileService.getRecommendedTutors(
        studentPreferences,
        options
      );

      res.status(200).json({
        status: 'success',
        data: {
          tutors: result.tutors,
          pagination: result.pagination,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取教师所在城市的家教需求帖子
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   * @param {Function} next - 下一个中间件
   */
  static async getCityTutoringRequests(req, res, next) {
    try {
      const { user } = req;
      const options = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10,
        sortBy: req.query.sortBy || 'createdAt',
        sortOrder: req.query.sortOrder === 'asc' ? 1 : -1,
      };

      const result = await TutorProfileService.getCityTutoringRequests(
        user.customId,
        options
      );

      res.status(200).json({
        status: 'success',
        data: {
          requests: result.requests,
          pagination: result.pagination,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async getCityTutoringRequestsWithFilters(req, res, next) {
    try {
      const { user } = req;
      
      // 兼容 GET 和 POST 请求
      const filterData = req.method === 'POST' ? req.body : req.query;
      
      // 扩展筛选字段，增加区域和搜索功能
      const filters = _.pick(filterData, [
        'subject',
        'grade',
        'educationLevel',
        'minPrice',
        'maxPrice',
        'district',        // 添加区域筛选
        'teachingLocation', // 教学地点
        'teacherGender',    // 教师性别要求
        'teachingStyle',    // 教学风格
        'session.day',
        'session.period',
        'search',           // 搜索关键词
        'city'              // 允许指定城市
      ]);

      // 日志记录请求参数
      log.info(`教师${user.customId}获取筛选帖子，筛选条件:`, filters);
      
      const options = {
        page: parseInt(filterData.page) || 1,
        limit: parseInt(filterData.limit) || 10,
        sortBy: filterData.sortBy || 'createdAt',
        sortOrder: filterData.sortOrder === 'asc' ? 1 : -1,
      };

      // 转换数字参数
      if (filters.minPrice) filters.minPrice = Number(filters.minPrice);
      if (filters.maxPrice) filters.maxPrice = Number(filters.maxPrice);
      
      // 因为store端传来的可能是数组字符串，需要正确处理
      if (filters.teachingStyle && typeof filters.teachingStyle === 'string') {
        try {
          filters.teachingStyle = JSON.parse(filters.teachingStyle);
        } catch (e) {
          // 如果不是JSON格式，则作为单个元素数组处理
          filters.teachingStyle = [filters.teachingStyle];
        }
      }

      const result =
        await TutorProfileService.getCityTutoringRequestsWithFilters(
          user.customId,
          filters,
          options
        );

      res.status(200).json({
        status: 'success',
        data: {
          requests: result.requests,
          pagination: result.pagination,
        },
      });
    } catch (error) {
      log.error(`获取筛选帖子错误: ${error.message}`, error);
      next(error);
    }
  }

  static async getRecommendedRequests(req, res, next) {
    try {
      const { user } = req;
      const limit = parseInt(req.query.limit) || 3;

      const TutorRecommendationService = require('../services/TutorRecommendationService');
      const recommendedRequests = await TutorRecommendationService.getRecommendedRequests(
        user.customId,
        limit
      );

      res.status(200).json({
        status: 'success',
        data: {
          recommendations: recommendedRequests,
        },
      });
    } catch (error) {
      next(error);
    }
  }
  /**
   * 获取指定城市的家教需求帖子
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   * @param {Function} next - 下一个中间件
   */
  static async getRequestsByCity(req, res, next) {
    try {
      const { user } = req;
      const { cityName } = req.params;
      
      if (!cityName) {
        throw new AppError('城市名称不能为空', 400);
      }
      
      const options = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10,
        sortBy: req.query.sortBy || 'createdAt',
        sortOrder: req.query.sortOrder === 'asc' ? 1 : -1,
      };
      
      // 查询参数
      const filters = _.pick(req.query, [
        'subject',
        'grade',
        'district',
        'status',
        'search'
      ]);
      
      log.info(`教师 ${user.customId} 获取 ${cityName} 城市的帖子`);
      
      // 只查询已发布的帖子
      const result = await TutorProfileService.getRequestsByCity(
        cityName,
        filters,
        options,
        ['published', 'open']
      );
      
      res.status(200).json({
        status: 'success',
        data: {
          requests: result.requests,
          pagination: result.pagination
        }
      });
    } catch (error) {
      log.error(`获取城市帖子错误: ${error.message}`, error);
      next(error);
    }
  }
  
  /**
   * 获取指定帖子详情
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   * @param {Function} next - 下一个中间件
   */
  static async getTutoringRequestById(req, res, next) {
    try {
      const { requestId } = req.params;
      
      if (!requestId) {
        throw new AppError('帖子ID不能为空', 400);
      }
      
      log.info(`查询帖子详情, ID: ${requestId}`);
      
      // 调用服务层方法获取帖子
      const request = await TutorProfileService.getTutoringRequestById(requestId);
      
      // 返回结果
      res.status(200).json({
        status: 'success',
        data: { request }
      });
    } catch (error) {
      log.error(`获取帖子详情错误: ${error.message}`, error);
      next(error);
    }
  }
}

  

module.exports = TutorProfileController;
