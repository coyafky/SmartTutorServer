/**
 * 教师推荐服务
 * 为教师推荐最合适的家教需求帖子
 */

const TutorProfile = require('../../models/TutorProfile');
const TutoringRequest = require('../../models/TutoringRequest');
const { AppError } = require('../utils/errorHandler');
const { log } = require('../utils/logger');

class TutorRecommendationService {
  /**
   * 为教师推荐最合适的家教需求帖子
   * @param {String} tutorId - 教师ID
   * @param {Number} limit - 返回结果数量限制，默认为3
   * @returns {Promise<Array>} - 推荐的家教需求帖子列表
   */
  static async getRecommendedRequests(tutorId, limit = 3) {
    try {
      log.info(`为教师 ${tutorId} 推荐家教需求帖子`);

      // 1. 获取教师资料
      const tutorProfile = await TutorProfile.findOne({ tutorId });
      if (!tutorProfile) {
        throw new AppError('教师资料卡不存在', 404);
      }

      // 2. 处理城市匹配 - 创建城市匹配模式，处理"北京"和"北京市"这样的差异
      const city = tutorProfile.location.city;
      if (!city) {
        throw new AppError('教师没有设置城市信息', 400);
      }
      
      // 移除"市"、"省"、"自治区"等后缀，只保留主要名称
      const cityPattern = city.replace(/(市|省|自治区|特别行政区)$/, '');
      
      // 3. 获取候选帖子 - 查找与教师同城市的所有开放状态的家教需求帖子
      const requests = await TutoringRequest.find({
        'location.city': { $regex: new RegExp(`^${cityPattern}(市|省|自治区|特别行政区)?$`, 'i') },
        status: { $in: ['open', 'published'] },
      });

      if (requests.length === 0) {
        log.info(`没有找到与教师 ${tutorId} 同城市的家教需求帖子`);
        return [];
      }

      // 4. 提取教师信息
      const teacherSubjects = tutorProfile.teachingExperience.subjects.map(s => s.name);
      const teacherGender = tutorProfile.gender;
      const teacherPricing = tutorProfile.pricing ? tutorProfile.pricing.basePrice : 0;
      
      // 获取教师可用时间段
      const teacherSessions = tutorProfile.availableTimes || [];
      const teacherAvailability = teacherSessions.map(session => ({
        day: session.day,
        period: session.period
      }));

      // 5. 计算每个帖子的匹配分数
      const scoredRequests = requests.map(request => {
        // 初始化匹配分数和详情
        let totalScore = 0;
        const matchDetails = {
          baseScore: 0,
          priceScore: 0,
          subjectScore: 0,
          genderScore: 0,
          timeScore: 0
        };

        // 5.1 基础分 (30%) - 同城市的帖子
        matchDetails.baseScore = 0.3;
        totalScore += matchDetails.baseScore;

        // 5.2 价格匹配 (10%)
        if (request.preferences && request.preferences.budget) {
          const { min, max } = request.preferences.budget;
          if (teacherPricing >= min && teacherPricing <= max) {
            matchDetails.priceScore = 0.1;
            totalScore += matchDetails.priceScore;
          }
        }

        // 5.3 科目匹配 (30%)
        if (request.subjects && request.subjects.length > 0) {
          const requestSubjects = request.subjects.map(s => s.name);
          const matchingSubjects = requestSubjects.filter(subject => 
            teacherSubjects.includes(subject)
          );
          
          if (matchingSubjects.length > 0) {
            const subjectMatchRatio = matchingSubjects.length / requestSubjects.length;
            matchDetails.subjectScore = 0.3 * subjectMatchRatio;
            totalScore += matchDetails.subjectScore;
          }
        }

        // 5.4 性别匹配 (20%)
        if (request.preferences && request.preferences.teacherGender) {
          const preferredGender = request.preferences.teacherGender;
          if (preferredGender === '不限' || preferredGender === teacherGender) {
            matchDetails.genderScore = 0.2;
            totalScore += matchDetails.genderScore;
          }
        }

        // 5.5 时间匹配 (10%)
        if (request.preferences && request.preferences.schedule && teacherAvailability.length > 0) {
          const requestSchedule = request.preferences.schedule;
          
          // 检查是否有时间段重叠
          const hasTimeOverlap = teacherAvailability.some(teacherSlot => 
            requestSchedule.days.includes(teacherSlot.day) && 
            requestSchedule.periods.includes(teacherSlot.period)
          );
          
          if (hasTimeOverlap) {
            matchDetails.timeScore = 0.1;
            totalScore += matchDetails.timeScore;
          }
        }

        // 返回带分数的请求
        return {
          request,
          score: totalScore,
          matchDetails
        };
      });

      // 6. 排序并返回前N个结果
      const topRequests = scoredRequests
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);

      log.info(`成功为教师 ${tutorId} 推荐 ${topRequests.length} 个家教需求帖子`);
      
      return topRequests;
    } catch (error) {
      log.error(`为教师推荐家教需求帖子时发生错误: ${error.message}`, error);
      throw error;
    }
  }
}

module.exports = TutorRecommendationService;
