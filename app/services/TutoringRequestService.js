const TutoringRequest = require('../../models/TutoringRequest');
const Parent = require('../../models/Parent');
const { AppError } = require('../utils/errorHandler');
const { log } = require('../utils/logger');

class TutoringRequestService {
  /**
   * 创建家教需求帖子
   * @param {String} parentId - 家长ID
   * @param {Object} requestData - 帖子数据
   * @returns {Promise<Object>} - 创建的帖子
   */
  static async createRequest(parentId, requestData) {
    log.info(`尝试为家长 ${parentId} 创建家教需求帖子`);

    // 查找家长
    const parent = await Parent.findOne({ parentId });
    if (!parent) {
      log.warn(`创建帖子失败: 家长 ${parentId} 不存在`);
      throw new AppError('家长不存在', 404);
    }

    try {
      // 创建帖子
      const request = await TutoringRequest.create({
        parentId: parent._id,
        ...requestData,
      });

      // 更新家长统计信息
      await Parent.findByIdAndUpdate(parent._id, {
        $inc: { 'statistics.totalPosts': 1 }
      });

      log.info(`家教需求帖子创建成功: ${request._id}`);
      return request;
    } catch (error) {
      log.error(`创建家教需求帖子时发生错误: ${error.message}`, error);
      
      if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map(err => err.message);
        throw new AppError(`验证错误: ${messages.join(', ')}`, 400);
      }
      
      throw error;
    }
  }

  /**
   * 获取家教需求帖子
   * @param {String} requestId - 帖子ID
   * @returns {Promise<Object>} - 帖子信息
   */
  static async getRequest(requestId) {
    log.info(`获取家教需求帖子: ${requestId}`);

    const request = await TutoringRequest.findById(requestId)
      .populate('parentId', 'firstName lastName');

    if (!request) {
      log.warn(`获取帖子失败: 帖子 ${requestId} 不存在`);
      throw new AppError('帖子不存在', 404);
    }

    return request;
  }

  /**
   * 更新家教需求帖子
   * @param {String} requestId - 帖子ID
   * @param {String} parentId - 家长ID
   * @param {Object} updateData - 更新数据
   * @returns {Promise<Object>} - 更新后的帖子
   */
  static async updateRequest(requestId, parentId, updateData) {
    log.info(`尝试更新家教需求帖子: ${requestId}`);

    const request = await TutoringRequest.findOne({
      _id: requestId,
      parentId: parentId
    });

    if (!request) {
      log.warn(`更新帖子失败: 帖子 ${requestId} 不存在或无权限`);
      throw new AppError('帖子不存在或无权限', 404);
    }

    try {
      const updatedRequest = await TutoringRequest.findByIdAndUpdate(
        requestId,
        { ...updateData },
        { new: true, runValidators: true }
      );

      log.info(`家教需求帖子更新成功: ${requestId}`);
      return updatedRequest;
    } catch (error) {
      log.error(`更新家教需求帖子时发生错误: ${error.message}`, error);
      
      if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map(err => err.message);
        throw new AppError(`验证错误: ${messages.join(', ')}`, 400);
      }
      
      throw error;
    }
  }

  /**
   * 删除家教需求帖子
   * @param {String} requestId - 帖子ID
   * @param {String} parentId - 家长ID
   * @returns {Promise<Boolean>} - 删除结果
   */
  static async deleteRequest(requestId, parentId) {
    log.info(`尝试删除家教需求帖子: ${requestId}`);

    const request = await TutoringRequest.findOne({
      _id: requestId,
      parentId: parentId
    });

    if (!request) {
      log.warn(`删除帖子失败: 帖子 ${requestId} 不存在或无权限`);
      throw new AppError('帖子不存在或无权限', 404);
    }

    await TutoringRequest.findByIdAndDelete(requestId);

    // 更新家长统计信息
    await Parent.findByIdAndUpdate(parentId, {
      $inc: { 'statistics.totalPosts': -1 }
    });

    log.info(`家教需求帖子删除成功: ${requestId}`);
    return true;
  }

  /**
   * 查询家教需求帖子列表
   * @param {Object} filters - 筛选条件
   * @param {Object} options - 分页选项
   * @returns {Promise<Object>} - 帖子列表和总数
   */
  static async queryRequests(filters = {}, options = {}) {
    const query = {};

    // 处理筛选条件
    if (filters.grade) {
      query.grade = filters.grade;
    }

    if (filters.subjects) {
      query['subjects.name'] = { $in: filters.subjects };
    }

    if (filters.city) {
      query['location.city'] = filters.city;
      if (filters.district) {
        query['location.district'] = filters.district;
      }
    }

    if (filters.status) {
      query.status = filters.status;
    }

    // 处理地理位置查询
    if (filters.nearLocation) {
      const { latitude, longitude, maxDistance = 5000 } = filters.nearLocation;
      query['location.coordinates'] = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude]
          },
          $maxDistance: maxDistance
        }
      };
    }

    // 处理分页
    const page = parseInt(options.page) || 1;
    const limit = parseInt(options.limit) || 10;
    const skip = (page - 1) * limit;

    // 执行查询
    const [requests, total] = await Promise.all([
      TutoringRequest.find(query)
        .populate('parentId', 'firstName lastName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      TutoringRequest.countDocuments(query)
    ]);

    return {
      requests,
      total,
      page,
      pages: Math.ceil(total / limit)
    };
  }
}

module.exports = TutoringRequestService;