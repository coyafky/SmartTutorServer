const TutoringRequestService = require('../services/TutoringRequestService');
const { AppError } = require('../utils/errorHandler');
const { log } = require('../utils/logger');

class TutoringRequestController {
  /**
   * 创建家教需求帖子
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   * @param {Function} next - 下一个中间件
   */
  static async createRequest(req, res, next) {
    try {
      const { user } = req;
      const requestData = req.body;

      const request = await TutoringRequestService.createRequest(user.customId, requestData);

      res.status(201).json({
        status: 'success',
        data: {
          request
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取家教需求帖子
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   * @param {Function} next - 下一个中间件
   */
  static async getRequest(req, res, next) {
    try {
      const { requestId } = req.params;
      const request = await TutoringRequestService.getRequest(requestId);

      res.status(200).json({
        status: 'success',
        data: {
          request
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 更新家教需求帖子
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   * @param {Function} next - 下一个中间件
   */
  static async updateRequest(req, res, next) {
    try {
      const { user } = req;
      const { requestId } = req.params;
      const updateData = req.body;

      const request = await TutoringRequestService.updateRequest(
        requestId,
        user.customId,
        updateData
      );

      res.status(200).json({
        status: 'success',
        data: {
          request
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 删除家教需求帖子
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   * @param {Function} next - 下一个中间件
   */
  static async deleteRequest(req, res, next) {
    try {
      const { user } = req;
      const { requestId } = req.params;

      await TutoringRequestService.deleteRequest(requestId, user.customId);

      res.status(204).json({
        status: 'success',
        data: null
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 查询家教需求帖子列表
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   * @param {Function} next - 下一个中间件
   */
  static async queryRequests(req, res, next) {
    try {
      const filters = {
        grade: req.query.grade,
        subjects: req.query.subjects ? req.query.subjects.split(',') : undefined,
        city: req.query.city,
        district: req.query.district,
        status: req.query.status
      };

      // 处理地理位置查询
      if (req.query.latitude && req.query.longitude) {
        filters.nearLocation = {
          latitude: parseFloat(req.query.latitude),
          longitude: parseFloat(req.query.longitude),
          maxDistance: req.query.maxDistance ? parseInt(req.query.maxDistance) : undefined
        };
      }

      const options = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10
      };

      const result = await TutoringRequestService.queryRequests(filters, options);

      res.status(200).json({
        status: 'success',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = TutoringRequestController;