const express = require('express');
const router = express.Router();
const ParentProfileController = require('../controllers/ParentProfileController');
const TutoringRequestController = require('../controllers/TutoringRequestController');
const { authenticateToken, checkRole } = require('../middlewares/auth');
const { validateParentRole } = require('../middlewares/roleValidator');

// 创建家长档案
router.post(
  '/',
  authenticateToken,
  validateParentRole,
  ParentProfileController.createProfile
);

// 获取家长档案
router.get('/:parentId', authenticateToken, ParentProfileController.getProfile);

// 更新家长档案
router.put(
  '/:parentId',
  authenticateToken,
  validateParentRole,
  ParentProfileController.updateProfile
);

// 删除家长档案
router.delete(
  '/:parentId',
  authenticateToken,
  ParentProfileController.deleteProfile
);

// 子女管理相关路由
// 添加子女信息
router.post(
  '/:parentId/children',
  authenticateToken,
  validateParentRole,
  ParentProfileController.addChild
);

// 获取子女信息列表
router.get(
  '/:parentId/children',
  authenticateToken,
  ParentProfileController.getChildren
);

// 获取单个子女信息
router.get(
  '/:parentId/children/:childId',
  authenticateToken,
  ParentProfileController.getChild
);

// 更新子女信息
router.put(
  '/:parentId/children/:childId',
  authenticateToken,
  validateParentRole,
  ParentProfileController.updateChild
);

// 删除子女信息
router.delete(
  '/:parentId/children/:childId',
  authenticateToken,
  validateParentRole,
  ParentProfileController.deleteChild
);

// 教师筛选相关路由
// 获取同城市的教师列表
router.get(
  '/:parentId/tutors/city',
  authenticateToken,
  ParentProfileController.getTutorsByCity
);

// 按科目筛选教师
router.get(
  '/:parentId/tutors/subject',
  authenticateToken,
  ParentProfileController.getTutorsBySubject
);

// 按地理位置筛选教师
router.get(
  '/:parentId/tutors/location',
  authenticateToken,
  ParentProfileController.getTutorsByLocation
);

// 按价格区间筛选教师
router.get(
  '/:parentId/tutors/price',
  authenticateToken,
  ParentProfileController.getTutorsByPriceRange
);

// 按学历筛选教师
router.get(
  '/:parentId/tutors/education',
  authenticateToken,
  ParentProfileController.getTutorsByEducation
);

// 按开课时间筛选教师
router.get(
  '/:parentId/tutors/session',
  authenticateToken,
  ParentProfileController.getTutorsBySession
);

// 多条件筛选教师
router.get(
  '/:parentId/tutors/filter',
  authenticateToken,
  ParentProfileController.getTutorsByMultipleConditions
);

// 按科目和价格区间筛选教师
router.get(
  '/:parentId/tutors/subject-price',
  authenticateToken,
  ParentProfileController.getTutorsBySubjectAndPrice
);

// 按科目、学历和评分筛选教师
router.get(
  '/:parentId/tutors/subject-education-rating',
  authenticateToken,
  ParentProfileController.getTutorsBySubjectEducationAndRating
);

// 按开课时间、科目和教学经验筛选教师
router.get(
  '/:parentId/tutors/session-subject-experience',
  authenticateToken,
  ParentProfileController.getTutorsBySessionSubjectAndExperience
);

// 家教需求帖子相关路由
// 创建家教需求帖子
router.post(
  '/:parentId/tutoringRequests',
  authenticateToken,
  validateParentRole,
  TutoringRequestController.createRequest
);

// 为特定子女创建家教需求帖子
router.post(
  '/:parentId/children/:childId/tutoringRequests',
  authenticateToken,
  validateParentRole,
  (req, res, next) => {
    // 将路由参数中的 childId 添加到请求体中
    req.body.childId = req.params.childId;
    next();
  },
  TutoringRequestController.createRequest
);

// 获取家长的所有家教需求帖子
router.get(
  '/:parentId/tutoringRequests',
  authenticateToken,
  TutoringRequestController.getParentRequests
);

// 获取家长为特定子女发布的家教需求帖子
router.get(
  '/:parentId/children/:childId/tutoringRequests',
  authenticateToken,
  (req, res, next) => {
    // 将路由参数中的 childId 添加到查询参数中
    req.query.childId = req.params.childId;
    next();
  },
  TutoringRequestController.getParentRequests
);

// 获取家长的单个家教需求帖子
router.get(
  '/:parentId/tutoringRequests/:requestId',
  authenticateToken,
  TutoringRequestController.getRequest
);

// 更新家教需求帖子
router.put(
  '/:parentId/tutoringRequests/:requestId',
  authenticateToken,
  validateParentRole,
  TutoringRequestController.updateRequest
);

// 删除家教需求帖子
router.delete(
  '/:parentId/tutoringRequests/:requestId',
  authenticateToken,
  validateParentRole,
  TutoringRequestController.deleteRequest
);

module.exports = router;
