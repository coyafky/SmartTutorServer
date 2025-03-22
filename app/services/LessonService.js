/**
 * 课程服务
 * 处理与课程相关的业务逻辑
 */

const User = require('../../models/User');
const LessonRepository = require('../repositories/LessonRepository');
const MessageService = require('./MessageService');
const NotificationService = require('./NotificationService');
const mongoose = require('mongoose');

class LessonService {
  /**
   * 创建新课程
   * @param {Object} lessonData - 课程数据
   * @param {String} conversationId - 对话ID（用于发送相关消息）
   * @returns {Promise<Object>} - 创建的课程
   */
  static async createLesson(lessonData, conversationId = null) {
    try {
      // 验证教师和家长存在
      const tutor = await User.findById(lessonData.tutorId);
      const parent = await User.findById(lessonData.parentId);
      
      if (!tutor || !parent) {
        throw new Error('教师或家长不存在');
      }
      
      if (tutor.role !== 'tutor') {
        throw new Error('指定的教师用户不是教师角色');
      }
      
      if (parent.role !== 'parent') {
        throw new Error('指定的家长用户不是家长角色');
      }
      
      // 创建课程
      const lesson = await LessonRepository.create(lessonData);
      
      // 如果提供了会话ID，发送课程请求消息
      if (conversationId) {
        const content = `课程请求：${lessonData.subject} - ${new Date(lessonData.date).toLocaleDateString()} ${lessonData.startTime}-${lessonData.endTime}`;
        
        const lessonRequestData = {
          date: lessonData.date,
          startTime: lessonData.startTime,
          endTime: lessonData.endTime,
          subject: lessonData.subject,
          location: lessonData.location,
          mode: lessonData.mode
        };
        
        // 发送课程请求消息
        const message = await MessageService.sendLessonRequest(
          lessonData.parentId,
          conversationId,
          content,
          lessonRequestData
        );
        
        // 更新课程关联的消息ID
        lesson.relatedMessageIds.push(message._id);
        await lesson.save();
      }
      
      // 创建课程提醒
      this.createLessonReminders(lesson);
      
      return lesson;
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * 获取课程详情
   * @param {String} lessonId - 课程ID
   * @returns {Promise<Object>} - 课程详情
   */
  static async getLessonById(lessonId) {
    try {
      const lesson = await LessonRepository.findById(lessonId);
      
      if (!lesson) {
        throw new Error('课程不存在');
      }
      
      return lesson;
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * 更新课程信息
   * @param {String} lessonId - 课程ID
   * @param {Object} updateData - 更新数据
   * @param {String} conversationId - 对话ID（用于发送相关消息）
   * @returns {Promise<Object>} - 更新后的课程
   */
  static async updateLesson(lessonId, updateData, conversationId = null) {
    try {
      const lesson = await LessonRepository.findById(lessonId);
      
      if (!lesson) {
        throw new Error('课程不存在');
      }
      
      // 检查是否更改了时间或日期
      const isTimeChanged = (
        updateData.date && lesson.date.toISOString() !== new Date(updateData.date).toISOString() ||
        updateData.startTime && lesson.startTime !== updateData.startTime ||
        updateData.endTime && lesson.endTime !== updateData.endTime
      );
      
      // 更新课程信息
      Object.keys(updateData).forEach(key => {
        if (key !== '_id' && key !== 'relatedMessageIds') {
          lesson[key] = updateData[key];
        }
      });
      
      await lesson.save();
      
      // 如果提供了会话ID且时间有变更，发送课程变更消息
      if (conversationId && isTimeChanged) {
        const content = `课程变更：${lesson.subject} - 从 ${new Date(lesson.date).toLocaleDateString()} ${lesson.startTime}-${lesson.endTime}`;
        
        const lessonRescheduleData = {
          date: lesson.date,
          startTime: lesson.startTime,
          endTime: lesson.endTime,
          subject: lesson.subject,
          location: lesson.location,
          mode: lesson.mode
        };
        
        // 发送课程变更消息
        const message = await MessageService.sendLessonReschedule(
          mongoose.Types.ObjectId(lesson.tutorId),
          conversationId,
          content,
          lesson._id,
          lessonRescheduleData
        );
        
        // 更新课程关联的消息ID
        lesson.relatedMessageIds.push(message._id);
        await lesson.save();
        
        // 更新提醒
        await this.updateLessonReminders(lesson);
      }
      
      return lesson;
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * 更新课程状态
   * @param {String} lessonId - 课程ID
   * @param {String} status - 新状态
   * @param {String} conversationId - 对话ID（用于发送相关消息）
   * @param {String} userId - 操作用户ID
   * @returns {Promise<Object>} - 更新后的课程
   */
  static async updateLessonStatus(lessonId, status, conversationId = null, userId = null) {
    try {
      const lesson = await LessonRepository.findById(lessonId);
      
      if (!lesson) {
        throw new Error('课程不存在');
      }
      
      // 更新状态
      lesson.status = status;
      await lesson.save();
      
      // 如果提供了会话ID，发送相关消息
      if (conversationId && userId) {
        let message;
        const lessonData = {
          date: lesson.date,
          startTime: lesson.startTime,
          endTime: lesson.endTime,
          subject: lesson.subject,
          location: lesson.location,
          mode: lesson.mode
        };
        
        if (status === 'confirmed') {
          // 发送确认消息
          const content = `课程已确认：${lesson.subject} - ${new Date(lesson.date).toLocaleDateString()} ${lesson.startTime}-${lesson.endTime}`;
          message = await MessageService.sendLessonConfirmation(
            userId,
            conversationId,
            content,
            lesson._id,
            lessonData
          );
        } else if (status === 'cancelled') {
          // 发送取消消息
          const content = `课程已取消：${lesson.subject} - ${new Date(lesson.date).toLocaleDateString()} ${lesson.startTime}-${lesson.endTime}`;
          message = await MessageService.sendLessonCancellation(
            userId,
            conversationId,
            content,
            lesson._id
          );
        }
        
        if (message) {
          // 更新课程关联的消息ID
          lesson.relatedMessageIds.push(message._id);
          await lesson.save();
        }
      }
      
      return lesson;
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * 删除课程
   * @param {String} lessonId - 课程ID
   * @returns {Promise<Boolean>} - 是否成功删除
   */
  static async deleteLesson(lessonId) {
    try {
      return await LessonRepository.delete(lessonId);
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * 获取用户的课程列表
   * @param {String} userId - 用户ID
   * @param {String} role - 角色（tutor/parent）
   * @param {String} status - 课程状态（可选）
   * @param {Date} startDate - 开始日期（可选）
   * @param {Date} endDate - 结束日期（可选）
   * @returns {Promise<Array>} - 课程列表
   */
  static async getUserLessons(userId, role, status = null, startDate = null, endDate = null) {
    try {
      return await LessonRepository.getUserLessons(userId, role, status, startDate, endDate);
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * 获取用户的日历视图课程
   * @param {String} userId - 用户ID
   * @param {String} role - 角色（tutor/parent）
   * @param {Date} startDate - 开始日期
   * @param {Date} endDate - 结束日期
   * @returns {Promise<Array>} - 课程列表
   */
  static async getLessonCalendar(userId, role, startDate, endDate) {
    try {
      return await LessonRepository.getLessonsByDateRange(userId, role, startDate, endDate);
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * 添加课程材料
   * @param {String} lessonId - 课程ID
   * @param {Object} material - 材料数据
   * @returns {Promise<Object>} - 更新后的课程
   */
  static async addLessonMaterial(lessonId, material) {
    try {
      return await LessonRepository.addMaterial(lessonId, material);
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * 创建课程提醒
   * @param {Object} lesson - 课程对象
   * @returns {Promise<void>}
   */
  static async createLessonReminders(lesson) {
    try {
      // 清除现有提醒
      lesson.reminders = [];
      
      // 创建课程前24小时提醒
      const reminderTime = new Date(lesson.date);
      reminderTime.setHours(reminderTime.getHours() - 24);
      
      lesson.reminders.push({
        time: reminderTime,
        sent: false
      });
      
      // 创建课程前1小时提醒
      const shortReminderTime = new Date(lesson.date);
      shortReminderTime.setHours(shortReminderTime.getHours() - 1);
      
      lesson.reminders.push({
        time: shortReminderTime,
        sent: false
      });
      
      await lesson.save();
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * 更新课程提醒
   * @param {Object} lesson - 课程对象
   * @returns {Promise<void>}
   */
  static async updateLessonReminders(lesson) {
    try {
      // 重新创建提醒
      await this.createLessonReminders(lesson);
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * 处理课程提醒
   * @returns {Promise<Number>} - 处理的提醒数量
   */
  static async processLessonReminders() {
    try {
      // 获取即将到来的课程（24小时内）
      const upcomingLessons = await LessonRepository.getUpcomingLessons(24);
      let reminderCount = 0;
      
      // 处理每个课程的提醒
      for (const lesson of upcomingLessons) {
        const now = new Date();
        
        // 检查每个提醒
        for (let i = 0; i < lesson.reminders.length; i++) {
          const reminder = lesson.reminders[i];
          
          // 如果提醒时间已到但尚未发送
          if (reminder.time <= now && !reminder.sent) {
            // 发送通知给教师
            await NotificationService.sendNotification(
              lesson.tutorId._id,
              '课程提醒',
              `您有一节${lesson.subject}课程将于${new Date(lesson.date).toLocaleDateString()} ${lesson.startTime}开始`
            );
            
            // 发送通知给家长
            await NotificationService.sendNotification(
              lesson.parentId._id,
              '课程提醒',
              `您的孩子${lesson.student.name}有一节${lesson.subject}课程将于${new Date(lesson.date).toLocaleDateString()} ${lesson.startTime}开始`
            );
            
            // 标记提醒为已发送
            lesson.reminders[i].sent = true;
            reminderCount++;
          }
        }
        
        // 保存更新后的课程
        await lesson.save();
      }
      
      return reminderCount;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = LessonService;
