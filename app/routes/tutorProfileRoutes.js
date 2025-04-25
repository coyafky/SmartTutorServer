const express = require('express');
const router = express.Router();
const TutorProfileController = require('../controllers/TutorProfileController');
// 修改这一行，使用已存在的 auth.js 中间件
const { authenticateToken, checkRole } = require('../middlewares/auth');

// 公共路由
router.get('/tutors', TutorProfileController.queryTutors);
router.get(
  '/tutors/subject/:subject',
  TutorProfileController.findTutorsBySubject
);
router.get(
  '/tutors/location/:city/:district?',
  TutorProfileController.findTutorsByLocation
);
router.get('/tutors/nearby', TutorProfileController.findNearbyTutors);
router.get('/tutors/:tutorId', TutorProfileController.getProfile);
router.post('/tutors/recommend', TutorProfileController.getRecommendedTutors);

// 需要认证的路由
router.use(authenticateToken);

// 教师资料卡管理（仅限教师角色）
router.post(
  '/profile',
  checkRole('teacher'),
  TutorProfileController.createProfile
);
router.get(
  '/profile',
  checkRole('teacher'),
  TutorProfileController.getMyProfile
);
router.patch(
  '/profile',
  checkRole('teacher'),
  TutorProfileController.updateProfile
);
router.delete(
  '/profile',
  checkRole('teacher'),
  TutorProfileController.deleteProfile
);

// 教师可用状态管理
router.patch(
  '/profile/status',
  checkRole('teacher'),
  TutorProfileController.updateAvailabilityStatus
);

// 科目管理
router.post(
  '/profile/subjects',
  checkRole('teacher'),
  TutorProfileController.addSubject
);
router.patch(
  '/profile/subjects/:subjectId',
  checkRole('teacher'),
  TutorProfileController.updateSubject
);
router.delete(
  '/profile/subjects/:subjectId',
  checkRole('teacher'),
  TutorProfileController.deleteSubject
);

// 成功案例管理
router.post(
  '/profile/subjects/:subjectId/cases',
  checkRole('teacher'),
  TutorProfileController.addSuccessCase
);
router.patch(
  '/profile/subjects/:subjectId/cases/:caseId',
  checkRole('teacher'),
  TutorProfileController.updateSuccessCase
);
router.delete(
  '/profile/subjects/:subjectId/cases/:caseId',
  checkRole('teacher'),
  TutorProfileController.deleteSuccessCase
);

// 课程时间管理
router.post(
  '/profile/sessions',
  checkRole('teacher'),
  TutorProfileController.addTimeSession
);
router.patch(
  '/profile/sessions/:sessionId',
  checkRole('teacher'),
  TutorProfileController.updateTimeSession
);
router.delete(
  '/profile/sessions/:sessionId',
  checkRole('teacher'),
  TutorProfileController.deleteTimeSession
);
router.patch(
  '/profile/default-times',
  checkRole('teacher'),
  TutorProfileController.updateDefaultTimes
);

// 其他信息管理
router.patch(
  '/profile/location',
  checkRole('teacher'),
  TutorProfileController.updateLocation
);
router.patch(
  '/profile/pricing',
  checkRole('teacher'),
  TutorProfileController.updatePricing
);
router.patch(
  '/profile/teaching-style',
  checkRole('teacher'),
  TutorProfileController.updateTeachingStyle
);

// 新增推荐接口
router.get(
  '/profile/recommended-requests',
  checkRole('teacher'),
  TutorProfileController.getRecommendedRequests
);

// 帖子查询相关接口
// 获取同城市帖子
router.get(
  '/profile/city-requests',
  checkRole('teacher'),
  TutorProfileController.getCityTutoringRequests
);

// 使用筛选条件获取帖子 (GET 与 POST 方法均支持)
router.get(
  '/profile/city-requests/filters',
  checkRole('teacher'),
  TutorProfileController.getCityTutoringRequestsWithFilters
);

// 添加与POST方法兼容的路由，以支持更复杂的筛选条件
router.post(
  '/profile/city-requests/filters',
  checkRole('teacher'),
  TutorProfileController.getCityTutoringRequestsWithFilters
);

// 获取指定城市的帖子
router.get(
  '/profile/requests/city/:cityName',
  checkRole('teacher'),
  TutorProfileController.getRequestsByCity
);

// 获取单个帖子详情
router.get(
  '/profile/requests/:requestId',
  checkRole('teacher'),
  TutorProfileController.getTutoringRequestById
);

module.exports = router;
