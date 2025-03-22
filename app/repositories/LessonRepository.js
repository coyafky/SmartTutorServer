/**
 * 课程仓库
 * 提供对课程模型的数据访问抽象
 * 将数据访问逻辑与业务逻辑分离
 */

const Lesson = require('../../models/Lesson');
const mongoose = require('mongoose');

/**
 * 课程仓库类
 * 封装所有与课程数据访问相关的方法
 */
class LessonRepository {
  /**
   * 创建新课程
   * @param {Object} lessonData - 课程数据
   * @returns {Promise<Object>} 创建的课程对象
   */
  async create(lessonData) {
    try {
      const lesson = new Lesson(lessonData);
      return await lesson.save();
    } catch (error) {
      throw error;
    }
  }

  /**
   * 根据ID查找课程
   * @param {String} lessonId - 课程ID
   * @returns {Promise<Object>} 课程对象
   */
  async findById(lessonId) {
    try {
      return await Lesson.findById(lessonId)
        .populate('tutorId', 'customId firstName lastName avatar')
        .populate('parentId', 'customId nickname avatar')
        .populate('materials.uploadedBy', 'customId username role');
    } catch (error) {
      throw error;
    }
  }

  /**
   * 更新课程信息
   * @param {String} lessonId - 课程ID
   * @param {Object} updateData - 更新数据
   * @returns {Promise<Object>} 更新后的课程对象
   */
  async update(lessonId, updateData) {
    try {
      return await Lesson.findByIdAndUpdate(
        lessonId,
        { $set: updateData },
        { new: true, runValidators: true }
      );
    } catch (error) {
      throw error;
    }
  }

  /**
   * 更新课程状态
   * @param {String} lessonId - 课程ID
   * @param {String} status - 新状态
   * @returns {Promise<Object>} 更新后的课程对象
   */
  async updateStatus(lessonId, status) {
    try {
      return await Lesson.findByIdAndUpdate(
        lessonId,
        { 
          $set: { 
            status,
            updatedAt: new Date()
          }
        },
        { new: true }
      );
    } catch (error) {
      throw error;
    }
  }

  /**
   * 删除课程
   * @param {String} lessonId - 课程ID
   * @returns {Promise<Boolean>} 是否成功删除
   */
  async delete(lessonId) {
    try {
      const result = await Lesson.findByIdAndDelete(lessonId);
      return !!result;
    } catch (error) {
      throw error;
    }
  }

  /**
   * 获取用户的课程列表
   * @param {String} userId - 用户ID
   * @param {String} role - 用户角色
   * @param {String} status - 课程状态
   * @param {Date} startDate - 开始日期
   * @param {Date} endDate - 结束日期
   * @returns {Promise<Array>} 课程列表
   */
  async getUserLessons(userId, role, status, startDate, endDate) {
    try {
      // 构建查询条件
      const query = {};
      
      // 根据角色设置查询字段
      if (role === 'tutor') {
        query.tutorId = userId;
      } else if (role === 'parent') {
        query.parentId = userId;
      }
      
      // 如果指定了状态，添加到查询条件
      if (status) {
        query.status = status;
      }
      
      // 如果指定了日期范围，添加到查询条件
      if (startDate || endDate) {
        query.date = {};
        if (startDate) {
          query.date.$gte = new Date(startDate);
        }
        if (endDate) {
          query.date.$lte = new Date(endDate);
        }
      }
      
      // 执行查询并返回结果
      return await Lesson.find(query)
        .populate('tutorId', 'customId firstName lastName avatar')
        .populate('parentId', 'customId nickname avatar')
        .sort({ date: 1, startTime: 1 });
    } catch (error) {
      throw error;
    }
  }

  /**
   * 获取日期范围内的课程
   * @param {String} userId - 用户ID
   * @param {String} role - 用户角色
   * @param {Date} startDate - 开始日期
   * @param {Date} endDate - 结束日期
   * @returns {Promise<Array>} 课程列表
   */
  async getLessonsByDateRange(userId, role, startDate, endDate) {
    try {
      // 构建查询条件
      const query = {};
      
      // 根据角色设置查询字段
      if (role === 'tutor') {
        query.tutorId = userId;
      } else if (role === 'parent') {
        query.parentId = userId;
      }
      
      // 设置日期范围
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
      
      // 执行查询并返回结果
      return await Lesson.find(query)
        .populate('tutorId', 'customId firstName lastName avatar')
        .populate('parentId', 'customId nickname avatar')
        .sort({ date: 1, startTime: 1 });
    } catch (error) {
      throw error;
    }
  }

  /**
   * 添加课程材料
   * @param {String} lessonId - 课程ID
   * @param {Object} material - 材料信息
   * @returns {Promise<Object>} 更新后的课程对象
   */
  async addMaterial(lessonId, material) {
    try {
      return await Lesson.findByIdAndUpdate(
        lessonId,
        { $push: { materials: material } },
        { new: true }
      );
    } catch (error) {
      throw error;
    }
  }

  /**
   * 获取即将到来的课程
   * @param {Number} hours - 提前多少小时
   * @returns {Promise<Array>} 课程列表
   */
  async getUpcomingLessons(hours = 24) {
    try {
      const now = new Date();
      const future = new Date(now.getTime() + hours * 60 * 60 * 1000);
      
      // 查找在指定时间范围内的课程
      return await Lesson.find({
        date: { $gte: now, $lte: future },
        status: 'confirmed'
      })
        .populate('tutorId', 'customId firstName lastName avatar')
        .populate('parentId', 'customId nickname avatar');
    } catch (error) {
      throw error;
    }
  }

  /**
   * 添加课程提醒
   * @param {String} lessonId - 课程ID
   * @param {Object} reminder - 提醒信息
   * @returns {Promise<Object>} 更新后的课程对象
   */
  async addReminder(lessonId, reminder) {
    try {
      return await Lesson.findByIdAndUpdate(
        lessonId,
        { $push: { reminders: reminder } },
        { new: true }
      );
    } catch (error) {
      throw error;
    }
  }

  /**
   * 标记提醒为已发送
   * @param {String} lessonId - 课程ID
   * @param {String} reminderId - 提醒ID
   * @returns {Promise<Object>} 更新后的课程对象
   */
  async markReminderSent(lessonId, reminderId) {
    try {
      return await Lesson.findOneAndUpdate(
        { 
          _id: lessonId,
          'reminders._id': reminderId
        },
        { 
          $set: { 
            'reminders.$.sent': true,
            'reminders.$.sentAt': new Date()
          }
        },
        { new: true }
      );
    } catch (error) {
      throw error;
    }
  }

  /**
   * 添加课程评价
   * @param {String} lessonId - 课程ID
   * @param {String} role - 评价者角色
   * @param {Object} ratingData - 评价数据
   * @returns {Promise<Object>} 更新后的课程对象
   */
  async addRating(lessonId, role, ratingData) {
    try {
      // 根据角色确定要更新的字段
      const updateField = role === 'parent' ? 'parentRating' : 'tutorRating';
      
      // 更新评价
      return await Lesson.findByIdAndUpdate(
        lessonId,
        { $set: { [updateField]: ratingData } },
        { new: true }
      );
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new LessonRepository();
