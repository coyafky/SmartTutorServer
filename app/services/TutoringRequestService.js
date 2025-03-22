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

    // 验证 childId 是否属于该家长（如果提供了 childId）
    if (requestData.childId) {
      const childExists = parent.children.some(child => child.childId === requestData.childId);
      if (!childExists) {
        log.warn(`创建帖子失败: 子女ID ${requestData.childId} 不属于家长 ${parentId}`);
        throw new AppError('指定的子女不属于您', 400);
      }
    } else if (parent.children && parent.children.length > 0) {
      // 如果未指定子女ID且家长有子女，使用第一个子女ID
      requestData.childId = parent.children[0].childId;
      log.info(`未指定子女ID，默认使用家长的第一个子女: ${requestData.childId}`);
    } else {
      log.warn(`创建帖子失败: 家长 ${parentId} 没有子女信息，且未指定子女ID`);
      throw new AppError('请先添加子女信息或指定有效的子女ID', 400);
    }

    try {
      // 生成 requestId
      const timestamp = new Date().getTime();
      const parentIdWithoutPrefix = parentId.replace('PARENT_', '');

      // 查询该家长的帖子数量，用于生成序列号
      const requestCount = await TutoringRequest.countDocuments({
        parentId: parentId,  // 使用字符串ID而不是ObjectId
      });
      const sequenceNumber = (requestCount + 1).toString().padStart(2, '0');

      // 格式：REQUEST_ParentId_时间戳-序列号
      const requestId = `REQUEST_${parentIdWithoutPrefix}_${timestamp}-${sequenceNumber}`;

      // 创建帖子 - 使用字符串ID而不是ObjectId
      const request = await TutoringRequest.create({
        parentId: parentId,  // 使用字符串ID
        requestId,
        ...requestData,
      });

      // 更新家长统计信息
      await Parent.findByIdAndUpdate(parent._id, {
        $inc: { 'statistics.totalPosts': 1 },
      });

      log.info(`家教需求帖子创建成功: ${request._id}`);
      return request;
    } catch (error) {
      log.error(`创建家教需求帖子时发生错误: ${error.message}`, error);

      if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map((err) => err.message);
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

    // 使用 requestId 而不是 _id 进行查询
    const request = await TutoringRequest.findOne({ requestId });

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

    // 使用 requestId 和 parentId 字符串进行查询
    const request = await TutoringRequest.findOne({
      requestId: requestId,
      parentId: parentId,
    });

    if (!request) {
      log.warn(`更新帖子失败: 帖子 ${requestId} 不存在或无权限`);
      throw new AppError('帖子不存在或无权限', 404);
    }

    try {
      // 使用 findOneAndUpdate 而不是 findByIdAndUpdate
      const updatedRequest = await TutoringRequest.findOneAndUpdate(
        { requestId: requestId },
        { ...updateData },
        { new: true, runValidators: true }
      );

      log.info(`家教需求帖子更新成功: ${requestId}`);
      return updatedRequest;
    } catch (error) {
      log.error(`更新家教需求帖子时发生错误: ${error.message}`, error);

      if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map((err) => err.message);
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

    // 使用 requestId 和 parentId 字符串进行查询
    const request = await TutoringRequest.findOne({
      requestId: requestId,
      parentId: parentId,
    });

    if (!request) {
      log.warn(`删除帖子失败: 帖子 ${requestId} 不存在或无权限`);
      throw new AppError('帖子不存在或无权限', 404);
    }

    // 使用 findOneAndDelete 而不是 findByIdAndDelete
    await TutoringRequest.findOneAndDelete({ requestId: requestId });

    // 更新家长统计信息 - 使用 findOneAndUpdate 而不是 findByIdAndUpdate
    await Parent.findOneAndUpdate(
      { parentId: parentId },
      { $inc: { 'statistics.totalPosts': -1 } }
    );

    log.info(`家教需求帖子删除成功: ${requestId}`);
    return true;
  }

  /**
   * 获取指定家长的所有家教需求帖子
   * @param {String} parentId - 家长ID
   * @param {Object} options - 分页和筛选选项
   * @returns {Promise<Object>} - 帖子列表和总数
   */
  static async getRequestsByParentId(parentId, options = {}) {
    log.info(`获取家长 ${parentId} 的家教需求帖子`);
    
    // 构建查询条件
    const query = { parentId: parentId };
    
    // 如果指定了子女ID，添加到查询条件
    if (options.childId) {
      query.childId = options.childId;
    }
    
    // 如果指定了状态，添加到查询条件
    if (options.status) {
      query.status = options.status;
    }
    
    // 处理分页
    const page = parseInt(options.page) || 1;
    const limit = parseInt(options.limit) || 10;
    const skip = (page - 1) * limit;
    
    try {
      // 执行查询
      const [requests, total] = await Promise.all([
        TutoringRequest.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        TutoringRequest.countDocuments(query),
      ]);
      
      log.info(`找到 ${requests.length} 条家长 ${parentId} 的帖子`);
      
      return {
        requests,
        total,
        page,
        pages: Math.ceil(total / limit),
      };
    } catch (error) {
      log.error(`获取家长帖子时发生错误: ${error.message}`, error);
      throw error;
    }
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
    if (filters.parentId) {
      query.parentId = filters.parentId;
    }
    
    if (filters.childId) {
      query.childId = filters.childId;
    }
    
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
            coordinates: [longitude, latitude],
          },
          $maxDistance: maxDistance,
        },
      };
    }

    // 处理分页
    const page = parseInt(options.page) || 1;
    const limit = parseInt(options.limit) || 10;
    const skip = (page - 1) * limit;

    // 执行查询
    const [requests, total] = await Promise.all([
      TutoringRequest.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      TutoringRequest.countDocuments(query),
    ]);

    return {
      requests,
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  }
}

module.exports = TutoringRequestService;
