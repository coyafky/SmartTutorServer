/**
 * 推荐仓库
 * 提供对推荐相关模型的数据访问抽象
 * 将数据访问逻辑与业务逻辑分离
 */

const TutorProfile = require('../../models/TutorProfile');
const Parent = require('../../models/Parent');
const TutoringRequest = require('../../models/TutoringRequest');
const Match = require('../../models/Match');
const Lesson = require('../../models/Lesson');
const mongoose = require('mongoose');

/**
 * 推荐仓库类
 * 封装所有与推荐数据访问相关的方法
 */
class RecommendationRepository {
  /**
   * 根据ID查找教师资料
   * @param {String} tutorId - 教师ID
   * @returns {Promise<Object>} 教师资料对象
   */
  async findTutorById(tutorId) {
    try {
      return await TutorProfile.findOne({ customId: tutorId });
    } catch (error) {
      throw error;
    }
  }

  /**
   * 根据ID查找家长资料
   * @param {String} parentId - 家长ID
   * @returns {Promise<Object>} 家长资料对象
   */
  async findParentById(parentId) {
    try {
      return await Parent.findOne({ customId: parentId });
    } catch (error) {
      throw error;
    }
  }

  /**
   * 获取已发布状态的家教需求
   * @param {Object} query - 查询条件
   * @param {Number} limit - 结果数量限制
   * @returns {Promise<Array>} 家教需求列表
   */
  async getPublishedRequests(query = {}, limit = 50) {
    try {
      const baseQuery = { 
        status: 'published',
        ...query
      };
      
      return await TutoringRequest.find(baseQuery)
        .populate('parentId')
        .limit(limit);
    } catch (error) {
      throw error;
    }
  }

  /**
   * 获取同城市的家教需求
   * @param {String} city - 城市名称
   * @param {Number} limit - 结果数量限制
   * @returns {Promise<Array>} 家教需求列表
   */
  async getRequestsBySameCity(city, limit = 50) {
    try {
      return await this.getPublishedRequests({
        'location.city': city
      }, limit);
    } catch (error) {
      throw error;
    }
  }

  /**
   * 获取不同城市的家教需求
   * @param {String} city - 排除的城市名称
   * @param {Number} limit - 结果数量限制
   * @returns {Promise<Array>} 家教需求列表
   */
  async getRequestsByDifferentCity(city, limit = 50) {
    try {
      return await this.getPublishedRequests({
        'location.city': { $ne: city }
      }, limit);
    } catch (error) {
      throw error;
    }
  }

  /**
   * 获取活跃教师列表
   * @param {Object} query - 查询条件
   * @param {Number} limit - 结果数量限制
   * @returns {Promise<Array>} 教师列表
   */
  async getActiveTutors(query = {}, limit = 50) {
    try {
      const baseQuery = { 
        status: 'active',
        ...query
      };
      
      return await TutorProfile.find(baseQuery)
        .limit(limit);
    } catch (error) {
      throw error;
    }
  }

  /**
   * 获取同城市的教师
   * @param {String} city - 城市名称
   * @param {Number} limit - 结果数量限制
   * @returns {Promise<Array>} 教师列表
   */
  async getTutorsBySameCity(city, limit = 50) {
    try {
      return await this.getActiveTutors({
        'location.city': city
      }, limit);
    } catch (error) {
      throw error;
    }
  }

  /**
   * 获取不同城市的教师
   * @param {String} city - 排除的城市名称
   * @param {Number} limit - 结果数量限制
   * @returns {Promise<Array>} 教师列表
   */
  async getTutorsByDifferentCity(city, limit = 50) {
    try {
      return await this.getActiveTutors({
        'location.city': { $ne: city }
      }, limit);
    } catch (error) {
      throw error;
    }
  }

  /**
   * 获取教师的历史匹配记录
   * @param {String} tutorId - 教师ID
   * @returns {Promise<Array>} 匹配记录列表
   */
  async getTutorMatchHistory(tutorId) {
    try {
      return await Match.find({ tutorId })
        .populate('requestId')
        .sort({ createdAt: -1 });
    } catch (error) {
      throw error;
    }
  }

  /**
   * 获取家长的历史匹配记录
   * @param {String} parentId - 家长ID
   * @returns {Promise<Array>} 匹配记录列表
   */
  async getParentMatchHistory(parentId) {
    try {
      return await Match.find({ parentId })
        .populate('tutorId')
        .sort({ createdAt: -1 });
    } catch (error) {
      throw error;
    }
  }

  /**
   * 获取教师的历史课程记录
   * @param {String} tutorId - 教师ID
   * @returns {Promise<Array>} 课程记录列表
   */
  async getTutorLessonHistory(tutorId) {
    try {
      return await Lesson.find({ tutorId, status: 'completed' })
        .populate('parentId')
        .sort({ date: -1 });
    } catch (error) {
      throw error;
    }
  }

  /**
   * 获取家长的历史课程记录
   * @param {String} parentId - 家长ID
   * @returns {Promise<Array>} 课程记录列表
   */
  async getParentLessonHistory(parentId) {
    try {
      return await Lesson.find({ parentId, status: 'completed' })
        .populate('tutorId')
        .sort({ date: -1 });
    } catch (error) {
      throw error;
    }
  }

  /**
   * 创建匹配记录
   * @param {Object} matchData - 匹配数据
   * @returns {Promise<Object>} 创建的匹配记录
   */
  async createMatch(matchData) {
    try {
      const match = new Match(matchData);
      return await match.save();
    } catch (error) {
      throw error;
    }
  }

  /**
   * 更新匹配状态
   * @param {String} matchId - 匹配ID
   * @param {String} status - 新状态
   * @returns {Promise<Object>} 更新后的匹配记录
   */
  async updateMatchStatus(matchId, status) {
    try {
      return await Match.findByIdAndUpdate(
        matchId,
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
   * 获取所有教师的评分数据
   * @returns {Promise<Array>} 教师评分数据
   */
  async getAllTutorRatings() {
    try {
      const lessons = await Lesson.find({ 
        status: 'completed',
        'parentRating.rating': { $exists: true }
      })
      .select('tutorId parentId parentRating.rating')
      .lean();
      
      return lessons.map(lesson => ({
        tutorId: lesson.tutorId.toString(),
        parentId: lesson.parentId.toString(),
        rating: lesson.parentRating.rating
      }));
    } catch (error) {
      throw error;
    }
  }

  /**
   * 获取所有家长的评分数据
   * @returns {Promise<Array>} 家长评分数据
   */
  async getAllParentRatings() {
    try {
      const lessons = await Lesson.find({ 
        status: 'completed',
        'tutorRating.rating': { $exists: true }
      })
      .select('tutorId parentId tutorRating.rating')
      .lean();
      
      return lessons.map(lesson => ({
        tutorId: lesson.tutorId.toString(),
        parentId: lesson.parentId.toString(),
        rating: lesson.tutorRating.rating
      }));
    } catch (error) {
      throw error;
    }
  }

  /**
   * 获取所有教师数据用于训练
   * @returns {Promise<Array>} 教师数据
   */
  async getAllTutorsForTraining() {
    try {
      return await TutorProfile.find({ status: 'active' }).lean();
    } catch (error) {
      throw error;
    }
  }

  /**
   * 获取所有家长数据用于训练
   * @returns {Promise<Array>} 家长数据
   */
  async getAllParentsForTraining() {
    try {
      return await Parent.find({}).lean();
    } catch (error) {
      throw error;
    }
  }

  /**
   * 获取所有家教需求数据用于训练
   * @returns {Promise<Array>} 家教需求数据
   */
  async getAllRequestsForTraining() {
    try {
      return await TutoringRequest.find({}).populate('parentId').lean();
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * 根据ID查找匹配记录
   * @param {String} matchId - 匹配ID
   * @returns {Promise<Object>} 匹配记录
   */
  async findMatchById(matchId) {
    try {
      return await Match.findById(matchId);
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * 更新匹配记录
   * @param {String} matchId - 匹配ID
   * @param {Object} updateData - 更新数据
   * @returns {Promise<Object>} 更新后的匹配记录
   */
  async updateMatch(matchId, updateData) {
    try {
      return await Match.findByIdAndUpdate(
        matchId,
        { 
          $set: { 
            ...updateData,
            updatedAt: new Date()
          }
        },
        { new: true }
      );
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new RecommendationRepository();
