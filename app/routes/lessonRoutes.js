/**
 * 课程路由
 * 处理与课程相关的API路由
 */

const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const LessonController = require('../controllers/LessonController');
const { authenticateToken } = require('../middleware/auth');

// 所有课程路由都需要身份验证
router.use(authenticateToken);

/**
 * @route POST /api/lessons
 * @desc 创建新课程
 * @access 私有
 */
router.post('/', [
  check('tutorId', '教师ID是必需的').not().isEmpty(),
  check('parentId', '家长ID是必需的').not().isEmpty(),
  check('student.name', '学生姓名是必需的').not().isEmpty(),
  check('subject', '学科是必需的').not().isEmpty(),
  check('date', '日期是必需的').isISO8601(),
  check('startTime', '开始时间是必需的').not().isEmpty(),
  check('endTime', '结束时间是必需的').not().isEmpty()
], LessonController.createLesson);

/**
 * @route GET /api/lessons/:lessonId
 * @desc 获取课程详情
 * @access 私有
 */
router.get('/:lessonId', LessonController.getLessonById);

/**
 * @route PUT /api/lessons/:lessonId
 * @desc 更新课程信息
 * @access 私有
 */
router.put('/:lessonId', LessonController.updateLesson);

/**
 * @route PATCH /api/lessons/:lessonId/status
 * @desc 更新课程状态
 * @access 私有
 */
router.patch('/:lessonId/status', [
  check('status', '状态是必需的').isIn(['pending', 'confirmed', 'cancelled', 'completed'])
], LessonController.updateLessonStatus);

/**
 * @route DELETE /api/lessons/:lessonId
 * @desc 删除课程
 * @access 私有
 */
router.delete('/:lessonId', LessonController.deleteLesson);

/**
 * @route GET /api/lessons
 * @desc 获取用户的课程列表
 * @access 私有
 */
router.get('/', LessonController.getUserLessons);

/**
 * @route GET /api/lessons/calendar
 * @desc 获取用户的日历视图课程
 * @access 私有
 */
router.get('/calendar', LessonController.getLessonCalendar);

/**
 * @route POST /api/lessons/:lessonId/materials
 * @desc 添加课程材料
 * @access 私有
 */
router.post('/:lessonId/materials', [
  check('title', '标题是必需的').not().isEmpty(),
  check('fileUrl', '文件URL是必需的').not().isEmpty()
], LessonController.addLessonMaterial);

/**
 * @route POST /api/lessons/reminders/process
 * @desc 处理课程提醒（定时任务调用）
 * @access 私有（仅管理员）
 */
router.post('/reminders/process', LessonController.processLessonReminders);

module.exports = router;
