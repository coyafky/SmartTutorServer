/**
 * 推荐服务
 * 提供基于地理位置和协同过滤的推荐功能
 * @module services/RecommendationService
 */

const RecommendationRepository = require('../repositories/RecommendationRepository');
const mongoose = require('mongoose');

/**
 * 计算两个地理坐标点之间的距离（公里）
 * 使用Haversine公式计算球面距离
 * @param {Array} coord1 - 第一个坐标 [经度, 纬度]
 * @param {Array} coord2 - 第二个坐标 [经度, 纬度]
 * @returns {Number} 距离（公里）
 */
function calculateDistance(coord1, coord2) {
  const R = 6371; // 地球半径（公里）
  const dLat = (coord2[1] - coord1[1]) * Math.PI / 180;
  const dLon = (coord2[0] - coord1[0]) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(coord1[1] * Math.PI / 180) * Math.cos(coord2[1] * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

/**
 * 计算教师与家长需求的匹配度分数
 * @param {Object} tutor - 教师资料
 * @param {Object} request - 家教需求
 * @returns {Number} 匹配度分数 (0-100)
 */
function calculateMatchScore(tutor, request) {
  let score = 0;
  const weights = {
    subject: 35,    // 科目匹配权重
    grade: 25,      // 年级匹配权重
    price: 20,      // 价格匹配权重
    location: 20    // 位置匹配权重
  };
  
  // 科目匹配度计算
  const tutorSubjects = tutor.subjects.map(s => s.name.toLowerCase());
  const requestSubject = request.subject.name.toLowerCase();
  if (tutorSubjects.includes(requestSubject)) {
    score += weights.subject;
  }
  
  // 年级匹配度计算
  const tutorGrades = tutor.subjects
    .filter(s => s.name.toLowerCase() === requestSubject)
    .flatMap(s => s.grades.map(g => g.toLowerCase()));
  
  if (tutorGrades.includes(request.grade.toLowerCase())) {
    score += weights.grade;
  }
  
  // 价格匹配度计算
  const tutorPrice = tutor.pricing.basePrice;
  const { min: minBudget, max: maxBudget } = request.budget;
  
  if (tutorPrice >= minBudget && tutorPrice <= maxBudget) {
    score += weights.price;
  } else if (tutorPrice < minBudget) {
    // 教师价格低于预算最低值，给部分分数
    score += weights.price * 0.8;
  } else if (tutorPrice > maxBudget && tutorPrice <= maxBudget * 1.2) {
    // 教师价格高于预算但在可接受范围内，给部分分数
    score += weights.price * 0.5;
  }
  
  // 位置匹配度计算 - 已在筛选阶段处理，这里只是额外加分
  // 如果在同一区域，额外加分
  if (tutor.location.district === request.location.district) {
    score += weights.location * 0.3;
  }
  
  // 如果在同一城市，额外加分
  if (tutor.location.city === request.location.city) {
    score += weights.location * 0.2;
  }
  
  return Math.min(score, 100); // 确保分数不超过100
}

/**
 * 基于协同过滤的相似度计算
 * 计算两个用户之间的相似度
 * @param {Array} ratings1 - 第一个用户的评分数组 [{itemId, rating}]
 * @param {Array} ratings2 - 第二个用户的评分数组 [{itemId, rating}]
 * @returns {Number} 相似度 (-1到1)
 */
function calculateSimilarity(ratings1, ratings2) {
  // 找出两个用户共同评分的项目
  const commonItems = {};
  
  ratings1.forEach(r => {
    commonItems[r.itemId] = { user1: r.rating };
  });
  
  ratings2.forEach(r => {
    if (commonItems[r.itemId]) {
      commonItems[r.itemId].user2 = r.rating;
    }
  });
  
  // 提取共同评分
  const commonRatings = Object.values(commonItems)
    .filter(item => item.user1 !== undefined && item.user2 !== undefined);
  
  // 如果没有共同评分，返回0
  if (commonRatings.length === 0) {
    return 0;
  }
  
  // 计算评分均值
  const sum1 = commonRatings.reduce((sum, item) => sum + item.user1, 0);
  const sum2 = commonRatings.reduce((sum, item) => sum + item.user2, 0);
  const avg1 = sum1 / commonRatings.length;
  const avg2 = sum2 / commonRatings.length;
  
  // 计算皮尔逊相关系数
  let numerator = 0;
  let denominator1 = 0;
  let denominator2 = 0;
  
  commonRatings.forEach(item => {
    const dev1 = item.user1 - avg1;
    const dev2 = item.user2 - avg2;
    numerator += dev1 * dev2;
    denominator1 += dev1 * dev1;
    denominator2 += dev2 * dev2;
  });
  
  if (denominator1 === 0 || denominator2 === 0) {
    return 0;
  }
  
  return numerator / Math.sqrt(denominator1 * denominator2);
}

/**
 * 推荐服务类
 * 提供各种推荐功能
 */
class RecommendationService {
  /**
   * 为教师推荐合适的家教需求
   * @param {String} tutorId - 教师ID
   * @param {Object} options - 选项参数
   * @param {Number} options.limit - 返回结果数量限制
   * @param {Number} options.maxDistance - 最大距离限制（公里）
   * @returns {Promise<Array>} 推荐的家教需求列表
   */
  async recommendRequestsForTutor(tutorId, options = {}) {
    const { limit = 10, maxDistance = 10 } = options;
    
    try {
      // 获取教师信息
      const tutor = await RecommendationRepository.findTutorById(tutorId);
      if (!tutor) {
        throw new Error('教师不存在');
      }
      
      // 获取教师位置
      const tutorLocation = tutor.location.geo.coordinates;
      const tutorCity = tutor.location.city;
      
      // 查询条件：已发布状态的需求
      const baseQuery = { status: 'published' };
      
      // 第一步：基于地理位置筛选
      // 1. 同城市的需求
      const sameCityRequests = await RecommendationRepository.getRequestsBySameCity(tutorCity, 50);
      
      // 2. 不同城市但距离在范围内的需求
      const geoNearRequests = await RecommendationRepository.getRequestsByDifferentCity(tutorCity, 50);
      
      // 过滤掉距离过远的需求
      const filteredGeoRequests = geoNearRequests.filter(request => {
        if (!request.location || !request.location.coordinates) return false;
        
        const distance = calculateDistance(
          tutorLocation,
          request.location.coordinates
        );
        return distance <= maxDistance;
      });
      
      // 合并两种需求
      const allRequests = [...sameCityRequests, ...filteredGeoRequests];
      
      // 第二步：计算匹配度分数
      const scoredRequests = allRequests.map(request => {
        const matchScore = calculateMatchScore(tutor, request);
        return {
          request,
          score: matchScore
        };
      });
      
      // 第三步：基于协同过滤调整分数
      // 获取教师的历史匹配记录
      const tutorMatches = await RecommendationRepository.getTutorMatchHistory(tutorId);
      
      // 如果教师有历史匹配，使用协同过滤进行调整
      if (tutorMatches.length > 0) {
        // 获取所有教师的匹配记录，用于协同过滤
        const allTutorMatches = await RecommendationRepository.getAllTutorRatings();
        
        // 构建评分矩阵
        const tutorRatings = tutorMatches.map(match => ({
          itemId: match.requestId,
          rating: match.tutorRating || 3 // 默认评分
        }));
        
        // 为每个其他教师构建评分
        const otherTutorsRatings = {};
        allTutorMatches.forEach(match => {
          if (!otherTutorsRatings[match.tutorId]) {
            otherTutorsRatings[match.tutorId] = [];
          }
          otherTutorsRatings[match.tutorId].push({
            itemId: match.requestId,
            rating: match.tutorRating || 3
          });
        });
        
        // 计算当前教师与其他教师的相似度
        const similarities = {};
        Object.keys(otherTutorsRatings).forEach(otherId => {
          similarities[otherId] = calculateSimilarity(
            tutorRatings,
            otherTutorsRatings[otherId]
          );
        });
        
        // 基于相似教师的评分调整分数
        scoredRequests.forEach(item => {
          let similaritySum = 0;
          let weightedScoreSum = 0;
          
          Object.keys(similarities).forEach(otherId => {
            const similarity = similarities[otherId];
            if (similarity <= 0) return; // 忽略负相关或无相关
            
            // 查找该教师是否对该需求有评分
            const otherRating = otherTutorsRatings[otherId].find(
              r => r.itemId === item.request._id.toString()
            );
            
            if (otherRating) {
              similaritySum += similarity;
              weightedScoreSum += similarity * (otherRating.rating / 5) * 20; // 转换为0-20的分数
            }
          });
          
          // 如果有相似教师的评分，调整分数
          if (similaritySum > 0) {
            const collaborativeScore = weightedScoreSum / similaritySum;
            item.score = item.score * 0.8 + collaborativeScore; // 80%原始分数 + 20%协同过滤分数
          }
        });
      }
      
      // 按分数排序并返回前N个结果
      return scoredRequests
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map(item => ({
          ...item.request.toObject(),
          matchScore: Math.round(item.score)
        }));
      
    } catch (error) {
      console.error('推荐家教需求失败:', error);
      throw error;
    }
  }
  
  /**
   * 为家长推荐合适的教师
   * @param {String} parentId - 家长ID
   * @param {Object} options - 选项参数
   * @param {Number} options.limit - 返回结果数量限制
   * @param {Number} options.maxDistance - 最大距离限制（公里）
   * @returns {Promise<Array>} 推荐的教师列表
   */
  async recommendTutorsForParent(parentId, options = {}) {
    const { limit = 10, maxDistance = 10 } = options;
    
    try {
      // 获取家长信息
      const parent = await RecommendationRepository.findParentById(parentId);
      if (!parent) {
        throw new Error('家长不存在');
      }
      
      // 获取家长位置和孩子信息
      const parentLocation = parent.location.coordinates.coordinates;
      const parentCity = parent.location.city;
      const childrenGrades = parent.children.map(child => child.grade);
      const childrenSubjects = parent.children.flatMap(child => 
        child.subjects.map(subject => subject.name)
      );
      
      // 查询条件：已验证的教师
      const baseQuery = { isVerified: true };
      
      // 第一步：基于地理位置筛选
      // 1. 同城市的教师
      const sameCityTutors = await RecommendationRepository.getTutorsBySameCity(parentCity, 50);
      
      // 2. 不同城市但距离在范围内的教师
      const geoNearTutors = await RecommendationRepository.getTutorsByDifferentCity(parentCity, 50);
      
      // 过滤掉距离过远的教师
      const filteredGeoTutors = geoNearTutors.filter(tutor => {
        if (!tutor.location || !tutor.location.geo || !tutor.location.geo.coordinates) return false;
        
        const distance = calculateDistance(
          parentLocation,
          tutor.location.geo.coordinates
        );
        return distance <= maxDistance;
      });
      
      // 合并两种教师
      const allTutors = [...sameCityTutors, ...filteredGeoTutors];
      
      // 第二步：计算匹配度分数
      const scoredTutors = allTutors.map(tutor => {
        // 计算科目匹配度
        const subjectMatchCount = tutor.subjects.filter(subject => 
          childrenSubjects.includes(subject.name)
        ).length;
        
        const subjectMatchScore = subjectMatchCount > 0 
          ? Math.min(subjectMatchCount / childrenSubjects.length * 35, 35) 
          : 0;
        
        // 计算年级匹配度
        const tutorGrades = tutor.subjects.flatMap(subject => subject.grades);
        const gradeMatchCount = childrenGrades.filter(grade => 
          tutorGrades.includes(grade)
        ).length;
        
        const gradeMatchScore = gradeMatchCount > 0 
          ? Math.min(gradeMatchCount / childrenGrades.length * 25, 25) 
          : 0;
        
        // 计算价格匹配度
        // 假设家长的预算范围是从子女科目的平均预算计算
        const avgBudgetMin = parent.children.flatMap(child => 
          child.subjects.map(subject => subject.budget?.min || 0)
        ).reduce((sum, val) => sum + val, 0) / childrenSubjects.length;
        
        const avgBudgetMax = parent.children.flatMap(child => 
          child.subjects.map(subject => subject.budget?.max || 0)
        ).reduce((sum, val) => sum + val, 0) / childrenSubjects.length;
        
        let priceMatchScore = 0;
        if (tutor.pricing && tutor.pricing.basePrice) {
          if (tutor.pricing.basePrice >= avgBudgetMin && tutor.pricing.basePrice <= avgBudgetMax) {
            priceMatchScore = 20;
          } else if (tutor.pricing.basePrice < avgBudgetMin) {
            priceMatchScore = 16; // 80% 分数
          } else if (tutor.pricing.basePrice > avgBudgetMax && tutor.pricing.basePrice <= avgBudgetMax * 1.2) {
            priceMatchScore = 10; // 50% 分数
          }
        }
        
        // 计算位置匹配度
        let locationMatchScore = 0;
        
        // 如果在同一城市，基础分
        if (tutor.location.city === parentCity) {
          locationMatchScore += 10;
        }
        
        // 如果在同一区域，额外加分
        if (tutor.location.district === parent.location.district) {
          locationMatchScore += 10;
        }
        
        // 计算总分
        const totalScore = subjectMatchScore + gradeMatchScore + priceMatchScore + locationMatchScore;
        
        return {
          tutor,
          score: totalScore
        };
      });
      
      // 第三步：基于协同过滤调整分数
      // 获取家长的历史匹配记录
      const parentMatches = await mongoose.model('Match').find({ parentId });
      
      // 如果家长有历史匹配，使用协同过滤进行调整
      if (parentMatches.length > 0) {
        // 获取所有家长的匹配记录，用于协同过滤
        const allParentMatches = await mongoose.model('Match').find({
          parentId: { $ne: parentId }
        });
        
        // 构建评分矩阵
        const parentRatings = parentMatches.map(match => ({
          itemId: match.tutorId,
          rating: match.parentRating || 3 // 默认评分
        }));
        
        // 为每个其他家长构建评分
        const otherParentsRatings = {};
        allParentMatches.forEach(match => {
          if (!otherParentsRatings[match.parentId]) {
            otherParentsRatings[match.parentId] = [];
          }
          otherParentsRatings[match.parentId].push({
            itemId: match.tutorId,
            rating: match.parentRating || 3
          });
        });
        
        // 计算当前家长与其他家长的相似度
        const similarities = {};
        Object.keys(otherParentsRatings).forEach(otherId => {
          similarities[otherId] = calculateSimilarity(
            parentRatings,
            otherParentsRatings[otherId]
          );
        });
        
        // 基于相似家长的评分调整分数
        scoredTutors.forEach(item => {
          let similaritySum = 0;
          let weightedScoreSum = 0;
          
          Object.keys(similarities).forEach(otherId => {
            const similarity = similarities[otherId];
            if (similarity <= 0) return; // 忽略负相关或无相关
            
            // 查找该家长是否对该教师有评分
            const otherRating = otherParentsRatings[otherId].find(
              r => r.itemId === item.tutor.customId
            );
            
            if (otherRating) {
              similaritySum += similarity;
              weightedScoreSum += similarity * (otherRating.rating / 5) * 20; // 转换为0-20的分数
            }
          });
          
          // 如果有相似家长的评分，调整分数
          if (similaritySum > 0) {
            const collaborativeScore = weightedScoreSum / similaritySum;
            item.score = item.score * 0.8 + collaborativeScore; // 80%原始分数 + 20%协同过滤分数
          }
        });
      }
      
      // 按分数排序并返回前N个结果
      return scoredTutors
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map(item => ({
          ...item.tutor.toObject(),
          matchScore: Math.round(item.score)
        }));
      
    } catch (error) {
      console.error('推荐教师失败:', error);
      throw error;
    }
  }
  /**
   * 收集用户反馈数据
   * 用于协同过滤推荐系统的改进
   * @param {String} matchId - 匹配ID
   * @param {Object} feedback - 反馈数据
   * @returns {Promise<Object>} 处理结果
   */
  async collectFeedback(matchId, feedback) {
    try {
      // 获取匹配记录
      const match = await RecommendationRepository.findMatchById(matchId);
      if (!match) {
        throw new Error('匹配记录不存在');
      }
      
      // 更新匹配记录中的评分和评价
      const updateData = {};
      
      if (feedback.role === 'parent') {
        updateData.parentRating = feedback.rating;
        updateData.parentReview = feedback.review;
      } else if (feedback.role === 'tutor') {
        updateData.tutorRating = feedback.rating;
        updateData.tutorReview = feedback.review;
      }
      
      // 更新匹配记录
      await RecommendationRepository.updateMatch(match._id, updateData);
      
      return { success: true, message: '反馈已收集' };
      
    } catch (error) {
      console.error('收集反馈失败:', error);
      return { success: false, message: error.message };
    }
  }
}

module.exports = new RecommendationService();
