/**
 * 机器学习推荐服务
 * 提供基于机器学习的智能推荐功能
 * @module services/MLRecommendationService
 */

const mongoose = require('mongoose');
const TutorProfile = require('../../models/TutorProfile');
const Parent = require('../../models/Parent');
const TutoringRequest = require('../../models/TutoringRequest');
const Match = require('../../models/Match');
const Lesson = require('../../models/Lesson');
const fs = require('fs');
const path = require('path');
const { Matrix } = require('ml-matrix');
const { KMeans } = require('ml-kmeans');
const { RandomForestClassifier } = require('ml-random-forest');
const { SVM } = require('ml-svm');

// 模型存储路径
const MODEL_DIR = path.join(__dirname, '../../data/ml_models');

// 确保模型目录存在
if (!fs.existsSync(MODEL_DIR)) {
  fs.mkdirSync(MODEL_DIR, { recursive: true });
}

/**
 * 机器学习推荐服务类
 * 提供基于机器学习的推荐功能
 */
class MLRecommendationService {
  constructor() {
    // 初始化模型
    this.models = {
      tutorRecommender: null,
      parentRecommender: null,
      tutorClusterModel: null,
      parentClusterModel: null
    };
    
    // 特征工程配置
    this.featureConfig = {
      // 教师特征
      tutor: {
        categorical: ['gender', 'educationLevel', 'teachingStyle'],
        numerical: ['experience', 'rating', 'completionRate', 'responseRate'],
        weights: {
          subjects: 0.3,
          grades: 0.2,
          teachingStyle: 0.2,
          rating: 0.15,
          experience: 0.15
        }
      },
      // 家长特征
      parent: {
        categorical: ['preferredGender', 'preferredTeachingStyle'],
        numerical: ['budgetMin', 'budgetMax', 'childrenCount'],
        weights: {
          subjects: 0.3,
          grades: 0.2,
          budget: 0.2,
          preferredTeachingStyle: 0.15,
          location: 0.15
        }
      }
    };
    
    // 加载现有模型
    this.loadModels();
  }
  
  /**
   * 加载保存的模型
   * @private
   */
  loadModels() {
    try {
      // 尝试加载教师推荐模型
      const tutorModelPath = path.join(MODEL_DIR, 'tutor_recommender.json');
      if (fs.existsSync(tutorModelPath)) {
        const modelData = JSON.parse(fs.readFileSync(tutorModelPath, 'utf8'));
        this.models.tutorRecommender = RandomForestClassifier.load(modelData);
        console.log('已加载教师推荐模型');
      }
      
      // 尝试加载家长推荐模型
      const parentModelPath = path.join(MODEL_DIR, 'parent_recommender.json');
      if (fs.existsSync(parentModelPath)) {
        const modelData = JSON.parse(fs.readFileSync(parentModelPath, 'utf8'));
        this.models.parentRecommender = RandomForestClassifier.load(modelData);
        console.log('已加载家长推荐模型');
      }
      
      // 尝试加载聚类模型
      const tutorClusterPath = path.join(MODEL_DIR, 'tutor_clusters.json');
      if (fs.existsSync(tutorClusterPath)) {
        const clusterData = JSON.parse(fs.readFileSync(tutorClusterPath, 'utf8'));
        this.models.tutorClusterModel = KMeans.load(clusterData);
        console.log('已加载教师聚类模型');
      }
      
      const parentClusterPath = path.join(MODEL_DIR, 'parent_clusters.json');
      if (fs.existsSync(parentClusterPath)) {
        const clusterData = JSON.parse(fs.readFileSync(parentClusterPath, 'utf8'));
        this.models.parentClusterModel = KMeans.load(clusterData);
        console.log('已加载家长聚类模型');
      }
    } catch (error) {
      console.error('加载模型失败:', error);
    }
  }
  
  /**
   * 保存模型
   * @private
   * @param {String} modelName - 模型名称
   * @param {Object} model - 模型对象
   */
  saveModel(modelName, model) {
    try {
      const modelPath = path.join(MODEL_DIR, `${modelName}.json`);
      fs.writeFileSync(modelPath, JSON.stringify(model.toJSON()));
      console.log(`模型 ${modelName} 已保存`);
    } catch (error) {
      console.error(`保存模型 ${modelName} 失败:`, error);
    }
  }
  
  /**
   * 提取教师特征
   * @private
   * @param {Object} tutor - 教师对象
   * @returns {Array} 特征向量
   */
  extractTutorFeatures(tutor) {
    // 基础特征
    const features = [];
    
    // 教学经验（年）
    features.push(tutor.teachingExperience?.years || 0);
    
    // 评分
    features.push(tutor.rating || 3);
    
    // 完成率
    features.push(tutor.statistics?.completionRate || 0.8);
    
    // 响应率
    features.push(tutor.statistics?.responseRate || 0.8);
    
    // 教学风格（编码为数值）
    const teachingStyleMap = {
      'strict': 1,
      'encouraging': 2,
      'patient': 3,
      'interactive': 4,
      'analytical': 5
    };
    features.push(teachingStyleMap[tutor.teachingStyle] || 0);
    
    // 科目编码（使用one-hot编码）
    const commonSubjects = ['math', 'english', 'chinese', 'physics', 'chemistry', 'biology', 'history', 'geography'];
    commonSubjects.forEach(subject => {
      features.push(tutor.subjects.some(s => s.name.toLowerCase() === subject) ? 1 : 0);
    });
    
    // 年级编码（使用one-hot编码）
    const gradeGroups = ['primary', 'junior', 'senior', 'college'];
    const tutorGrades = tutor.subjects.flatMap(s => s.grades);
    gradeGroups.forEach(grade => {
      features.push(tutorGrades.some(g => g.includes(grade)) ? 1 : 0);
    });
    
    // 价格区间
    features.push(tutor.pricing?.basePrice || 0);
    
    // 地理位置（使用区域编码）
    if (tutor.location?.city) {
      // 这里可以添加城市编码，简化为城市的首字母ASCII码
      features.push(tutor.location.city.charCodeAt(0) % 100);
    } else {
      features.push(0);
    }
    
    return features;
  }
  
  /**
   * 提取家长特征
   * @private
   * @param {Object} parent - 家长对象
   * @returns {Array} 特征向量
   */
  extractParentFeatures(parent) {
    // 基础特征
    const features = [];
    
    // 孩子数量
    features.push(parent.children?.length || 1);
    
    // 预算区间
    const avgBudgetMin = parent.children?.flatMap(child => 
      child.subjects.map(subject => subject.budget?.min || 0)
    ).reduce((sum, val) => sum + val, 0) / (parent.children?.flatMap(child => child.subjects).length || 1);
    
    const avgBudgetMax = parent.children?.flatMap(child => 
      child.subjects.map(subject => subject.budget?.max || 0)
    ).reduce((sum, val) => sum + val, 0) / (parent.children?.flatMap(child => child.subjects).length || 1);
    
    features.push(avgBudgetMin);
    features.push(avgBudgetMax);
    
    // 偏好的教学风格（编码为数值）
    const teachingStyleMap = {
      'strict': 1,
      'encouraging': 2,
      'patient': 3,
      'interactive': 4,
      'analytical': 5
    };
    features.push(teachingStyleMap[parent.preferences?.teachingStyle] || 0);
    
    // 孩子的科目（使用one-hot编码）
    const commonSubjects = ['math', 'english', 'chinese', 'physics', 'chemistry', 'biology', 'history', 'geography'];
    const childrenSubjects = parent.children?.flatMap(child => 
      child.subjects.map(subject => subject.name.toLowerCase())
    ) || [];
    
    commonSubjects.forEach(subject => {
      features.push(childrenSubjects.includes(subject) ? 1 : 0);
    });
    
    // 孩子的年级（使用one-hot编码）
    const gradeGroups = ['primary', 'junior', 'senior', 'college'];
    const childrenGrades = parent.children?.map(child => child.grade) || [];
    
    gradeGroups.forEach(grade => {
      features.push(childrenGrades.some(g => g.includes(grade)) ? 1 : 0);
    });
    
    // 地理位置（使用区域编码）
    if (parent.location?.city) {
      // 这里可以添加城市编码，简化为城市的首字母ASCII码
      features.push(parent.location.city.charCodeAt(0) % 100);
    } else {
      features.push(0);
    }
    
    return features;
  }
  
  /**
   * 提取匹配特征
   * @private
   * @param {Object} tutor - 教师对象
   * @param {Object} parent - 家长对象或需求对象
   * @returns {Array} 特征向量
   */
  extractMatchFeatures(tutor, parent) {
    // 合并教师和家长特征
    const tutorFeatures = this.extractTutorFeatures(tutor);
    const parentFeatures = this.extractParentFeatures(parent);
    
    // 计算交互特征
    const interactionFeatures = [];
    
    // 科目匹配度
    const tutorSubjects = tutor.subjects.map(s => s.name.toLowerCase());
    const parentSubjects = parent.children?.flatMap(child => 
      child.subjects.map(subject => subject.name.toLowerCase())
    ) || [];
    
    const subjectMatchCount = tutorSubjects.filter(subject => 
      parentSubjects.includes(subject)
    ).length;
    
    interactionFeatures.push(subjectMatchCount / Math.max(1, parentSubjects.length));
    
    // 年级匹配度
    const tutorGrades = tutor.subjects.flatMap(subject => subject.grades);
    const parentGrades = parent.children?.map(child => child.grade) || [];
    
    const gradeMatchCount = parentGrades.filter(grade => 
      tutorGrades.includes(grade)
    ).length;
    
    interactionFeatures.push(gradeMatchCount / Math.max(1, parentGrades.length));
    
    // 价格匹配度
    const avgBudgetMin = parent.children?.flatMap(child => 
      child.subjects.map(subject => subject.budget?.min || 0)
    ).reduce((sum, val) => sum + val, 0) / (parent.children?.flatMap(child => child.subjects).length || 1);
    
    const avgBudgetMax = parent.children?.flatMap(child => 
      child.subjects.map(subject => subject.budget?.max || 0)
    ).reduce((sum, val) => sum + val, 0) / (parent.children?.flatMap(child => child.subjects).length || 1);
    
    const tutorPrice = tutor.pricing?.basePrice || 0;
    
    // 价格匹配度（0-1范围）
    let priceMatch = 0;
    if (tutorPrice >= avgBudgetMin && tutorPrice <= avgBudgetMax) {
      priceMatch = 1;
    } else if (tutorPrice < avgBudgetMin) {
      priceMatch = 0.8;
    } else if (tutorPrice > avgBudgetMax && tutorPrice <= avgBudgetMax * 1.2) {
      priceMatch = 0.5;
    }
    
    interactionFeatures.push(priceMatch);
    
    // 教学风格匹配度
    const parentStyle = parent.preferences?.teachingStyle;
    const tutorStyle = tutor.teachingStyle;
    
    interactionFeatures.push(parentStyle === tutorStyle ? 1 : 0);
    
    // 合并所有特征
    return [...tutorFeatures, ...parentFeatures, ...interactionFeatures];
  }
  
  /**
   * 训练推荐模型
   * @public
   * @returns {Promise<Object>} 训练结果
   */
  async trainModels() {
    try {
      console.log('开始训练推荐模型...');
      
      // 获取所有匹配数据
      const matches = await Match.find({})
        .populate('tutorId')
        .populate('parentId')
        .lean();
      
      console.log(`获取到 ${matches.length} 条匹配数据`);
      
      if (matches.length < 10) {
        console.log('数据量不足，无法训练模型');
        return { success: false, message: '数据量不足，无法训练模型' };
      }
      
      // 准备训练数据
      const trainingData = [];
      const trainingLabels = [];
      
      matches.forEach(match => {
        if (!match.tutorId || !match.parentId) return;
        
        // 提取特征
        const features = this.extractMatchFeatures(match.tutorId, match.parentId);
        
        // 标签：匹配是否成功（基于评分和状态）
        const isSuccessful = 
          (match.status === 'completed' && 
           ((match.parentRating && match.parentRating >= 4) || 
            (match.tutorRating && match.tutorRating >= 4)));
        
        trainingData.push(features);
        trainingLabels.push(isSuccessful ? 1 : 0);
      });
      
      console.log(`准备了 ${trainingData.length} 条训练数据`);
      
      if (trainingData.length < 10) {
        console.log('有效数据量不足，无法训练模型');
        return { success: false, message: '有效数据量不足，无法训练模型' };
      }
      
      // 训练随机森林模型
      const classifier = new RandomForestClassifier({
        nEstimators: 50,
        maxDepth: 10,
        seed: 42
      });
      
      classifier.train(trainingData, trainingLabels);
      console.log('模型训练完成');
      
      // 保存模型
      this.models.tutorRecommender = classifier;
      this.saveModel('tutor_recommender', classifier);
      
      // 训练聚类模型
      this.trainClusterModels();
      
      return { success: true, message: '模型训练成功' };
      
    } catch (error) {
      console.error('训练模型失败:', error);
      return { success: false, message: `训练失败: ${error.message}` };
    }
  }
  
  /**
   * 训练聚类模型
   * @private
   */
  async trainClusterModels() {
    try {
      // 获取所有教师数据
      const tutors = await TutorProfile.find({}).lean();
      
      if (tutors.length > 10) {
        // 提取教师特征
        const tutorFeatures = tutors.map(tutor => this.extractTutorFeatures(tutor));
        
        // 训练K-means聚类
        const kmeans = new KMeans(Math.min(5, Math.floor(tutors.length / 3)));
        const tutorClusters = kmeans.train(tutorFeatures);
        
        // 保存模型
        this.models.tutorClusterModel = kmeans;
        this.saveModel('tutor_clusters', kmeans);
        console.log('教师聚类模型训练完成');
      }
      
      // 获取所有家长数据
      const parents = await Parent.find({}).lean();
      
      if (parents.length > 10) {
        // 提取家长特征
        const parentFeatures = parents.map(parent => this.extractParentFeatures(parent));
        
        // 训练K-means聚类
        const kmeans = new KMeans(Math.min(5, Math.floor(parents.length / 3)));
        const parentClusters = kmeans.train(parentFeatures);
        
        // 保存模型
        this.models.parentClusterModel = kmeans;
        this.saveModel('parent_clusters', kmeans);
        console.log('家长聚类模型训练完成');
      }
      
    } catch (error) {
      console.error('训练聚类模型失败:', error);
    }
  }
  
  /**
   * 为家长推荐合适的教师
   * 使用机器学习模型进行推荐
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
      const parent = await Parent.findOne({ customId: parentId }).lean();
      if (!parent) {
        throw new Error('家长不存在');
      }
      
      // 获取家长位置和孩子信息
      const parentLocation = parent.location?.coordinates?.coordinates || [0, 0];
      const parentCity = parent.location?.city || '';
      
      // 查询条件：已验证的教师
      const baseQuery = { isVerified: true };
      
      // 第一步：基于地理位置和基本条件筛选候选教师
      // 1. 同城市的教师
      const sameCityTutors = await TutorProfile.find({
        ...baseQuery,
        'location.city': parentCity
      }).limit(50).lean();
      
      // 2. 不同城市但距离在范围内的教师
      const geoNearTutors = await TutorProfile.find({
        ...baseQuery,
        'location.city': { $ne: parentCity }
      }).limit(50).lean();
      
      // 过滤掉距离过远的教师
      const filteredGeoTutors = geoNearTutors.filter(tutor => {
        if (!tutor.location || !tutor.location.geo || !tutor.location.geo.coordinates) return false;
        
        const distance = this.calculateDistance(
          parentLocation,
          tutor.location.geo.coordinates
        );
        return distance <= maxDistance;
      });
      
      // 合并两种教师
      const allTutors = [...sameCityTutors, ...filteredGeoTutors];
      
      if (allTutors.length === 0) {
        return [];
      }
      
      // 第二步：使用机器学习模型进行推荐
      const scoredTutors = [];
      
      // 如果有训练好的模型，使用模型预测
      if (this.models.tutorRecommender) {
        for (const tutor of allTutors) {
          // 提取匹配特征
          const features = this.extractMatchFeatures(tutor, parent);
          
          // 预测匹配概率
          const prediction = this.models.tutorRecommender.predict([features])[0];
          const probability = this.models.tutorRecommender.predictProbability([features])[0][1] || 0.5;
          
          scoredTutors.push({
            tutor,
            score: probability * 100, // 转换为0-100分
            predicted: prediction === 1
          });
        }
      } else {
        // 如果没有训练好的模型，使用传统方法计算分数
        for (const tutor of allTutors) {
          const score = this.calculateTraditionalScore(tutor, parent);
          
          scoredTutors.push({
            tutor,
            score,
            predicted: score >= 70 // 70分以上认为是好匹配
          });
        }
      }
      
      // 第三步：基于聚类模型进行多样化推荐
      let finalRecommendations = [];
      
      if (this.models.tutorClusterModel && scoredTutors.length > limit) {
        // 获取家长特征
        const parentFeatures = this.extractParentFeatures(parent);
        
        // 对教师进行聚类
        const tutorClusters = {};
        
        scoredTutors.forEach(item => {
          const tutorFeatures = this.extractTutorFeatures(item.tutor);
          const cluster = this.models.tutorClusterModel.predict([tutorFeatures])[0];
          
          if (!tutorClusters[cluster]) {
            tutorClusters[cluster] = [];
          }
          
          tutorClusters[cluster].push(item);
        });
        
        // 从每个聚类中选择最佳教师
        const clusterKeys = Object.keys(tutorClusters);
        const tutorsPerCluster = Math.max(1, Math.floor(limit / clusterKeys.length));
        
        clusterKeys.forEach(cluster => {
          const clusterTutors = tutorClusters[cluster];
          
          // 按分数排序
          clusterTutors.sort((a, b) => b.score - a.score);
          
          // 添加到最终推荐中
          finalRecommendations = finalRecommendations.concat(
            clusterTutors.slice(0, tutorsPerCluster)
          );
        });
        
        // 如果推荐数量不足，从高分教师中补充
        if (finalRecommendations.length < limit) {
          const remainingCount = limit - finalRecommendations.length;
          const usedIds = new Set(finalRecommendations.map(item => item.tutor._id.toString()));
          
          const additionalTutors = scoredTutors
            .filter(item => !usedIds.has(item.tutor._id.toString()))
            .sort((a, b) => b.score - a.score)
            .slice(0, remainingCount);
          
          finalRecommendations = finalRecommendations.concat(additionalTutors);
        }
      } else {
        // 如果没有聚类模型或教师数量不足，直接按分数排序
        finalRecommendations = scoredTutors.sort((a, b) => b.score - a.score).slice(0, limit);
      }
      
      // 返回推荐结果
      return finalRecommendations.map(item => ({
        ...item.tutor,
        matchScore: Math.round(item.score),
        predicted: item.predicted
      }));
      
    } catch (error) {
      console.error('机器学习推荐教师失败:', error);
      throw error;
    }
  }
  
  /**
   * 为教师推荐合适的家教需求
   * 使用机器学习模型进行推荐
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
      const tutor = await TutorProfile.findOne({ customId: tutorId }).lean();
      if (!tutor) {
        throw new Error('教师不存在');
      }
      
      // 获取教师位置
      const tutorLocation = tutor.location?.geo?.coordinates || [0, 0];
      const tutorCity = tutor.location?.city || '';
      
      // 查询条件：已发布状态的需求
      const baseQuery = { status: 'published' };
      
      // 第一步：基于地理位置筛选
      // 1. 同城市的需求
      const sameCityRequests = await TutoringRequest.find({
        ...baseQuery,
        'location.city': tutorCity
      }).populate('parentId').limit(50).lean();
      
      // 2. 不同城市但距离在范围内的需求
      const geoNearRequests = await TutoringRequest.find({
        ...baseQuery,
        'location.city': { $ne: tutorCity }
      }).populate('parentId').limit(50).lean();
      
      // 过滤掉距离过远的需求
      const filteredGeoRequests = geoNearRequests.filter(request => {
        if (!request.location || !request.location.coordinates) return false;
        
        const distance = this.calculateDistance(
          tutorLocation,
          request.location.coordinates
        );
        return distance <= maxDistance;
      });
      
      // 合并两种需求
      const allRequests = [...sameCityRequests, ...filteredGeoRequests];
      
      if (allRequests.length === 0) {
        return [];
      }
      
      // 第二步：使用机器学习模型进行推荐
      const scoredRequests = [];
      
      // 如果有训练好的模型，使用模型预测
      if (this.models.tutorRecommender) {
        for (const request of allRequests) {
          if (!request.parentId) continue;
          
          // 提取匹配特征
          const features = this.extractMatchFeatures(tutor, request.parentId);
          
          // 预测匹配概率
          const prediction = this.models.tutorRecommender.predict([features])[0];
          const probability = this.models.tutorRecommender.predictProbability([features])[0][1] || 0.5;
          
          scoredRequests.push({
            request,
            score: probability * 100, // 转换为0-100分
            predicted: prediction === 1
          });
        }
      } else {
        // 如果没有训练好的模型，使用传统方法计算分数
        for (const request of allRequests) {
          if (!request.parentId) continue;
          
          const score = this.calculateTraditionalScore(tutor, request.parentId, request);
          
          scoredRequests.push({
            request,
            score,
            predicted: score >= 70 // 70分以上认为是好匹配
          });
        }
      }
      
      // 按分数排序并返回前N个结果
      return scoredRequests
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map(item => ({
          ...item.request,
          matchScore: Math.round(item.score),
          predicted: item.predicted
        }));
      
    } catch (error) {
      console.error('机器学习推荐家教需求失败:', error);
      throw error;
    }
  }
  
  /**
   * 计算两个地理坐标点之间的距离（公里）
   * 使用Haversine公式计算球面距离
   * @param {Array} coord1 - 第一个坐标 [经度, 纬度]
   * @param {Array} coord2 - 第二个坐标 [经度, 纬度]
   * @returns {Number} 距离（公里）
   */
  calculateDistance(coord1, coord2) {
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
   * 使用传统方法计算匹配分数
   * @param {Object} tutor - 教师对象
   * @param {Object} parent - 家长对象
   * @param {Object} request - 可选的需求对象
   * @returns {Number} 匹配分数 (0-100)
   */
  calculateTraditionalScore(tutor, parent, request = null) {
    const weights = {
      subject: 35,    // 科目匹配权重
      grade: 25,      // 年级匹配权重
      price: 20,      // 价格匹配权重
      location: 20    // 位置匹配权重
    };
    
    let score = 0;
    
    // 科目匹配度计算
    const tutorSubjects = tutor.subjects.map(s => s.name.toLowerCase());
    let requestSubject = '';
    let childrenSubjects = [];
    
    if (request) {
      requestSubject = request.subject?.name?.toLowerCase() || '';
      if (tutorSubjects.includes(requestSubject)) {
        score += weights.subject;
      }
    } else {
      childrenSubjects = parent.children?.flatMap(child => 
        child.subjects.map(subject => subject.name.toLowerCase())
      ) || [];
      
      const subjectMatchCount = tutorSubjects.filter(subject => 
        childrenSubjects.includes(subject)
      ).length;
      
      if (subjectMatchCount > 0) {
        score += Math.min(subjectMatchCount / childrenSubjects.length * weights.subject, weights.subject);
      }
    }
    
    // 年级匹配度计算
    const tutorGrades = tutor.subjects.flatMap(s => s.grades.map(g => g.toLowerCase()));
    let requestGrade = '';
    let childrenGrades = [];
    
    if (request) {
      requestGrade = request.grade?.toLowerCase() || '';
      if (tutorGrades.includes(requestGrade)) {
        score += weights.grade;
      }
    } else {
      childrenGrades = parent.children?.map(child => child.grade.toLowerCase()) || [];
      
      const gradeMatchCount = childrenGrades.filter(grade => 
        tutorGrades.includes(grade)
      ).length;
      
      if (gradeMatchCount > 0) {
        score += Math.min(gradeMatchCount / childrenGrades.length * weights.grade, weights.grade);
      }
    }
    
    // 价格匹配度计算
    const tutorPrice = tutor.pricing?.basePrice || 0;
    let minBudget = 0;
    let maxBudget = 0;
    
    if (request) {
      minBudget = request.budget?.min || 0;
      maxBudget = request.budget?.max || 0;
    } else {
      // 计算家长子女科目的平均预算
      const budgets = parent.children?.flatMap(child => 
        child.subjects.map(subject => subject.budget)
      ).filter(budget => budget) || [];
      
      if (budgets.length > 0) {
        minBudget = budgets.reduce((sum, budget) => sum + (budget.min || 0), 0) / budgets.length;
        maxBudget = budgets.reduce((sum, budget) => sum + (budget.max || 0), 0) / budgets.length;
      }
    }
    
    if (tutorPrice >= minBudget && tutorPrice <= maxBudget) {
      score += weights.price;
    } else if (tutorPrice < minBudget) {
      score += weights.price * 0.8; // 教师价格低于预算最低值，给部分分数
    } else if (tutorPrice > maxBudget && tutorPrice <= maxBudget * 1.2) {
      score += weights.price * 0.5; // 教师价格高于预算但在可接受范围内，给部分分数
    }
    
    // 位置匹配度计算
    let parentCity = '';
    let parentDistrict = '';
    
    if (request) {
      parentCity = request.location?.city || '';
      parentDistrict = request.location?.district || '';
    } else {
      parentCity = parent.location?.city || '';
      parentDistrict = parent.location?.district || '';
    }
    
    // 如果在同一区域，额外加分
    if (tutor.location?.district === parentDistrict) {
      score += weights.location * 0.6;
    }
    
    // 如果在同一城市，额外加分
    if (tutor.location?.city === parentCity) {
      score += weights.location * 0.4;
    }
    
    return Math.min(score, 100); // 确保分数不超过100
  }
  
  /**
   * 收集用户反馈数据
   * 用于模型训练和改进
   * @param {String} matchId - 匹配ID
   * @param {Object} feedback - 反馈数据
   * @returns {Promise<Object>} 处理结果
   */
  async collectFeedback(matchId, feedback) {
    try {
      // 获取匹配记录
      const match = await mongoose.model('Match').findOne({ matchId });
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
      await mongoose.model('Match').findByIdAndUpdate(
        match._id,
        { $set: updateData }
      );
      
      // 检查是否需要重新训练模型
      const matchCount = await mongoose.model('Match').countDocuments({
        $or: [
          { parentRating: { $exists: true } },
          { tutorRating: { $exists: true } }
        ]
      });
      
      // 当有足够的新反馈数据时，重新训练模型
      if (matchCount % 10 === 0 && matchCount >= 20) {
        // 异步训练模型，不阻塞当前请求
        this.trainModels().catch(err => {
          console.error('自动重新训练模型失败:', err);
        });
      }
      
      return { success: true, message: '反馈已收集' };
      
    } catch (error) {
      console.error('收集反馈失败:', error);
      return { success: false, message: error.message };
    }
  }
}

module.exports = new MLRecommendationService();
