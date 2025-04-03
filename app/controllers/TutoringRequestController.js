const TutoringRequestService = require('../services/TutoringRequestService');
const Parent = require('../../models/Parent');
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
      const parentId = req.params.parentId || req.user.customId;
      const requestData = req.body;

      // 如果状态为"open"，修改为"published"
      if (requestData.status === 'open') {
        console.log('将请求状态从 "open" 修改为 "published"');
        requestData.status = 'published';
        // 添加自定义字段记录原始状态
        requestData.customStatus = 'open';
      }

      // 验证必填字段
      if (!requestData.grade) {
        throw new AppError('年级是必填项', 400);
      }

      if (!requestData.location) {
        throw new AppError('上课地点信息是必填项', 400);
      }

      // 处理地理位置坐标格式
      if (requestData.location) {
        // 如果使用旧格式（latitude 和 longitude 分开）
        if (
          requestData.location.coordinates &&
          requestData.location.coordinates.latitude !== undefined &&
          requestData.location.coordinates.longitude !== undefined
        ) {
          const lat = parseFloat(requestData.location.coordinates.latitude);
          const lng = parseFloat(requestData.location.coordinates.longitude);

          // 转换为 GeoJSON 格式
          requestData.location.coordinates = {
            type: 'Point',
            coordinates: [lng, lat], // MongoDB GeoJSON 要求经度在前，纬度在后
          };

          log.info(
            '坐标格式已转换为 GeoJSON 格式:',
            requestData.location.coordinates
          );
        }
        // 如果已经是 GeoJSON 格式但 coordinates 为空
        else if (
          requestData.location.coordinates &&
          requestData.location.coordinates.type === 'Point' &&
          (!requestData.location.coordinates.coordinates ||
            requestData.location.coordinates.coordinates.length === 0)
        ) {
          throw new AppError('坐标数据不完整，请提供经纬度值', 400);
        }
      }

      if (!requestData.preferences) {
        throw new AppError('教学偏好是必填项', 400);
      }

      // 确保 status 字段值有效
      if (
        requestData.status &&
        !['open', 'closed', 'archived'].includes(requestData.status)
      ) {
        requestData.status = 'open'; // 设置默认值
      }

      // 查找家长并验证子女ID
      const parent = await Parent.findOne({ parentId });
      if (!parent) {
        throw new AppError('家长不存在', 404);
      }

      // 验证或设置 childId
      if (requestData.childId) {
        // 验证指定的子女ID是否属于该家长
        const childExists = parent.children.some(
          (child) => child.childId === requestData.childId
        );
        if (!childExists) {
          throw new AppError('指定的子女不属于您', 400);
        }
      } else if (parent.children && parent.children.length > 0) {
        // 如果未指定子女ID，使用第一个子女
        requestData.childId = parent.children[0].childId;
        log.info(
          `未指定子女ID，默认使用家长的第一个子女: ${requestData.childId}`
        );
      } else {
        throw new AppError('请先添加子女信息或指定有效的子女ID', 400);
      }

      // 确保使用字符串形式的 parentId
      requestData.parentId = parentId;

      const request = await TutoringRequestService.createRequest(
        parentId,
        requestData
      );

      res.status(201).json({
        status: 'success',
        data: {
          request,
        },
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
          request,
        },
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
      const parentId = req.params.parentId || req.user.customId;
      const { requestId } = req.params;
      const updateData = req.body;

      const request = await TutoringRequestService.updateRequest(
        requestId,
        parentId,
        updateData
      );

      res.status(200).json({
        status: 'success',
        data: {
          request,
        },
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
      const parentId = req.params.parentId || req.user.customId;
      const { requestId } = req.params;

      await TutoringRequestService.deleteRequest(requestId, parentId);

      res.status(200).json({
        status: 'success',
        data: null,
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
        subjects: req.query.subjects
          ? req.query.subjects.split(',')
          : undefined,
        city: req.query.city,
        district: req.query.district,
        status: req.query.status,
      };

      // 处理地理位置查询
      if (req.query.latitude && req.query.longitude) {
        filters.nearLocation = {
          latitude: parseFloat(req.query.latitude),
          longitude: parseFloat(req.query.longitude),
          maxDistance: req.query.maxDistance
            ? parseInt(req.query.maxDistance)
            : undefined,
        };
      }

      const options = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10,
      };

      const result = await TutoringRequestService.queryRequests(
        filters,
        options
      );

      res.status(200).json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
  /**
   * 获取家长的所有家教需求帖子
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   * @param {Function} next - 下一个中间件
   */
  static async getParentRequests(req, res, next) {
    try {
      const { parentId } = req.params;
      const { childId, status } = req.query;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      // 查找家长的所有帖子
      const parent = await Parent.findOne({ parentId });
      if (!parent) {
        throw new AppError('家长不存在', 404);
      }

      // 构建选项
      const options = { page, limit };

      // 如果提供了 childId，则添加到选项中
      if (childId) {
        // 验证该子女是否属于该家长
        const childExists = parent.children.some(
          (child) => child.childId === childId
        );
        if (!childExists) {
          throw new AppError('指定的子女不属于您', 400);
        }
        options.childId = childId;
      }

      // 如果提供了状态筛选
      if (status && ['open', 'closed', 'archived'].includes(status)) {
        options.status = status;
      }

      // 使用新的专用方法获取家长的帖子
      const result = await TutoringRequestService.getRequestsByParentId(
        parentId,
        options
      );

      res.status(200).json({
        status: 'success',
        results: result.requests.length,
        data: {
          requests: result.requests,
          pagination: {
            totalResults: result.total,
            totalPages: result.pages,
            currentPage: result.page,
            limit: limit,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = TutoringRequestController;
