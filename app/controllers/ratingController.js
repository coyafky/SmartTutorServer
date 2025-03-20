/**
 * 评价系统控制器
 * 处理评价相关的HTTP请求
 * @module controllers/ratingController
 */

const RatingService = require('../services/RatingService');

/**
 * 创建新评价
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @returns {Promise<void>}
 */
exports.createRating = async (req, res) => {
  try {
    const ratingData = req.body;
    
    // 设置评价者ID和类型
    ratingData.ratedBy = req.user.id;
    ratingData.raterType = req.user.role === 'parent' ? 'parent' : 'tutor';
    
    const rating = await RatingService.createRating(ratingData);
    
    res.status(201).json({
      status: 'success',
      data: rating
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

/**
 * 获取用户收到的评价
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @returns {Promise<void>}
 */
exports.getUserRatings = async (req, res) => {
  try {
    const userId = req.params.userId;
    const userType = req.params.userType;
    
    // 验证用户类型
    if (!['tutor', 'parent'].includes(userType)) {
      return res.status(400).json({
        status: 'error',
        message: '无效的用户类型'
      });
    }
    
    const options = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10
    };
    
    const result = await RatingService.getUserRatings(userId, userType, options);
    
    res.status(200).json({
      status: 'success',
      data: result.ratings,
      pagination: result.pagination
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

/**
 * 获取用户的评价统计
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @returns {Promise<void>}
 */
exports.getUserRatingStats = async (req, res) => {
  try {
    const userId = req.params.userId;
    const userType = req.params.userType;
    
    // 验证用户类型
    if (!['tutor', 'parent'].includes(userType)) {
      return res.status(400).json({
        status: 'error',
        message: '无效的用户类型'
      });
    }
    
    const stats = await RatingService.getUserRatingStats(userId, userType);
    
    res.status(200).json({
      status: 'success',
      data: stats
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

/**
 * 获取匹配的评价
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @returns {Promise<void>}
 */
exports.getMatchRatings = async (req, res) => {
  try {
    const matchId = req.params.matchId;
    
    const ratings = await RatingService.getMatchRatings(matchId);
    
    res.status(200).json({
      status: 'success',
      data: ratings
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

/**
 * 更新评价
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @returns {Promise<void>}
 */
exports.updateRating = async (req, res) => {
  try {
    const ratingId = req.params.ratingId;
    const updateData = req.body;
    
    const rating = await RatingService.updateRating(ratingId, updateData);
    
    res.status(200).json({
      status: 'success',
      data: rating
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

/**
 * 删除评价
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @returns {Promise<void>}
 */
exports.deleteRating = async (req, res) => {
  try {
    const ratingId = req.params.ratingId;
    
    await RatingService.deleteRating(ratingId);
    
    res.status(200).json({
      status: 'success',
      message: '评价已成功删除'
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};
