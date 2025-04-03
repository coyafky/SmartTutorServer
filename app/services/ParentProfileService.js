const Parent = require('../../models/Parent');
const TutorProfile = require('../../models/TutorProfile');

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
            coordinates: [116.3, 39.9], // 默认坐标，北京市中心
          },
        };
      } else if (
        !profileData.location.coordinates ||
        !profileData.location.coordinates.coordinates
      ) {
        // 如果有位置信息但没有坐标，添加默认坐标
        profileData.location.coordinates = {
          type: 'Point',
          coordinates: [116.3, 39.9], // 默认坐标，北京市中心
        };
      }

      // 添加必要的昵称字段，如果没有提供
      if (!profileData.nickname) {
        // 使用 parentId 的一部分作为默认昵称
        profileData.nickname = `家长_${profileData.parentId.substring(7)}`; // 去除 'PARENT_' 前缀
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

      // 获取家长城市，并处理可能的差异（如"北京市"和"北京"）
      let city = profile.location.city;
      let cityPattern = city;

      // 如果城市名称以"市"结尾，创建一个不带"市"的版本
      if (city.endsWith('市')) {
        cityPattern = city.slice(0, -1);
      }

      console.log('查询城市条件:', {
        parentId,
        city,
        cityPattern,
        query: {
          'location.city': { $regex: new RegExp(`^${cityPattern}`, 'i') },
        },
      });

      // 使用正则表达式匹配城市（不区分"北京"和"北京市"）
      const cityRegex = new RegExp(`^${cityPattern}`, 'i');
      const tutors = await TutorProfile.find({
        'location.city': { $regex: cityRegex },
      });

      console.log(`找到${tutors.length}位同城市的教师`);
      return tutors;
    } catch (error) {
      console.error('查询同城市教师失败:', error);
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

      // 获取家长城市，并处理可能的差异（如"北京市"和"北京"）
      let city = profile.location.city;
      let cityPattern = city;

      // 如果城市名称以"市"结尾，创建一个不带"市"的版本
      if (city.endsWith('市')) {
        cityPattern = city.slice(0, -1);
      }

      console.log('查询条件:', {
        parentId,
        subject,
        city,
        cityPattern,
        query: {
          'location.city': { $regex: new RegExp(`^${cityPattern}`, 'i') },
          'teachingExperience.subjects.name': subject,
        },
      });

      // 先不加任何条件，查询所有教师
      const allTutors = await TutorProfile.find({});
      console.log('所有教师数量:', allTutors.length);

      // 检查第一个教师的数据结构
      if (allTutors.length > 0) {
        const sampleTutor = allTutors[0];
        console.log('教师数据示例:', {
          tutorId: sampleTutor.tutorId,
          city: sampleTutor.location?.city,
          subjects: sampleTutor.subjects,
          teachingExperience: sampleTutor.teachingExperience,
        });
      }

      // 使用正则表达式匹配城市（不区分"北京"和"北京市"）
      const cityRegex = new RegExp(`^${cityPattern}`, 'i');
      const tutorsByCity = await TutorProfile.find({
        'location.city': { $regex: cityRegex },
      });
      console.log('同城市教师数量:', tutorsByCity.length);

      // 只按科目筛选
      const tutorsBySubject = await TutorProfile.find({
        'teachingExperience.subjects.name': subject,
      });
      console.log('教授该科目的教师数量:', tutorsBySubject.length);

      // 如果有教授该科目的教师，检查第一个教师的详细信息
      if (tutorsBySubject.length > 0) {
        console.log('教授该科目的教师示例:', {
          tutorId: tutorsBySubject[0].tutorId,
          teachingExperience: tutorsBySubject[0].teachingExperience,
        });
      }

      // 同时按城市和科目筛选，使用正则表达式匹配城市
      const tutors = await TutorProfile.find({
        'location.city': { $regex: cityRegex },
        'teachingExperience.subjects.name': subject,
      });
      console.log('符合所有条件的教师数量:', tutors.length);

      return tutors;
    } catch (error) {
      console.error('查询教师失败:', error);
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
      console.log('开始执行 getTutorsByPriceRange 方法:', {
        parentId,
        minPrice,
        maxPrice,
      });

      // 确保价格参数是数字
      const minPriceNum = Number(minPrice) || 0;
      const maxPriceNum = Number(maxPrice) || Number.MAX_SAFE_INTEGER;

      const profile = await Parent.findOne({ parentId });
      if (!profile) {
        console.error('未找到家长档案:', parentId);
        throw new Error('未找到家长档案');
      }

      console.log('家长档案:', {
        parentId: profile.parentId,
        city: profile.location?.city,
        location: profile.location,
      });

      // 获取家长城市，并处理可能的差异（如"北京市"和"北京"）
      let city = profile.location?.city || '';
      let cityPattern = city;

      // 如果城市名称以"市"结尾，创建一个不带"市"的版本
      if (city.endsWith('市')) {
        cityPattern = city.slice(0, -1);
      }

      console.log('查询价格区间条件:', {
        parentId,
        city,
        cityPattern,
        minPrice: minPriceNum,
        maxPrice: maxPriceNum,
        query: {
          'location.city': { $regex: new RegExp(`^${cityPattern}`, 'i') },
          'pricing.basePrice': { $gte: minPriceNum, $lte: maxPriceNum },
        },
      });

      // 先查询所有教师，检查数据结构
      const allTutors = await TutorProfile.find({});
      console.log('所有教师数量:', allTutors.length);

      // 检查第一个教师的数据结构
      if (allTutors.length > 0) {
        const sampleTutor = allTutors[0];
        console.log('教师数据示例:', {
          tutorId: sampleTutor.tutorId,
          city: sampleTutor.location?.city,
          pricing: sampleTutor.pricing,
          basePrice: sampleTutor.pricing?.basePrice,
        });

        // 检查所有教师的价格字段
        let tutorsWithPrice = 0;
        let tutorsWithValidPrice = 0;
        let priceRange = { min: Number.MAX_SAFE_INTEGER, max: 0 };

        for (const tutor of allTutors) {
          if (tutor.pricing && tutor.pricing.basePrice !== undefined) {
            tutorsWithPrice++;
            const price = Number(tutor.pricing.basePrice);
            if (!isNaN(price)) {
              tutorsWithValidPrice++;
              priceRange.min = Math.min(priceRange.min, price);
              priceRange.max = Math.max(priceRange.max, price);
            }
          }
        }

        console.log('价格字段统计:', {
          tutorsWithPrice,
          tutorsWithValidPrice,
          priceRange: tutorsWithPrice > 0 ? priceRange : null,
        });
      }

      // 使用正则表达式匹配城市（不区分"北京"和"北京市"）
      const cityRegex = new RegExp(`^${cityPattern}`, 'i');
      const tutorsByCity = await TutorProfile.find({
        'location.city': { $regex: cityRegex },
      });
      console.log('同城市教师数量:', tutorsByCity.length);

      // 只按价格筛选
      const tutorsByPrice = await TutorProfile.find({
        'pricing.basePrice': { $gte: minPriceNum, $lte: maxPriceNum },
      });
      console.log('价格区间内教师数量:', tutorsByPrice.length);

      // 同时按城市和价格筛选
      const tutors = await TutorProfile.find({
        'location.city': { $regex: cityRegex },
        'pricing.basePrice': { $gte: minPriceNum, $lte: maxPriceNum },
      });

      console.log(
        `找到${tutors.length}位价格在${minPriceNum}-${maxPriceNum}范围内的同城市教师`
      );
      return tutors;
    } catch (error) {
      console.error('查询价格区间教师失败:', error);
      throw new Error(
        `获取到和自己相同城市且价格区间相同的教师数据失败: ${error.message}`
      );
    }
  }

  // 按照教师的学历、对应的教师数据
  static async getTutorsByEducation(parentId, educationLevel) {
    try {
      console.log('开始执行 getTutorsByEducation 方法:', {
        parentId,
        educationLevel,
      });

      const profile = await Parent.findOne({ parentId });
      if (!profile) {
        console.error('未找到家长档案:', parentId);
        throw new Error('未找到家长档案');
      }

      console.log('家长档案:', {
        parentId: profile.parentId,
        city: profile.location?.city,
        location: profile.location,
      });

      // 获取家长城市，并处理可能的差异（如"北京市"和"北京"）
      let city = profile.location?.city || '';
      let cityPattern = city;

      // 如果城市名称以"市"结尾，创建一个不带"市"的版本
      if (city.endsWith('市')) {
        cityPattern = city.slice(0, -1);
      }

      console.log('查询学历条件:', {
        parentId,
        city,
        cityPattern,
        educationLevel,
        query: {
          'location.city': { $regex: new RegExp(`^${cityPattern}`, 'i') },
          'education.level': educationLevel,
        },
      });

      // 先查询所有教师，检查数据结构
      const allTutors = await TutorProfile.find({});
      console.log('所有教师数量:', allTutors.length);

      // 检查第一个教师的数据结构
      if (allTutors.length > 0) {
        const sampleTutor = allTutors[0];
        console.log('教师数据示例:', {
          tutorId: sampleTutor.tutorId,
          city: sampleTutor.location?.city,
          education: sampleTutor.education,
        });

        // 检查所有教师的学历字段
        let tutorsWithEducation = 0;
        let educationLevels = new Set();

        for (const tutor of allTutors) {
          if (tutor.education && tutor.education.level) {
            tutorsWithEducation++;
            educationLevels.add(tutor.education.level);
          }
        }

        console.log('学历字段统计:', {
          tutorsWithEducation,
          availableLevels: Array.from(educationLevels),
        });
      }

      // 使用正则表达式匹配城市（不区分"北京"和"北京市"）
      const cityRegex = new RegExp(`^${cityPattern}`, 'i');
      const tutorsByCity = await TutorProfile.find({
        'location.city': { $regex: cityRegex },
      });
      console.log('同城市教师数量:', tutorsByCity.length);

      // 只按学历筛选
      const tutorsByEducation = await TutorProfile.find({
        'education.level': educationLevel,
      });
      console.log('符合学历要求的教师数量:', tutorsByEducation.length);

      // 同时按城市和学历筛选
      const tutors = await TutorProfile.find({
        'location.city': { $regex: cityRegex },
        'education.level': educationLevel,
      });

      console.log(`找到${tutors.length}位学历为${educationLevel}的同城市教师`);
      return tutors;
    } catch (error) {
      console.error('查询学历教师失败:', error);
      throw new Error(
        `获取到和自己相同城市要求学历、教师数据失败: ${error.message}`
      );
    }
  }

  // 按照开课时间来获取到对应的教师数据
  static async getTutorsBySession(parentId, session) {
    try {
      console.log('开始执行 getTutorsBySession 方法:', { parentId, session });

      const profile = await Parent.findOne({ parentId });
      if (!profile) {
        console.error('未找到家长档案:', parentId);
        throw new Error('未找到家长档案');
      }

      console.log('家长档案:', {
        parentId: profile.parentId,
        city: profile.location?.city,
        location: profile.location,
      });

      // 获取家长城市，并处理可能的差异（如"北京市"和"北京"）
      let city = profile.location?.city || '';
      let cityPattern = city;

      // 如果城市名称以"市"结尾，创建一个不带"市"的版本
      if (city.endsWith('市')) {
        cityPattern = city.slice(0, -1);
      }

      console.log('查询开课时间条件:', {
        parentId,
        city,
        cityPattern,
        session,
        query: {
          'location.city': { $regex: new RegExp(`^${cityPattern}`, 'i') },
          'schedule.weekend.sessions': {
            $elemMatch: {
              day: session.day,
              period: session.period,
              available: true,
            },
          },
        },
      });

      // 先查询所有教师，检查数据结构
      const allTutors = await TutorProfile.find({});
      console.log('所有教师数量:', allTutors.length);

      // 检查第一个教师的数据结构
      if (allTutors.length > 0) {
        const sampleTutor = allTutors[0];
        console.log('教师数据示例:', {
          tutorId: sampleTutor.tutorId,
          city: sampleTutor.location?.city,
          schedule: sampleTutor.schedule,
        });

        // 检查所有教师的开课时间字段
        let tutorsWithSchedule = 0;
        let tutorsWithWeekendSessions = 0;
        let sessionDays = new Set();
        let sessionPeriods = new Set();
        let availableSessions = 0;

        for (const tutor of allTutors) {
          if (tutor.schedule) {
            tutorsWithSchedule++;
            if (tutor.schedule.weekend && tutor.schedule.weekend.sessions && tutor.schedule.weekend.sessions.length > 0) {
              tutorsWithWeekendSessions++;
              tutor.schedule.weekend.sessions.forEach((s) => {
                if (s.day) sessionDays.add(s.day);
                if (s.period) sessionPeriods.add(s.period);
                if (s.available === true) availableSessions++;
              });
            }
          }
        }

        console.log('开课时间字段统计:', {
          tutorsWithSchedule,
          tutorsWithWeekendSessions,
          availableDays: Array.from(sessionDays),
          availablePeriods: Array.from(sessionPeriods),
          availableSessions,
        });
      }

      // 使用正则表达式匹配城市（不区分"北京"和"北京市"）
      const cityRegex = new RegExp(`^${cityPattern}`, 'i');
      const tutorsByCity = await TutorProfile.find({
        'location.city': { $regex: cityRegex },
      });
      console.log('同城市教师数量:', tutorsByCity.length);

      // 只按开课时间筛选
      const tutorsBySession = await TutorProfile.find({
        'schedule.weekend.sessions': {
          $elemMatch: {
            day: session.day,
            period: session.period,
            available: true,
          },
        },
      });
      console.log('符合开课时间的教师数量:', tutorsBySession.length);

      // 同时按城市和开课时间筛选
      const tutors = await TutorProfile.find({
        'location.city': { $regex: cityRegex },
        'schedule.weekend.sessions': {
          $elemMatch: {
            day: session.day,
            period: session.period,
            available: true,
          },
        },
      });

      console.log(
        `找到${tutors.length}位在${session.day}${session.period}可授课的同城市教师`
      );
      return tutors;
    } catch (error) {
      console.error('查询开课时间教师失败:', error);
      throw new Error(
        `获取到和自己相同城市且开课时间相同的教师数据失败: ${error.message}`
      );
    }
  }

  // 多条件级联筛选方法
  static async getTutorsByMultipleConditions(parentId, conditions) {
    try {
      console.log('开始执行 getTutorsByMultipleConditions 方法:', { 
        parentId, 
        conditions 
      });
      
      const profile = await Parent.findOne({ parentId });
      if (!profile) {
        console.error('未找到家长档案:', parentId);
        throw new Error('未找到家长档案');
      }
      
      console.log('家长档案:', {
        parentId: profile.parentId,
        city: profile.location?.city,
        location: profile.location
      });
      
      // 获取家长城市，并处理可能的差异（如"北京市"和"北京"）
      let city = profile.location?.city || '';
      let cityPattern = city;
      
      // 如果城市名称以"市"结尾，创建一个不带"市"的版本
      if (city.endsWith('市')) {
        cityPattern = city.slice(0, -1);
      }
      
      // 使用正则表达式匹配城市（不区分"北京"和"北京市"）
      const cityRegex = new RegExp(`^${cityPattern}`, 'i');
      
      // 构建查询条件，基础条件是相同城市
      const query = { 'location.city': { $regex: cityRegex } };

      // 添加可选筛选条件
      if (conditions.subject) {
        query['teachingExperience.subjects.name'] = conditions.subject;
        console.log('添加科目筛选条件:', conditions.subject);
      }

      if (
        conditions.minPrice !== undefined &&
        conditions.maxPrice !== undefined
      ) {
        const minPriceNum = Number(conditions.minPrice) || 0;
        const maxPriceNum = Number(conditions.maxPrice) || Number.MAX_SAFE_INTEGER;
        
        query['pricing.basePrice'] = {
          $gte: minPriceNum,
          $lte: maxPriceNum,
        };
        console.log('添加价格区间筛选条件:', { minPrice: minPriceNum, maxPrice: maxPriceNum });
      }

      if (conditions.educationLevel) {
        query['education.level'] = conditions.educationLevel;
        console.log('添加学历筛选条件:', conditions.educationLevel);
      }

      if (conditions.minRating) {
        const minRatingNum = Number(conditions.minRating) || 0;
        query['ratings.average'] = { $gte: minRatingNum };
        console.log('添加最低评分筛选条件:', minRatingNum);
      }

      if (conditions.minExperience) {
        const minExperienceNum = Number(conditions.minExperience) || 0;
        query['teachingExperience.years'] = { $gte: minExperienceNum };
        console.log('添加最低教龄筛选条件:', minExperienceNum);
      }

      if (conditions.availabilityStatus) {
        query['availabilityStatus'] = conditions.availabilityStatus;
        console.log('添加可用状态筛选条件:', conditions.availabilityStatus);
      }

      if (conditions.session) {
        if (conditions.session.day && conditions.session.period) {
          // 使用 $elemMatch 操作符来正确匹配数组中的元素
          query['schedule.weekend.sessions'] = {
            $elemMatch: {
              day: conditions.session.day,
              period: conditions.session.period,
              available: true
            }
          };
          console.log('添加开课时间筛选条件:', conditions.session);
        } else if (conditions.session.day) {
          query['schedule.weekend.sessions'] = {
            $elemMatch: {
              day: conditions.session.day,
              available: true
            }
          };
          console.log('添加开课日期筛选条件:', conditions.session.day);
        } else if (conditions.session.period) {
          query['schedule.weekend.sessions'] = {
            $elemMatch: {
              period: conditions.session.period,
              available: true
            }
          };
          console.log('添加开课时段筛选条件:', conditions.session.period);
        }
      }

      console.log('最终查询条件:', JSON.stringify(query, null, 2));
      
      // 先查询所有教师，检查数据结构
      const allTutors = await TutorProfile.find({});
      console.log('所有教师数量:', allTutors.length);
      
      // 检查第一个教师的数据结构
      if (allTutors.length > 0) {
        const sampleTutor = allTutors[0];
        console.log('教师数据示例:', {
          tutorId: sampleTutor.tutorId,
          city: sampleTutor.location?.city,
          schedule: sampleTutor.schedule,
          pricing: sampleTutor.pricing,
          education: sampleTutor.education,
          teachingExperience: sampleTutor.teachingExperience
        });
      }
      
      // 执行查询
      const tutors = await TutorProfile.find(query);
      console.log(`多条件筛选结果: 找到${tutors.length}位符合条件的教师`);
      
      // 如果没有找到教师，输出更多调试信息
      if (tutors.length === 0) {
        // 分步骤执行查询，找出哪个条件导致结果为空
        const tutorsByCity = await TutorProfile.find({ 'location.city': { $regex: cityRegex } });
        console.log('同城市教师数量:', tutorsByCity.length);
        
        if (conditions.session) {
          const sessionQuery = {};
          if (conditions.session.day && conditions.session.period) {
            sessionQuery['schedule.weekend.sessions'] = {
              $elemMatch: {
                day: conditions.session.day,
                period: conditions.session.period,
                available: true
              }
            };
          }
          
          const tutorsBySession = await TutorProfile.find(sessionQuery);
          console.log('符合开课时间的教师数量:', tutorsBySession.length);
          
          // 检查第一个符合开课时间的教师
          if (tutorsBySession.length > 0) {
            console.log('符合开课时间的教师示例:', {
              tutorId: tutorsBySession[0].tutorId,
              city: tutorsBySession[0].location?.city,
              schedule: tutorsBySession[0].schedule
            });
          }
        }
      }
      
      return tutors;
    } catch (error) {
      console.error('多条件筛选教师失败:', error);
      throw new Error(`多条件筛选教师失败: ${error.message}`);
    }
  }

  // 按照科目和价格区间筛选教师
  static async getTutorsBySubjectAndPrice(
    parentId,
    subject,
    minPrice,
    maxPrice
  ) {
    try {
      const profile = await Parent.findOne({ parentId });
      if (!profile) {
        throw new Error('未找到家长档案');
      }
      const city = profile.location.city;
      const tutors = await TutorProfile.find({
        'location.city': city,
        'teachingExperience.subjects.name': subject,
        'pricing.basePrice': { $gte: minPrice, $lte: maxPrice },
      });
      return tutors;
    } catch (error) {
      throw new Error(`按科目和价格区间筛选教师失败: ${error.message}`);
    }
  }

  // 按照科目、学历和评分筛选教师
  static async getTutorsBySubjectEducationAndRating(
    parentId,
    subject,
    educationLevel,
    minRating
  ) {
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
        'ratings.average': { $gte: minRating },
      });
      return tutors;
    } catch (error) {
      throw new Error(`按科目、学历和评分筛选教师失败: ${error.message}`);
    }
  }

  // 按照开课时间、科目和教学经验筛选教师
  static async getTutorsBySessionSubjectAndExperience(
    parentId,
    session,
    subject,
    minExperience
  ) {
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
        'teachingExperience.years': { $gte: minExperience },
      });
      return tutors;
    } catch (error) {
      throw new Error(
        `按开课时间、科目和教学经验筛选教师失败: ${error.message}`
      );
    }
  }

  // 使用协同过滤算法获取推荐教师
  static async getRecommendedTutors(parentId, limit = 3) {
    try {
      console.log('开始执行 getRecommendedTutors 方法:', { parentId, limit });
      
      // 获取家长信息
      const parent = await Parent.findOne({ parentId }).populate('children');
      if (!parent) {
        console.error('未找到家长档案:', parentId);
        throw new Error('未找到家长档案');
      }
      
      console.log('家长档案:', {
        parentId: parent.parentId,
        city: parent.location?.city,
        children: parent.children?.length || 0,
        preferences: parent.preferences
      });
      
      // 获取家长城市，并处理可能的差异（如"北京市"和"北京"）
      let city = parent.location?.city || '';
      let cityPattern = city;
      
      // 如果城市名称以"市"结尾，创建一个不带"市"的版本
      if (city.endsWith('市')) {
        cityPattern = city.slice(0, -1);
      }
      
      // 使用正则表达式匹配城市（不区分"北京"和"北京市"）
      const cityRegex = new RegExp(`^${cityPattern}`, 'i');
      
      // 获取同城市的教师
      const tutors = await TutorProfile.find({ 'location.city': { $regex: cityRegex } });
      console.log(`找到${tutors.length}位同城市的教师`);
      
      if (tutors.length === 0) {
        return [];
      }
      
      // 获取家长偏好
      const preferredSubjects = [];
      const preferredGender = parent.preferences?.preferredGender;
      const priceRange = {
        min: parent.preferences?.priceRange?.min || 0,
        max: parent.preferences?.priceRange?.max || Number.MAX_SAFE_INTEGER
      };
      const preferredSessions = [];
      
      // 从孩子信息中获取科目偏好
      if (parent.children && parent.children.length > 0) {
        parent.children.forEach(child => {
          if (child.subjects && child.subjects.length > 0) {
            child.subjects.forEach(subject => {
              if (!preferredSubjects.includes(subject)) {
                preferredSubjects.push(subject);
              }
            });
          }
        });
      }
      
      // 从家长偏好中获取时间偏好
      if (parent.preferences?.availableTimes && parent.preferences.availableTimes.length > 0) {
        parent.preferences.availableTimes.forEach(time => {
          if (time.day && time.period) {
            preferredSessions.push({
              day: time.day,
              period: time.period
            });
          }
        });
      }
      
      console.log('家长偏好:', {
        preferredSubjects,
        preferredGender,
        priceRange,
        preferredSessions
      });
      
      // 计算每个教师的匹配分数
      const scoredTutors = tutors.map(tutor => {
        let score = 0;
        
        // 基础分：同城市
        score += 0.3;
        
        // 价格匹配 (+0.1)
        if (tutor.pricing && tutor.pricing.basePrice) {
          const price = tutor.pricing.basePrice;
          if (price >= priceRange.min && price <= priceRange.max) {
            score += 0.1;
            console.log(`教师 ${tutor.tutorId} 价格匹配 +0.1`);
          }
        }
        
        // 科目匹配 (+0.3)
        let subjectMatched = false;
        if (preferredSubjects.length > 0 && tutor.teachingExperience && tutor.teachingExperience.subjects) {
          for (const subject of tutor.teachingExperience.subjects) {
            if (preferredSubjects.includes(subject.name)) {
              score += 0.3;
              subjectMatched = true;
              console.log(`教师 ${tutor.tutorId} 科目匹配 +0.3`);
              break;
            }
          }
        }
        
        // 性别匹配 (+0.2)
        if (preferredGender && tutor.gender === preferredGender) {
          score += 0.2;
          console.log(`教师 ${tutor.tutorId} 性别匹配 +0.2`);
        }
        
        // 时间匹配 (+0.1)
        if (preferredSessions.length > 0 && tutor.schedule && tutor.schedule.weekend && tutor.schedule.weekend.sessions) {
          for (const preferredSession of preferredSessions) {
            for (const session of tutor.schedule.weekend.sessions) {
              if (session.day === preferredSession.day && 
                  session.period === preferredSession.period && 
                  session.available === true) {
                score += 0.1;
                console.log(`教师 ${tutor.tutorId} 时间匹配 +0.1`);
                break;
              }
            }
          }
        }
        
        return {
          tutor,
          score,
          matchDetails: {
            priceMatch: tutor.pricing && tutor.pricing.basePrice >= priceRange.min && tutor.pricing.basePrice <= priceRange.max,
            subjectMatch: subjectMatched,
            genderMatch: preferredGender && tutor.gender === preferredGender,
            sessionMatch: preferredSessions.length > 0 && tutor.schedule && tutor.schedule.weekend && tutor.schedule.weekend.sessions
          }
        };
      });
      
      // 按分数排序并取前N位
      scoredTutors.sort((a, b) => b.score - a.score);
      const recommendedTutors = scoredTutors.slice(0, limit);
      
      console.log(`推荐结果: 找到${recommendedTutors.length}位最适合的教师`);
      recommendedTutors.forEach((item, index) => {
        console.log(`第${index + 1}名: 教师ID ${item.tutor.tutorId}, 分数 ${item.score}, 匹配详情:`, item.matchDetails);
      });
      
      return recommendedTutors.map(item => ({
        ...item.tutor.toObject(),
        matchScore: item.score,
        matchDetails: item.matchDetails
      }));
    } catch (error) {
      console.error('获取推荐教师失败:', error);
      throw new Error(`获取推荐教师失败: ${error.message}`);
    }
  }
}

module.exports = ParentProfileService;
