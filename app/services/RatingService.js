/**
 * 评价系统服务
 * 提供评价的创建、查询、统计等功能
 * @module services/RatingService
 */

const Rating = require('../../models/Rating');
const Match = require('../../models/Match');
const TutorProfile = require('../../models/TutorProfile');
const Parent = require('../../models/Parent');
const mongoose = require('mongoose');

/**
 * 评价服务类
 * 处理评价相关的业务逻辑
 */
class RatingService {
  /**
   * 创建新评价
   * @param {Object} ratingData - 评价数据
   * @returns {Promise<Object>} 创建的评价对象
   */
  async createRating(ratingData) {
    try {
      // 检查匹配是否存在
      const match = await Match.findById(ratingData.matchId);
      if (!match) {
        throw new Error('匹配不存在');
      }
      
      // 检查是否已经评价过
      const existingRating = await Rating.findOne({
        matchId: ratingData.matchId,
        ratedBy: ratingData.ratedBy,
        raterType: ratingData.raterType
      });
      
      if (existingRating) {
        throw new Error('已经对此匹配进行过评价');
      }
      
      // 创建新评价
      const newRating = new Rating(ratingData);
      await newRating.save();
      
      // 更新匹配中的评分信息
      if (ratingData.raterType === 'parent') {
        await Match.findByIdAndUpdate(ratingData.matchId, {
          parentRating: ratingData.overallRating,
          parentReview: ratingData.reviewText
        });
        
        // 更新教师的平均评分
        await this.updateTutorAverageRating(ratingData.ratedUser);
      } else if (ratingData.raterType === 'tutor') {
        await Match.findByIdAndUpdate(ratingData.matchId, {
          tutorRating: ratingData.overallRating,
          tutorReview: ratingData.reviewText
        });
      }
      
      return newRating;
    } catch (error) {
      console.error('创建评价失败:', error);
      throw error;
    }
  }
  
  /**
   * 获取用户收到的评价
   * @param {String} userId - 用户ID
   * @param {String} userType - 用户类型 ('tutor' 或 'parent')
   * @param {Object} options - 查询选项
   * @param {Number} options.page - 页码
   * @param {Number} options.limit - 每页数量
   * @returns {Promise<Object>} 评价列表和分页信息
   */
  async getUserRatings(userId, userType, options = {}) {
    try {
      const { page = 1, limit = 10 } = options;
      const skip = (page - 1) * limit;
      
      const raterType = userType === 'tutor' ? 'parent' : 'tutor';
      
      const ratings = await Rating.find({
        ratedUser: userId,
        raterType: raterType
      })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
      
      const total = await Rating.countDocuments({
        ratedUser: userId,
        raterType: raterType
      });
      
      return {
        ratings,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('获取用户评价失败:', error);
      throw error;
    }
  }
  
  /**
   * 获取用户的评价统计
   * @param {String} userId - 用户ID
   * @param {String} userType - 用户类型 ('tutor' 或 'parent')
   * @returns {Promise<Object>} 评价统计信息
   */
  async getUserRatingStats(userId, userType) {
    try {
      const raterType = userType === 'tutor' ? 'parent' : 'tutor';
      
      const ratings = await Rating.find({
        ratedUser: userId,
        raterType: raterType
      });
      
      if (ratings.length === 0) {
        return {
          averageRating: 0,
          totalRatings: 0,
          dimensionStats: {
            teachingQuality: 0,
            classroomPerformance: 0,
            studentProgress: 0,
            communication: 0,
            punctuality: 0
          },
          commonTags: []
        };
      }
      
      // 计算总体平均评分
      const averageRating = ratings.reduce((sum, rating) => sum + rating.overallRating, 0) / ratings.length;
      
      // 计算各维度平均评分
      const dimensionStats = {
        teachingQuality: this.calculateAverageDimension(ratings, 'teachingQuality'),
        classroomPerformance: this.calculateAverageDimension(ratings, 'classroomPerformance'),
        studentProgress: this.calculateAverageDimension(ratings, 'studentProgress'),
        communication: this.calculateAverageDimension(ratings, 'communication'),
        punctuality: this.calculateAverageDimension(ratings, 'punctuality')
      };
      
      // 统计常见标签
      const tagCounts = {};
      ratings.forEach(rating => {
        if (rating.tags && rating.tags.length > 0) {
          rating.tags.forEach(tag => {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
          });
        }
      });
      
      const commonTags = Object.entries(tagCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([tag, count]) => ({ tag, count }));
      
      return {
        averageRating,
        totalRatings: ratings.length,
        dimensionStats,
        commonTags
      };
    } catch (error) {
      console.error('获取用户评价统计失败:', error);
      throw error;
    }
  }
  
  /**
   * 计算特定维度的平均评分
   * @private
   * @param {Array} ratings - 评价数组
   * @param {String} dimension - 维度名称
   * @returns {Number} 平均评分
   */
  calculateAverageDimension(ratings, dimension) {
    const validRatings = ratings.filter(rating => rating[dimension]);
    if (validRatings.length === 0) return 0;
    
    return validRatings.reduce((sum, rating) => sum + rating[dimension], 0) / validRatings.length;
  }
  
  /**
   * 更新教师的平均评分
   * @private
   * @param {String} tutorId - 教师ID
   * @returns {Promise<void>}
   */
  async updateTutorAverageRating(tutorId) {
    try {
      const ratings = await Rating.find({
        ratedUser: tutorId,
        raterType: 'parent'
      });
      
      if (ratings.length === 0) return;
      
      const averageRating = ratings.reduce((sum, rating) => sum + rating.overallRating, 0) / ratings.length;
      
      await TutorProfile.findOneAndUpdate(
        { customId: tutorId },
        { 
          averageRating: averageRating.toFixed(1),
          ratingCount: ratings.length
        }
      );
    } catch (error) {
      console.error('更新教师平均评分失败:', error);
      throw error;
    }
  }
  
  /**
   * 获取匹配的评价
   * @param {String} matchId - 匹配ID
   * @returns {Promise<Array>} 匹配的评价列表
   */
  async getMatchRatings(matchId) {
    try {
      return await Rating.find({ matchId });
    } catch (error) {
      console.error('获取匹配评价失败:', error);
      throw error;
    }
  }
  
  /**
   * 更新评价
   * @param {String} ratingId - 评价ID
   * @param {Object} updateData - 更新数据
   * @returns {Promise<Object>} 更新后的评价对象
   */
  async updateRating(ratingId, updateData) {
    try {
      const rating = await Rating.findById(ratingId);
      if (!rating) {
        throw new Error('评价不存在');
      }
      
      // 不允许修改某些字段
      delete updateData.matchId;
      delete updateData.ratedBy;
      delete updateData.raterType;
      delete updateData.ratedUser;
      delete updateData.createdAt;
      
      // 更新评价
      updateData.updatedAt = Date.now();
      const updatedRating = await Rating.findByIdAndUpdate(
        ratingId,
        updateData,
        { new: true }
      );
      
      // 如果更新了总体评分，同步更新匹配中的评分
      if (updateData.overallRating) {
        if (rating.raterType === 'parent') {
          await Match.findByIdAndUpdate(rating.matchId, {
            parentRating: updateData.overallRating,
            parentReview: updateData.reviewText || rating.reviewText
          });
          
          // 更新教师的平均评分
          await this.updateTutorAverageRating(rating.ratedUser);
        } else if (rating.raterType === 'tutor') {
          await Match.findByIdAndUpdate(rating.matchId, {
            tutorRating: updateData.overallRating,
            tutorReview: updateData.reviewText || rating.reviewText
          });
        }
      }
      
      return updatedRating;
    } catch (error) {
      console.error('更新评价失败:', error);
      throw error;
    }
  }
  
  /**
   * 删除评价
   * @param {String} ratingId - 评价ID
   * @returns {Promise<Boolean>} 是否成功删除
   */
  async deleteRating(ratingId) {
    try {
      const rating = await Rating.findById(ratingId);
      if (!rating) {
        throw new Error('评价不存在');
      }
      
      // 删除评价
      await Rating.findByIdAndDelete(ratingId);
      
      // 更新匹配中的评分信息
      if (rating.raterType === 'parent') {
        await Match.findByIdAndUpdate(rating.matchId, {
          parentRating: null,
          parentReview: null
        });
        
        // 更新教师的平均评分
        await this.updateTutorAverageRating(rating.ratedUser);
      } else if (rating.raterType === 'tutor') {
        await Match.findByIdAndUpdate(rating.matchId, {
          tutorRating: null,
          tutorReview: null
        });
      }
      
      return true;
    } catch (error) {
      console.error('删除评价失败:', error);
      throw error;
    }
  }
}

module.exports = new RatingService();
