/**
 * 教师推荐控制器
 * 处理教师推荐相关的请求
 */

const TutorRecommendationService = require('../services/TutorRecommendationService');
const { log } = require('../utils/logger');

class TutorRecommendationController {
  /**
   * 获取推荐的家教需求帖子
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   * @param {Function} next - 下一个中间件
   */
  static async getRecommendedRequests(req, res, next) {
    try {
      const { user } = req;
      const limit = parseInt(req.query.limit) || 3;

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

module.exports = TutorRecommendationController;
