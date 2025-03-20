/**
 * 课程控制器
 * 处理与课程相关的HTTP请求
 */

const LessonService = require('../services/LessonService');
const { validationResult } = require('express-validator');

class LessonController {
  /**
   * 创建新课程
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   * @returns {Object} - JSON响应
   */
  static async createLesson(req, res) {
    try {
      // 验证请求数据
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      
      const { conversationId, ...lessonData } = req.body;
      
      // 创建课程
      const lesson = await LessonService.createLesson(lessonData, conversationId);
      
      return res.status(201).json({
        success: true,
        message: '课程创建成功',
        data: lesson
      });
    } catch (error) {
      console.error('创建课程失败:', error);
      return res.status(500).json({
        success: false,
        message: error.message || '创建课程失败'
      });
    }
  }
  
  /**
   * 获取课程详情
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   * @returns {Object} - JSON响应
   */
  static async getLessonById(req, res) {
    try {
      const { lessonId } = req.params;
      
      // 获取课程详情
      const lesson = await LessonService.getLessonById(lessonId);
      
      return res.status(200).json({
        success: true,
        data: lesson
      });
    } catch (error) {
      console.error('获取课程详情失败:', error);
      return res.status(500).json({
        success: false,
        message: error.message || '获取课程详情失败'
      });
    }
  }
  
  /**
   * 更新课程信息
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   * @returns {Object} - JSON响应
   */
  static async updateLesson(req, res) {
    try {
      // 验证请求数据
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      
      const { lessonId } = req.params;
      const { conversationId, ...updateData } = req.body;
      
      // 更新课程
      const lesson = await LessonService.updateLesson(lessonId, updateData, conversationId);
      
      return res.status(200).json({
        success: true,
        message: '课程更新成功',
        data: lesson
      });
    } catch (error) {
      console.error('更新课程失败:', error);
      return res.status(500).json({
        success: false,
        message: error.message || '更新课程失败'
      });
    }
  }
  
  /**
   * 更新课程状态
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   * @returns {Object} - JSON响应
   */
  static async updateLessonStatus(req, res) {
    try {
      // 验证请求数据
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      
      const { lessonId } = req.params;
      const { status, conversationId } = req.body;
      const userId = req.user.id;
      
      // 更新课程状态
      const lesson = await LessonService.updateLessonStatus(lessonId, status, conversationId, userId);
      
      return res.status(200).json({
        success: true,
        message: `课程状态已更新为 ${status}`,
        data: lesson
      });
    } catch (error) {
      console.error('更新课程状态失败:', error);
      return res.status(500).json({
        success: false,
        message: error.message || '更新课程状态失败'
      });
    }
  }
  
  /**
   * 删除课程
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   * @returns {Object} - JSON响应
   */
  static async deleteLesson(req, res) {
    try {
      const { lessonId } = req.params;
      
      // 删除课程
      const success = await LessonService.deleteLesson(lessonId);
      
      if (!success) {
        return res.status(404).json({
          success: false,
          message: '课程不存在或已删除'
        });
      }
      
      return res.status(200).json({
        success: true,
        message: '课程已删除'
      });
    } catch (error) {
      console.error('删除课程失败:', error);
      return res.status(500).json({
        success: false,
        message: error.message || '删除课程失败'
      });
    }
  }
  
  /**
   * 获取用户的课程列表
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   * @returns {Object} - JSON响应
   */
  static async getUserLessons(req, res) {
    try {
      const userId = req.user.id;
      const { role, status, startDate, endDate } = req.query;
      
      // 获取用户课程列表
      const lessons = await LessonService.getUserLessons(
        userId,
        role || req.user.role,
        status,
        startDate,
        endDate
      );
      
      return res.status(200).json({
        success: true,
        count: lessons.length,
        data: lessons
      });
    } catch (error) {
      console.error('获取用户课程列表失败:', error);
      return res.status(500).json({
        success: false,
        message: error.message || '获取用户课程列表失败'
      });
    }
  }
  
  /**
   * 获取用户的日历视图课程
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   * @returns {Object} - JSON响应
   */
  static async getLessonCalendar(req, res) {
    try {
      const userId = req.user.id;
      const { role, startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: '开始日期和结束日期是必需的'
        });
      }
      
      // 获取用户日历视图课程
      const lessons = await LessonService.getLessonCalendar(
        userId,
        role || req.user.role,
        startDate,
        endDate
      );
      
      return res.status(200).json({
        success: true,
        count: lessons.length,
        data: lessons
      });
    } catch (error) {
      console.error('获取用户日历视图课程失败:', error);
      return res.status(500).json({
        success: false,
        message: error.message || '获取用户日历视图课程失败'
      });
    }
  }
  
  /**
   * 添加课程材料
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   * @returns {Object} - JSON响应
   */
  static async addLessonMaterial(req, res) {
    try {
      // 验证请求数据
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      
      const { lessonId } = req.params;
      const material = req.body;
      
      // 添加课程材料
      const lesson = await LessonService.addLessonMaterial(lessonId, material);
      
      return res.status(200).json({
        success: true,
        message: '课程材料添加成功',
        data: lesson
      });
    } catch (error) {
      console.error('添加课程材料失败:', error);
      return res.status(500).json({
        success: false,
        message: error.message || '添加课程材料失败'
      });
    }
  }
  
  /**
   * 处理课程提醒（定时任务调用）
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   * @returns {Object} - JSON响应
   */
  static async processLessonReminders(req, res) {
    try {
      // 处理课程提醒
      const reminderCount = await LessonService.processLessonReminders();
      
      return res.status(200).json({
        success: true,
        message: `处理了 ${reminderCount} 个课程提醒`,
        count: reminderCount
      });
    } catch (error) {
      console.error('处理课程提醒失败:', error);
      return res.status(500).json({
        success: false,
        message: error.message || '处理课程提醒失败'
      });
    }
  }
}

module.exports = LessonController;
