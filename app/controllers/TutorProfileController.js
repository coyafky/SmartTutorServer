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
      const filters = _.pick(req.query, [
        'subject',
        'grade',
        'educationLevel',
        'minPrice',
        'maxPrice',
        'session.day',
        'session.period',
      ]);
      const options = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10,
        sortBy: req.query.sortBy || 'createdAt',
        sortOrder: req.query.sortOrder === 'asc' ? 1 : -1,
      };

      // 转换价格参数为数字类型
      if (filters.minPrice) filters.minPrice = Number(filters.minPrice);
      if (filters.maxPrice) filters.maxPrice = Number(filters.maxPrice);

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
}

module.exports = TutorProfileController;
