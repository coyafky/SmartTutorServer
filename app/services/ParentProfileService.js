const Parent = require('../../models/Parent');

class ParentProfileService {
  // 创建家长档案
  static async createProfile(profileData) {
    try {
      // 验证必须提供 parentId
      if (!profileData.parentId) {
        throw new Error('缺少 parentId，无法创建家长档案');
      }
      
      // 确保有基本的位置信息和有效的坐标
      if (!profileData.location) {
        profileData.location = {
          district: '未知区域',
          city: '未知城市',
          coordinates: {
            type: 'Point',
            coordinates: [116.3, 39.9]  // 默认坐标，北京市中心
          }
        };
      } else if (!profileData.location.coordinates || !profileData.location.coordinates.coordinates) {
        // 如果有位置信息但没有坐标，添加默认坐标
        profileData.location.coordinates = {
          type: 'Point',
          coordinates: [116.3, 39.9]  // 默认坐标，北京市中心
        };
      }

      // 添加必要的昵称字段，如果没有提供
      if (!profileData.nickname) {
        // 使用 parentId 的一部分作为默认昵称
        profileData.nickname = `家长_${profileData.parentId.substring(7)}`;  // 去除 'PARENT_' 前缀
      }

      // 创建并保存家长档案
      const parent = new Parent(profileData);
      return await parent.save();
    } catch (error) {
      throw new Error(`创建家长档案失败: ${error.message}`);
    }
  }

  // 获取家长档案
  static async getProfile(parentId) {
    try {
      const profile = await Parent.findOne({ parentId });
      if (!profile) {
        throw new Error('未找到家长档案');
      }
      return profile;
    } catch (error) {
      throw new Error(`获取家长档案失败: ${error.message}`);
    }
  }

  // 更新家长档案
  static async updateProfile(parentId, updateData) {
    try {
      const profile = await Parent.findOneAndUpdate(
        { parentId },
        { $set: updateData },
        { new: true, runValidators: true }
      );
      if (!profile) {
        throw new Error('未找到家长档案');
      }
      return profile;
    } catch (error) {
      throw new Error(`更新家长档案失败: ${error.message}`);
    }
  }

  // 删除家长档案
  static async deleteProfile(parentId) {
    try {
      const profile = await Parent.findOneAndUpdate(
        { parentId },
        { status: 'inactive' },
        { new: true }
      );
      if (!profile) {
        throw new Error('未找到家长档案');
      }
      return profile;
    } catch (error) {
      throw new Error(`删除家长档案失败: ${error.message}`);
    }
  }

  // 更新统计数据
  static async updateStatistics(parentId, statisticsData) {
    try {
      const profile = await Parent.findOneAndUpdate(
        { parentId },
        { $inc: statisticsData },
        { new: true }
      );
      if (!profile) {
        throw new Error('未找到家长档案');
      }
      return profile;
    } catch (error) {
      throw new Error(`更新统计数据失败: ${error.message}`);
    }
  }

  // 获取到和自己相同城市的教师数据
  static async getTutorsByCity(parentId) {
    try {
      const profile = await Parent.findOne({ parentId });
      if (!profile) {
        throw new Error('未找到家长档案');
      }
      const city = profile.location.city;
      const tutors = await TutorProfile.find({ 'location.city': city });
      return tutors;
    } catch (error) {
      throw new Error(`获取到和自己相同城市的教师数据失败: ${error.message}`);
    }
  }

  // 按照科目来获取到对应的教师数据
  static async getTutorsBySubject(parentId, subject) {
    try {
      const profile = await Parent.findOne({ parentId });
      if (!profile) {
        throw new Error('未找到家长档案');
      }
      const city = profile.location.city;
      const tutors = await TutorProfile.find({
        'location.city': city,
        'subjects.name': subject,
      });
      return tutors;
    } catch (error) {
      throw new Error(
        `获取到和自己相同城市且科目相同的教师数据失败: ${error.message}`
      );
    }
  }

  // 按照地理位置获取到对应的教师数据
  static async getTutorsByLocation(parentId, location) {
    try {
      const profile = await Parent.findOne({ parentId });
      if (!profile) {
        throw new Error('未找到家长档案');
      }
      const distance = 1000; // 1000m
      const tutors = await TutorProfile.find({
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [location.longitude, location.latitude],
            },
            $maxDistance: distance,
          },
        },
      });
      return tutors;
    } catch (error) {
      throw new Error(
        `获取到和自己相同地理位置的教师数据失败: ${error.message}`
      );
    }
  }

  // 按照价格区间获取到对应的教师数据
  static async getTutorsByPriceRange(parentId, minPrice, maxPrice) {
    try {
      const profile = await Parent.findOne({ parentId });
      if (!profile) {
        throw new Error('未找到家长档案');
      }
      const city = profile.location.city;
      const tutors = await TutorProfile.find({
        'location.city': city,
        'pricing.basePrice': { $gte: minPrice, $lte: maxPrice },
      });
      return tutors;
    } catch (error) {
      throw new Error(
        `获取到和自己相同城市且价格区间相同的教师数据失败: ${error.message}`
      );
    }
  }
  // 按照教师的学历、对应的教师数据
  static async getTutorsByEducation(parentId, educationLevel) {
    try {
      const profile = await Parent.findOne({ parentId });
      if (!profile) {
        throw new Error('未找到家长档案');
      }
      const city = profile.location.city;
      const tutors = await TutorProfile.find({
        'location.city': city,
        'education.level': education.level,
      
      });
      return tutors;
    } catch (error) {
      throw new Error(
        `获取到和自己相同城市要求学历、教师数据失败: ${error.message}`
      );
    }
  }

  // 按照开课时间来获取到对应的教师数据
  static async getTutorsBySession(parentId, session) {
    try {
      const profile = await Parent.findOne({ parentId });
      if (!profile) {
        throw new Error('未找到家长档案');
      }
      const city = profile.location.city;
      const tutors = await TutorProfile.find({
        'location.city': city,
        'sessions.day': session.day,
        'sessions.period': session.period,
      });
      return tutors;
    } catch (error) {
      throw new Error(
        `获取到和自己相同城市且开课时间相同的教师数据失败: ${error.message}`
      );
    }
  }

  // 多条件级联筛选方法
  static async getTutorsByMultipleConditions(parentId, conditions) {
    try {
      const profile = await Parent.findOne({ parentId });
      if (!profile) {
        throw new Error('未找到家长档案');
      }
      const city = profile.location.city;
      
      // 构建查询条件，基础条件是相同城市
      const query = { 'location.city': city };
      
      // 添加可选筛选条件
      if (conditions.subject) {
        query['teachingExperience.subjects.name'] = conditions.subject;
      }
      
      if (conditions.minPrice !== undefined && conditions.maxPrice !== undefined) {
        query['pricing.basePrice'] = { $gte: conditions.minPrice, $lte: conditions.maxPrice };
      }
      
      if (conditions.educationLevel) {
        query['education.level'] = conditions.educationLevel;
      }
      
      if (conditions.minRating) {
        query['ratings.average'] = { $gte: conditions.minRating };
      }
      
      if (conditions.minExperience) {
        query['teachingExperience.years'] = { $gte: conditions.minExperience };
      }
      
      if (conditions.availabilityStatus) {
        query['availabilityStatus'] = conditions.availabilityStatus;
      }
      
      if (conditions.session) {
        if (conditions.session.day) {
          query['schedule.weekend.sessions.day'] = conditions.session.day;
        }
        if (conditions.session.period) {
          query['schedule.weekend.sessions.period'] = conditions.session.period;
        }
      }
      
      // 执行查询
      const tutors = await TutorProfile.find(query);
      return tutors;
    } catch (error) {
      throw new Error(
        `多条件筛选教师失败: ${error.message}`
      );
    }
  }
  
  // 按照科目和价格区间筛选教师
  static async getTutorsBySubjectAndPrice(parentId, subject, minPrice, maxPrice) {
    try {
      const profile = await Parent.findOne({ parentId });
      if (!profile) {
        throw new Error('未找到家长档案');
      }
      const city = profile.location.city;
      const tutors = await TutorProfile.find({
        'location.city': city,
        'teachingExperience.subjects.name': subject,
        'pricing.basePrice': { $gte: minPrice, $lte: maxPrice }
      });
      return tutors;
    } catch (error) {
      throw new Error(
        `按科目和价格区间筛选教师失败: ${error.message}`
      );
    }
  }

  // 按照科目、学历和评分筛选教师
  static async getTutorsBySubjectEducationAndRating(parentId, subject, educationLevel, minRating) {
    try {
      const profile = await Parent.findOne({ parentId });
      if (!profile) {
        throw new Error('未找到家长档案');
      }
      const city = profile.location.city;
      const tutors = await TutorProfile.find({
        'location.city': city,
        'teachingExperience.subjects.name': subject,
        'education.level': educationLevel,
        'ratings.average': { $gte: minRating }
      });
      return tutors;
    } catch (error) {
      throw new Error(
        `按科目、学历和评分筛选教师失败: ${error.message}`
      );
    }
  }

  // 按照开课时间、科目和教学经验筛选教师
  static async getTutorsBySessionSubjectAndExperience(parentId, session, subject, minExperience) {
    try {
      const profile = await Parent.findOne({ parentId });
      if (!profile) {
        throw new Error('未找到家长档案');
      }
      const city = profile.location.city;
      const tutors = await TutorProfile.find({
        'location.city': city,
        'schedule.weekend.sessions.day': session.day,
        'schedule.weekend.sessions.period': session.period,
        'teachingExperience.subjects.name': subject,
        'teachingExperience.years': { $gte: minExperience }
      });
      return tutors;
    } catch (error) {
      throw new Error(
        `按开课时间、科目和教学经验筛选教师失败: ${error.message}`
      );
    }
  }
}
  


module.exports = ParentProfileService;
