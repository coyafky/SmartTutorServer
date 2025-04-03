const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/AdminController');
const { authenticateToken, checkRole } = require('../middlewares/auth');

// 所有路由都需要认证和管理员权限
router.use(authenticateToken);
router.use(checkRole('admin'));

// 用户管理
router.get('/users', AdminController.getAllUsers);
router.get('/users/limit', AdminController.getAllUserByLimit);
router.get('/users/:userId', AdminController.getUserById);
router.patch('/users/:userId', AdminController.updateUser);
router.delete('/users/:userId', AdminController.deleteUser);
router.patch('/users/:userId/status', AdminController.updateUserStatus);
router.patch('/users/:userId/role', AdminController.updateUserRole);

// 教师管理
router.get('/tutors', AdminController.getAllTutors);
router.get('/tutors/limit', AdminController.getAllTutorsLimit);
router.get('/tutors/city/:cityName', AdminController.getTutorsByCity);
router.get('/tutors/:tutorId', AdminController.getTutorById);
router.patch('/tutors/:tutorId/verify', AdminController.verifyTutor);
router.patch('/tutors/:tutorId/status', AdminController.updateTutorStatus);

// 内容审核
router.get('/posts', AdminController.getAllPosts);
router.get('/posts/city/:cityName', AdminController.getPostsByCity);
router.get('/posts/:postId', AdminController.getPostById);
router.patch('/posts/:postId/status', AdminController.updatePostStatus);
router.delete('/posts/:postId', AdminController.deletePost);
router.post('/posts/:postId/review', AdminController.reviewPost);

// 系统设置
router.get('/settings', AdminController.getSystemSettings);
router.patch('/settings', AdminController.updateSystemSettings);

// 数据统计
router.get('/statistics/users', AdminController.getUserStatistics);
router.get('/statistics/tutors', AdminController.getTutorStatistics);
router.get('/statistics/posts', AdminController.getPostStatistics);
router.get('/statistics/matches', AdminController.getMatchStatistics);

module.exports = router;
