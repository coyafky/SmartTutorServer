/**
 * 推荐控制器
 * 处理与推荐功能相关的请求
 * @module controllers/RecommendationController
 */

const RecommendationService = require('../services/RecommendationService');

/**
 * 推荐控制器类
 * 提供推荐相关的API接口
 */
class RecommendationController {
  /**
   * 为教师推荐家教需求
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   * @returns {Promise<void>}
   */
  async getRecommendedRequestsForTutor(req, res) {
    try {
      const tutorId = req.user.id; // 从认证中获取教师ID
      const { limit, maxDistance, useML } = req.query;
      
      const options = {
        limit: limit ? parseInt(limit, 10) : 10,
        maxDistance: maxDistance ? parseFloat(maxDistance) : 10
      };
      
      // 使用传统推荐方法
      const recommendations = await RecommendationService.recommendRequestsForTutor(tutorId, options);
      
      return res.status(200).json({
        success: true,
        data: recommendations,
        message: '获取推荐家教需求成功'
      });
    } catch (error) {
      console.error('获取推荐家教需求失败:', error);
      return res.status(500).json({
        success: false,
        message: '获取推荐家教需求失败',
        error: error.message
      });
    }
  }
  
  /**
   * 为家长推荐教师
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   * @returns {Promise<void>}
   */
  async getRecommendedTutorsForParent(req, res) {
    try {
      const parentId = req.user.id; // 从认证中获取家长ID
      const { limit, maxDistance, useML } = req.query;
      
      const options = {
        limit: limit ? parseInt(limit, 10) : 10,
        maxDistance: maxDistance ? parseFloat(maxDistance) : 10
      };
      
      // 使用传统推荐方法
      const recommendations = await RecommendationService.recommendTutorsForParent(parentId, options);
      
      return res.status(200).json({
        success: true,
        data: recommendations,
        message: '获取推荐教师成功'
      });
    } catch (error) {
      console.error('获取推荐教师失败:', error);
      return res.status(500).json({
        success: false,
        message: '获取推荐教师失败',
        error: error.message
      });
    }
  }
  
  /**
   * 提交匹配反馈
   * 收集用户对匹配结果的反馈，用于改进推荐算法
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   * @returns {Promise<void>}
   */
  async submitMatchFeedback(req, res) {
    try {
      const { matchId, rating, review, role } = req.body;
      
      if (!matchId || !rating || !role) {
        return res.status(400).json({
          success: false,
          message: '缺少必要参数'
        });
      }
      
      // 验证评分范围
      if (rating < 1 || rating > 5) {
        return res.status(400).json({
          success: false,
          message: '评分必须在1-5之间'
        });
      }
      
      // 验证角色
      if (role !== 'parent' && role !== 'tutor') {
        return res.status(400).json({
          success: false,
          message: '角色必须是parent或tutor'
        });
      }
      
      // 收集反馈
      const result = await RecommendationService.collectFeedback(matchId, {
        rating,
        review: review || '',
        role
      });
      
      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: result.message
        });
      }
      
      return res.status(200).json({
        success: true,
        message: '反馈提交成功'
      });
    } catch (error) {
      console.error('提交匹配反馈失败:', error);
      return res.status(500).json({
        success: false,
        message: '提交匹配反馈失败',
        error: error.message
      });
    }
  }
  
  /**
   * 训练推荐模型
   * 此方法已废弃，因为我们不再使用机器学习模型
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   * @returns {Promise<void>}
   */
  async trainRecommendationModel(req, res) {
    return res.status(200).json({
      success: true,
      message: '系统已不再使用机器学习模型，此功能已废弃'
    });
  }
}



module.exports = new RecommendationController();
