/**
 * 推荐路由
 * 定义与推荐功能相关的路由
 * @module routes/recommendationRoutes
 */

const express = require('express');
const router = express.Router();
const RecommendationController = require('../controllers/RecommendationController');
const { authenticateToken, checkRole } = require('../middlewares/auth');

/**
 * @route GET /api/recommendations/tutor/requests
 * @desc 获取推荐给教师的家教需求
 * @access 私有 - 仅教师
 * @query {Boolean} useML - 是否使用机器学习推荐
 * @query {Number} limit - 返回结果数量限制
 * @query {Number} maxDistance - 最大距离限制（公里）
 */
router.get(
  '/tutor/requests',
  authenticateToken,
  checkRole('teacher'),
  RecommendationController.getRecommendedRequestsForTutor
);

/**
 * @route GET /api/recommendations/parent/tutors
 * @desc 获取推荐给家长的教师
 * @access 私有 - 仅家长
 * @query {Boolean} useML - 是否使用机器学习推荐
 * @query {Number} limit - 返回结果数量限制
 * @query {Number} maxDistance - 最大距离限制（公里）
 */
router.get(
  '/parent/tutors',
  authenticateToken,
  checkRole('parent'),
  RecommendationController.getRecommendedTutorsForParent
);

/**
 * @route POST /api/recommendations/feedback
 * @desc 提交匹配反馈
 * @access 私有 - 所有用户
 * @body {String} matchId - 匹配ID
 * @body {Number} rating - 评分（1-5）
 * @body {String} review - 评价内容（可选）
 * @body {String} role - 角色（parent或tutor）
 */
router.post(
  '/feedback',
  authenticateToken,
  RecommendationController.submitMatchFeedback
);

/**
 * @route POST /api/recommendations/train
 * @desc 手动触发推荐模型训练
 * @access 私有 - 仅管理员
 */
router.post(
  '/train',
  authenticateToken,
  checkRole('admin'),
  RecommendationController.trainRecommendationModel
);

module.exports = router;
