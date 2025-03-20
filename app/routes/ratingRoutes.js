/**
 * 评价系统路由
 * 定义评价相关的API路由
 * @module routes/ratingRoutes
 */

const express = require('express');
const router = express.Router();
const ratingController = require('../controllers/ratingController');
const { protect, restrictTo } = require('../middlewares/authMiddleware');

/**
 * @route POST /api/ratings
 * @desc 创建新评价
 * @access 私有 (需要登录)
 */
router.post('/', protect, ratingController.createRating);

/**
 * @route GET /api/ratings/users/:userId/:userType
 * @desc 获取用户收到的评价
 * @access 公开
 */
router.get('/users/:userId/:userType', ratingController.getUserRatings);

/**
 * @route GET /api/ratings/stats/users/:userId/:userType
 * @desc 获取用户的评价统计
 * @access 公开
 */
router.get('/stats/users/:userId/:userType', ratingController.getUserRatingStats);

/**
 * @route GET /api/ratings/matches/:matchId
 * @desc 获取匹配的评价
 * @access 私有 (需要登录)
 */
router.get('/matches/:matchId', protect, ratingController.getMatchRatings);

/**
 * @route PUT /api/ratings/:ratingId
 * @desc 更新评价
 * @access 私有 (需要登录且是评价的创建者)
 */
router.put('/:ratingId', protect, ratingController.updateRating);

/**
 * @route DELETE /api/ratings/:ratingId
 * @desc 删除评价
 * @access 私有 (需要登录且是评价的创建者或管理员)
 */
router.delete('/:ratingId', protect, restrictTo('admin'), ratingController.deleteRating);

module.exports = router;
