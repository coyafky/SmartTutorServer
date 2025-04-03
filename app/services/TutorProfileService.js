const TutorProfile = require('../../models/TutorProfile');
const User = require('../../models/User');
const { AppError } = require('../utils/errorHandler');
const { log } = require('../utils/logger');
const mongoose = require('mongoose');
const TutoringRequest = require('../../models/TutoringRequest'); // 导入 TutoringRequest 模型
const _ = require('lodash'); // 添加这行在文件顶部

class TutorProfileService {
  /**
   * 创建教师资料卡
   * @param {String} userId - 用户ID
   * @param {Object} profileData - 资料卡数据
   * @returns {Promise<Object>} - 创建的资料卡
   */
  static async createProfile(userId, profileData) {
    log.info(`尝试为用户 ${userId} 创建教师资料卡`);

    // 查找用户
    const user = await User.findOne({ customId: userId });
    if (!user) {
      log.warn(`创建资料卡失败: 用户 ${userId} 不存在`);
      throw new AppError('用户不存在', 404);
    }

    // 检查用户角色
    if (user.role !== 'teacher') {
      log.warn(`创建资料卡失败: 用户 ${userId} 不是教师角色`);
      throw new AppError('只有教师角色可以创建教师资料卡', 403);
    }

    // 检查是否已存在资料卡（基于用户ID而非tutorId）
    const existingUserProfile = await TutorProfile.findOne({
      userId: user._id,
    });
    if (existingUserProfile) {
      log.warn(`创建资料卡失败: 用户 ${userId} 已有教师资料卡`);
      throw new AppError('该用户已有教师资料卡', 409);
    }

    try {
      // 使用用户的 customId 作为 tutorId，保持一致性
      const tutorId = user.customId;
      log.info(`使用用户的 customId 作为 tutorId: ${tutorId}`);
      
      // 检查 tutorId 是否已存在于其他教师资料中
      const existingTutorProfile = await TutorProfile.findOne({ tutorId });
      if (existingTutorProfile) {
        log.warn(`创建资料卡失败: tutorId ${tutorId} 已存在于其他教师资料中`);
        throw new AppError('教师ID已存在，请联系管理员', 409);
      }

      // 创建资料卡，使用用户的 customId 作为 tutorId
      const profileToCreate = {
        ...profileData,
        tutorId: tutorId,
        userId: user._id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      // 删除可能存在的其他 tutorId
      delete profileData.tutorId;
      
      log.info(`准备创建教师资料卡，使用 tutorId: ${tutorId}`);
      const profile = await TutorProfile.create(profileToCreate);

      log.info(`教师资料卡创建成功: ${tutorId}`);
      return profile;
    } catch (error) {
      log.error(`创建教师资料卡时发生错误: ${error.message}`, error);

      // 处理验证错误
      if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map((err) => err.message);
        log.error(`验证错误详情: ${JSON.stringify(error.errors)}`);
        throw new AppError(`验证错误: ${messages.join(', ')}`, 400);
      }

      // 处理重复键错误
      if (error.code === 11000) {
        log.error(`重复键错误: ${JSON.stringify(error.keyValue)}`);
        throw new AppError('创建教师资料卡失败，ID已存在', 409);
      }

      throw error;
    }
  }

  /**
   * 获取教师资料卡
   * @param {String} tutorId - 教师ID
   * @returns {Promise<Object>} - 教师资料卡
   */
  static async getProfile(tutorId) {
    log.info(`获取教师资料卡: ${tutorId}`);

    const profile = await TutorProfile.findOne({ tutorId });
    if (!profile) {
      log.warn(`获取资料卡失败: 教师 ${tutorId} 资料卡不存在`);
      throw new AppError('教师资料卡不存在', 404);
    }

    return profile;
  }

  /**
   * 更新教师资料卡
   * @param {String} tutorId - 教师ID
   * @param {Object} updateData - 更新数据
   * @returns {Promise<Object>} - 更新后的资料卡
   */
  static async updateProfile(tutorId, updateData) {
    log.info(`尝试更新教师资料卡: ${tutorId}`);

    // 不允许更新敏感字段
    delete updateData.tutorId;
    delete updateData.userId;
    delete updateData.createdAt;
    delete updateData.ratings;
    delete updateData.statistics;

    try {
      const profile = await TutorProfile.findOneAndUpdate(
        { tutorId },
        {
          ...updateData,
          updatedAt: new Date(),
        },
        {
          new: true,
          runValidators: true,
        }
      );

      if (!profile) {
        log.warn(`更新资料卡失败: 教师 ${tutorId} 资料卡不存在`);
        throw new AppError('教师资料卡不存在', 404);
      }

      log.info(`教师资料卡更新成功: ${tutorId}`);
      return profile;
    } catch (error) {
      log.error(`更新教师资料卡时发生错误: ${error.message}`, error);

      // 处理验证错误
      if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map((err) => err.message);
        throw new AppError(`验证错误: ${messages.join(', ')}`, 400);
      }

      throw error;
    }
  }

  /**
   * 删除教师资料卡
   * @param {String} tutorId - 教师ID
   * @returns {Promise<Boolean>} - 删除结果
   */
  static async deleteProfile(tutorId) {
    log.info(`尝试删除教师资料卡: ${tutorId}`);

    const result = await TutorProfile.deleteOne({ tutorId });

    if (result.deletedCount === 0) {
      log.warn(`删除资料卡失败: 教师 ${tutorId} 资料卡不存在`);
      throw new AppError('教师资料卡不存在', 404);
    }

    log.info(`教师资料卡删除成功: ${tutorId}`);
    return true;
  }

  /**
   * 更新教师可用状态
   * @param {String} tutorId - 教师ID
   * @param {String} status - 新状态
   * @returns {Promise<Object>} - 更新后的资料卡
   */
  static async updateAvailabilityStatus(tutorId, status) {
    log.info(`更新教师可用状态: ${tutorId} -> ${status}`);

    if (!['available', 'busy', 'offline'].includes(status)) {
      log.warn(`更新状态失败: 无效的状态值 ${status}`);
      throw new AppError('无效的状态值', 400);
    }

    const profile = await TutorProfile.findOneAndUpdate(
      { tutorId },
      {
        availabilityStatus: status,
        updatedAt: new Date(),
      },
      { new: true }
    );

    if (!profile) {
      log.warn(`更新状态失败: 教师 ${tutorId} 资料卡不存在`);
      throw new AppError('教师资料卡不存在', 404);
    }

    log.info(`教师可用状态更新成功: ${tutorId} -> ${status}`);
    return profile;
  }

  /**
   * 添加教授科目
   * @param {String} tutorId - 教师ID
   * @param {Object} subject - 科目信息
   * @returns {Promise<Object>} - 更新后的资料卡
   */
  static async addSubject(tutorId, subject) {
    log.info(`为教师 ${tutorId} 添加科目: ${subject.name}`);

    const profile = await TutorProfile.findOne({ tutorId });
    if (!profile) {
      log.warn(`添加科目失败: 教师 ${tutorId} 资料卡不存在`);
      throw new AppError('教师资料卡不存在', 404);
    }

    // 检查科目是否已存在
    const existingSubject = profile.teachingExperience.subjects.find(
      (s) => s.name === subject.name
    );

    if (existingSubject) {
      log.warn(`添加科目失败: 科目 ${subject.name} 已存在`);
      throw new AppError(`科目 ${subject.name} 已存在`, 409);
    }

    // 添加新科目
    profile.teachingExperience.subjects.push(subject);
    profile.updatedAt = new Date();

    await profile.save();
    log.info(`科目添加成功: ${tutorId} - ${subject.name}`);

    return profile;
  }

  /**
   * 更新教授科目
   * @param {String} tutorId - 教师ID
   * @param {String} subjectId - 科目ID
   * @param {Object} updateData - 更新数据
   * @returns {Promise<Object>} - 更新后的资料卡
   */
  static async updateSubject(tutorId, subjectId, updateData) {
    log.info(`更新教师 ${tutorId} 的科目 ${subjectId}`);

    const profile = await TutorProfile.findOne({ tutorId });
    if (!profile) {
      log.warn(`更新科目失败: 教师 ${tutorId} 资料卡不存在`);
      throw new AppError('教师资料卡不存在', 404);
    }

    // 查找科目
    const subjectIndex = profile.teachingExperience.subjects.findIndex(
      (s) => s._id.toString() === subjectId
    );

    if (subjectIndex === -1) {
      log.warn(`更新科目失败: 科目 ${subjectId} 不存在`);
      throw new AppError('科目不存在', 404);
    }

    // 如果更新科目名称，检查是否与其他科目重名
    if (
      updateData.name &&
      updateData.name !== profile.teachingExperience.subjects[subjectIndex].name
    ) {
      const duplicateName = profile.teachingExperience.subjects.find(
        (s, idx) => idx !== subjectIndex && s.name === updateData.name
      );

      if (duplicateName) {
        log.warn(`更新科目失败: 科目名称 ${updateData.name} 已存在`);
        throw new AppError(`科目名称 ${updateData.name} 已存在`, 409);
      }
    }

    // 更新科目
    Object.assign(
      profile.teachingExperience.subjects[subjectIndex],
      updateData
    );
    profile.updatedAt = new Date();

    await profile.save();
    log.info(`科目更新成功: ${tutorId} - ${subjectId}`);

    return profile;
  }

  /**
   * 删除教授科目
   * @param {String} tutorId - 教师ID
   * @param {String} subjectId - 科目ID
   * @returns {Promise<Object>} - 更新后的资料卡
   */
  static async deleteSubject(tutorId, subjectId) {
    log.info(`删除教师 ${tutorId} 的科目 ${subjectId}`);

    const profile = await TutorProfile.findOne({ tutorId });
    if (!profile) {
      log.warn(`删除科目失败: 教师 ${tutorId} 资料卡不存在`);
      throw new AppError('教师资料卡不存在', 404);
    }

    // 查找科目
    const subjectIndex = profile.teachingExperience.subjects.findIndex(
      (s) => s._id.toString() === subjectId
    );

    if (subjectIndex === -1) {
      log.warn(`删除科目失败: 科目 ${subjectId} 不存在`);
      throw new AppError('科目不存在', 404);
    }

    // 删除科目
    profile.teachingExperience.subjects.splice(subjectIndex, 1);
    profile.updatedAt = new Date();

    await profile.save();
    log.info(`科目删除成功: ${tutorId} - ${subjectId}`);

    return profile;
  }

  /**
   * 添加成功案例
   * @param {String} tutorId - 教师ID
   * @param {String} subjectId - 科目ID
   * @param {Object} caseData - 案例数据
   * @returns {Promise<Object>} - 更新后的资料卡
   */
  static async addSuccessCase(tutorId, subjectId, caseData) {
    log.info(`为教师 ${tutorId} 的科目 ${subjectId} 添加成功案例`);

    const profile = await TutorProfile.findOne({ tutorId });
    if (!profile) {
      log.warn(`添加成功案例失败: 教师 ${tutorId} 资料卡不存在`);
      throw new AppError('教师资料卡不存在', 404);
    }

    // 查找科目
    const subject = profile.teachingExperience.subjects.id(subjectId);
    if (!subject) {
      log.warn(`添加成功案例失败: 科目 ${subjectId} 不存在`);
      throw new AppError('科目不存在', 404);
    }

    // 添加成功案例
    subject.successCases.push(caseData);
    profile.updatedAt = new Date();

    await profile.save();
    log.info(`成功案例添加成功: ${tutorId} - ${subjectId}`);

    return profile;
  }

  /**
   * 更新成功案例
   * @param {String} tutorId - 教师ID
   * @param {String} subjectId - 科目ID
   * @param {String} caseId - 案例ID
   * @param {Object} updateData - 更新数据
   * @returns {Promise<Object>} - 更新后的资料卡
   */
  static async updateSuccessCase(tutorId, subjectId, caseId, updateData) {
    log.info(`更新教师 ${tutorId} 的科目 ${subjectId} 的成功案例 ${caseId}`);

    const profile = await TutorProfile.findOne({ tutorId });
    if (!profile) {
      log.warn(`更新成功案例失败: 教师 ${tutorId} 资料卡不存在`);
      throw new AppError('教师资料卡不存在', 404);
    }

    // 查找科目
    const subject = profile.teachingExperience.subjects.id(subjectId);
    if (!subject) {
      log.warn(`更新成功案例失败: 科目 ${subjectId} 不存在`);
      throw new AppError('科目不存在', 404);
    }

    // 查找成功案例
    const successCase = subject.successCases.id(caseId);
    if (!successCase) {
      log.warn(`更新成功案例失败: 案例 ${caseId} 不存在`);
      throw new AppError('成功案例不存在', 404);
    }

    // 更新成功案例
    Object.assign(successCase, updateData);
    profile.updatedAt = new Date();

    await profile.save();
    log.info(`成功案例更新成功: ${tutorId} - ${subjectId} - ${caseId}`);

    return profile;
  }

  /**
   * 删除成功案例
   * @param {String} tutorId - 教师ID
   * @param {String} subjectId - 科目ID
   * @param {String} caseId - 案例ID
   * @returns {Promise<Object>} - 更新后的资料卡
   */
  static async deleteSuccessCase(tutorId, subjectId, caseId) {
    log.info(`删除教师 ${tutorId} 的科目 ${subjectId} 的成功案例 ${caseId}`);

    const profile = await TutorProfile.findOne({ tutorId });
    if (!profile) {
      log.warn(`删除成功案例失败: 教师 ${tutorId} 资料卡不存在`);
      throw new AppError('教师资料卡不存在', 404);
    }

    // 查找科目
    const subject = profile.teachingExperience.subjects.id(subjectId);
    if (!subject) {
      log.warn(`删除成功案例失败: 科目 ${subjectId} 不存在`);
      throw new AppError('科目不存在', 404);
    }

    // 查找成功案例
    const caseIndex = subject.successCases.findIndex(
      (c) => c._id.toString() === caseId
    );

    if (caseIndex === -1) {
      log.warn(`删除成功案例失败: 案例 ${caseId} 不存在`);
      throw new AppError('成功案例不存在', 404);
    }

    // 删除成功案例
    subject.successCases.splice(caseIndex, 1);
    profile.updatedAt = new Date();

    await profile.save();
    log.info(`成功案例删除成功: ${tutorId} - ${subjectId} - ${caseId}`);

    return profile;
  }

  /**
   * 添加课程时间段
   * @param {String} tutorId - 教师ID
   * @param {Object} sessionData - 时间段数据
   * @returns {Promise<Object>} - 更新后的资料卡
   */
  static async addTimeSession(tutorId, sessionData) {
    log.info(
      `为教师 ${tutorId} 添加课程时间段: ${sessionData.day} ${sessionData.period}`
    );

    const profile = await TutorProfile.findOne({ tutorId });
    if (!profile) {
      log.warn(`添加课程时间段失败: 教师 ${tutorId} 资料卡不存在`);
      throw new AppError('教师资料卡不存在', 404);
    }

    // 检查时间段是否已存在
    const existingSession = profile.schedule.weekend.sessions.find(
      (s) => s.day === sessionData.day && s.period === sessionData.period
    );

    if (existingSession) {
      log.warn(
        `添加课程时间段失败: ${sessionData.day} ${sessionData.period} 时间段已存在`
      );
      throw new AppError(
        `${sessionData.day} ${sessionData.period} 时间段已存在`,
        409
      );
    }

    // 如果没有提供时间，使用默认时间
    if (!sessionData.timeSlot) {
      const defaultTimes =
        profile.schedule.weekend.defaultTimes[sessionData.period];
      sessionData.timeSlot = {
        startTime: defaultTimes.startTime,
        endTime: defaultTimes.endTime,
      };
    }

    // 添加新时间段
    profile.schedule.weekend.sessions.push(sessionData);
    profile.updatedAt = new Date();

    await profile.save();
    log.info(
      `课程时间段添加成功: ${tutorId} - ${sessionData.day} ${sessionData.period}`
    );

    return profile;
  }

  /**
   * 更新课程时间段
   * @param {String} tutorId - 教师ID
   * @param {String} sessionId - 时间段ID
   * @param {Object} updateData - 更新数据
   * @returns {Promise<Object>} - 更新后的资料卡
   */
  static async updateTimeSession(tutorId, sessionId, updateData) {
    log.info(`更新教师 ${tutorId} 的课程时间段 ${sessionId}`);

    const profile = await TutorProfile.findOne({ tutorId });
    if (!profile) {
      log.warn(`更新课程时间段失败: 教师 ${tutorId} 资料卡不存在`);
      throw new AppError('教师资料卡不存在', 404);
    }

    // 查找时间段
    const sessionIndex = profile.schedule.weekend.sessions.findIndex(
      (s) => s._id.toString() === sessionId
    );

    if (sessionIndex === -1) {
      log.warn(`更新课程时间段失败: 时间段 ${sessionId} 不存在`);
      throw new AppError('课程时间段不存在', 404);
    }

    // 如果更新日期和时段，检查是否与其他时间段冲突
    if (
      (updateData.day || updateData.period) &&
      (updateData.day !== profile.schedule.weekend.sessions[sessionIndex].day ||
        updateData.period !==
          profile.schedule.weekend.sessions[sessionIndex].period)
    ) {
      const day =
        updateData.day || profile.schedule.weekend.sessions[sessionIndex].day;
      const period =
        updateData.period ||
        profile.schedule.weekend.sessions[sessionIndex].period;

      const duplicateSession = profile.schedule.weekend.sessions.find(
        (s, idx) => idx !== sessionIndex && s.day === day && s.period === period
      );

      if (duplicateSession) {
        log.warn(`更新课程时间段失败: ${day} ${period} 时间段已存在`);
        throw new AppError(`${day} ${period} 时间段已存在`, 409);
      }
    }

    // 更新时间段
    Object.assign(profile.schedule.weekend.sessions[sessionIndex], updateData);
    profile.updatedAt = new Date();

    await profile.save();
    log.info(`课程时间段更新成功: ${tutorId} - ${sessionId}`);

    return profile;
  }

  /**
   * 删除课程时间段
   * @param {String} tutorId - 教师ID
   * @param {String} sessionId - 时间段ID
   * @returns {Promise<Object>} - 更新后的资料卡
   */
  static async deleteTimeSession(tutorId, sessionId) {
    log.info(`删除教师 ${tutorId} 的课程时间段 ${sessionId}`);

    const profile = await TutorProfile.findOne({ tutorId });
    if (!profile) {
      log.warn(`删除课程时间段失败: 教师 ${tutorId} 资料卡不存在`);
      throw new AppError('教师资料卡不存在', 404);
    }

    // 查找时间段
    const sessionIndex = profile.schedule.weekend.sessions.findIndex(
      (s) => s._id.toString() === sessionId
    );

    if (sessionIndex === -1) {
      log.warn(`删除课程时间段失败: 时间段 ${sessionId} 不存在`);
      throw new AppError('课程时间段不存在', 404);
    }

    // 检查时间段状态，如果已预约则不能删除
    if (profile.schedule.weekend.sessions[sessionIndex].status === 'booked') {
      log.warn(`删除课程时间段失败: 时间段 ${sessionId} 已被预约，无法删除`);
      throw new AppError('已预约的时间段无法删除', 400);
    }

    // 删除时间段
    profile.schedule.weekend.sessions.splice(sessionIndex, 1);
    profile.updatedAt = new Date();

    await profile.save();
    log.info(`课程时间段删除成功: ${tutorId} - ${sessionId}`);

    return profile;
  }

  /**
   * 更新默认时间设置
   * @param {String} tutorId - 教师ID
   * @param {Object} defaultTimes - 默认时间设置
   * @returns {Promise<Object>} - 更新后的资料卡
   */
  static async updateDefaultTimes(tutorId, defaultTimes) {
    log.info(`更新教师 ${tutorId} 的默认时间设置`);

    const profile = await TutorProfile.findOne({ tutorId });
    if (!profile) {
      log.warn(`更新默认时间设置失败: 教师 ${tutorId} 资料卡不存在`);
      throw new AppError('教师资料卡不存在', 404);
    }

    // 验证时间格式
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    for (const period in defaultTimes) {
      if (
        defaultTimes[period].startTime &&
        !timeRegex.test(defaultTimes[period].startTime)
      ) {
        throw new AppError(`${period}开始时间格式无效，应为 HH:MM`, 400);
      }
      if (
        defaultTimes[period].endTime &&
        !timeRegex.test(defaultTimes[period].endTime)
      ) {
        throw new AppError(`${period}结束时间格式无效，应为 HH:MM`, 400);
      }
    }

    // 更新默认时间设置
    Object.assign(profile.schedule.weekend.defaultTimes, defaultTimes);
    profile.updatedAt = new Date();

    await profile.save();
    log.info(`默认时间设置更新成功: ${tutorId}`);

    return profile;
  }

  /**
   * 更新教师位置信息
   * @param {String} tutorId - 教师ID
   * @param {Object} locationData - 位置信息
   * @returns {Promise<Object>} - 更新后的资料卡
   */
  static async updateLocation(tutorId, locationData) {
    log.info(`更新教师 ${tutorId} 的位置信息`);

    // 验证并格式化地理位置数据
    const locationUpdate = {
      address: locationData.address,
      district: locationData.district,
      city: locationData.city,
      geo: {
        type: 'Point',
        coordinates: locationData.geo?.coordinates || [0, 0],
      },
    };

    // 验证经纬度范围
    const [longitude, latitude] = locationUpdate.geo.coordinates;
    if (
      longitude < -180 ||
      longitude > 180 ||
      latitude < -90 ||
      latitude > 90
    ) {
      throw new AppError('无效的经纬度坐标范围', 400);
    }

    try {
      const profile = await TutorProfile.findOneAndUpdate(
        { tutorId },
        {
          location: locationUpdate,
          updatedAt: new Date(),
        },
        {
          new: true,
          runValidators: true,
        }
      );

      if (!profile) {
        log.warn(`更新位置信息失败: 教师 ${tutorId} 资料卡不存在`);
        throw new AppError('教师资料卡不存在', 404);
      }

      log.info(`位置信息更新成功: ${tutorId}`);
      return profile;
    } catch (error) {
      log.error(`更新位置信息失败: ${error.message}`);
      if (error.name === 'ValidationError') {
        throw new AppError(`位置信息验证失败: ${error.message}`, 400);
      }
      throw error;
    }
  }

  static async updatePricing(tutorId, pricingData) {
    log.info(`更新教师 ${tutorId} 的价格设置`);

    // 验证价格
    if (
      pricingData.basePrice &&
      (isNaN(pricingData.basePrice) || pricingData.basePrice < 0)
    ) {
      throw new AppError('基础价格必须是非负数', 400);
    }

    const profile = await TutorProfile.findOneAndUpdate(
      { tutorId },
      {
        pricing: pricingData,
        updatedAt: new Date(),
      },
      { new: true }
    );

    if (!profile) {
      log.warn(`更新价格设置失败: 教师 ${tutorId} 资料卡不存在`);
      throw new AppError('教师资料卡不存在', 404);
    }

    log.info(`价格设置更新成功: ${tutorId}`);
    return profile;
  }

  /**
   * 更新教师教学风格
   * @param {String} tutorId - 教师ID
   * @param {Object} styleData - 教学风格数据
   * @returns {Promise<Object>} - 更新后的资料卡
   */
  static async updateTeachingStyle(tutorId, styleData) {
    log.info(`更新教师 ${tutorId} 的教学风格`);

    const profile = await TutorProfile.findOneAndUpdate(
      { tutorId },
      {
        teachingStyle: styleData,
        updatedAt: new Date(),
      },
      { new: true }
    );

    if (!profile) {
      log.warn(`更新教学风格失败: 教师 ${tutorId} 资料卡不存在`);
      throw new AppError('教师资料卡不存在', 404);
    }

    log.info(`教学风格更新成功: ${tutorId}`);
    return profile;
  }

  /**
   * 更新教师评分
   * @param {String} tutorId - 教师ID
   * @param {Object} ratingsData - 评分数据
   * @returns {Promise<Object>} - 更新后的资料卡
   */
  static async updateRatings(tutorId, ratingsData) {
    log.info(`更新教师 ${tutorId} 的评分`);

    // 验证评分
    for (const key in ratingsData) {
      if (
        isNaN(ratingsData[key]) ||
        ratingsData[key] < 0 ||
        ratingsData[key] > 5
      ) {
        throw new AppError(`${key}评分必须在0-5之间`, 400);
      }
    }

    const profile = await TutorProfile.findOneAndUpdate(
      { tutorId },
      {
        ratings: ratingsData,
        updatedAt: new Date(),
      },
      { new: true }
    );

    if (!profile) {
      log.warn(`更新评分失败: 教师 ${tutorId} 资料卡不存在`);
      throw new AppError('教师资料卡不存在', 404);
    }

    log.info(`评分更新成功: ${tutorId}`);
    return profile;
  }

  /**
   * 更新教师统计数据
   * @param {String} tutorId - 教师ID
   * @param {Object} statisticsData - 统计数据
   * @returns {Promise<Object>} - 更新后的资料卡
   */
  static async updateStatistics(tutorId, statisticsData) {
    log.info(`更新教师 ${tutorId} 的统计数据`);

    // 验证统计数据
    for (const key in statisticsData) {
      if (key === 'completionRate' || key === 'repeatRate') {
        if (
          isNaN(statisticsData[key]) ||
          statisticsData[key] < 0 ||
          statisticsData[key] > 100
        ) {
          throw new AppError(`${key}必须在0-100之间`, 400);
        }
      } else if (isNaN(statisticsData[key]) || statisticsData[key] < 0) {
        throw new AppError(`${key}必须是非负数`, 400);
      }
    }

    const profile = await TutorProfile.findOneAndUpdate(
      { tutorId },
      {
        statistics: statisticsData,
        updatedAt: new Date(),
      },
      { new: true }
    );

    if (!profile) {
      log.warn(`更新统计数据失败: 教师 ${tutorId} 资料卡不存在`);
      throw new AppError('教师资料卡不存在', 404);
    }

    log.info(`统计数据更新成功: ${tutorId}`);
    return profile;
  }

  /**
   * 增加学生数量
   * @param {String} tutorId - 教师ID
   * @param {Number} count - 增加数量，默认为1
   * @returns {Promise<Object>} - 更新后的资料卡
   */
  static async incrementStudentCount(tutorId, count = 1) {
    log.info(`增加教师 ${tutorId} 的学生数量: +${count}`);

    const profile = await TutorProfile.findOneAndUpdate(
      { tutorId },
      {
        $inc: { 'statistics.totalStudents': count },
        updatedAt: new Date(),
      },
      { new: true }
    );

    if (!profile) {
      log.warn(`增加学生数量失败: 教师 ${tutorId} 资料卡不存在`);
      throw new AppError('教师资料卡不存在', 404);
    }

    log.info(
      `学生数量更新成功: ${tutorId} -> ${profile.statistics.totalStudents}`
    );
    return profile;
  }

  /**
   * 增加课时数量
   * @param {String} tutorId - 教师ID
   * @param {Number} count - 增加数量，默认为1
   * @returns {Promise<Object>} - 更新后的资料卡
   */
  static async incrementClassCount(tutorId, count = 1) {
    log.info(`增加教师 ${tutorId} 的课时数量: +${count}`);

    const profile = await TutorProfile.findOneAndUpdate(
      { tutorId },
      {
        $inc: { 'statistics.totalClasses': count },
        updatedAt: new Date(),
      },
      { new: true }
    );

    if (!profile) {
      log.warn(`增加课时数量失败: 教师 ${tutorId} 资料卡不存在`);
      throw new AppError('教师资料卡不存在', 404);
    }

    log.info(
      `课时数量更新成功: ${tutorId} -> ${profile.statistics.totalClasses}`
    );
    return profile;
  }

  /**
   * 查询教师列表
   * @param {Object} filters - 过滤条件
   * @param {Object} options - 排序选项
   * @returns {Promise<Object>} - 教师列表和分页信息
   */
  static async queryTutors(filters = {}, options = {}) {
    log.info(`查询教师列表: ${JSON.stringify(filters)}`);

    const {
      sortBy = 'ratings.overall',
      sortOrder = -1,
      fields,
    } = options;

    // 构建查询条件
    const query = {};

    // 处理科目过滤
    if (filters.subject) {
      query['teachingExperience.subjects.name'] = filters.subject;
    }

    // 处理年级过滤
    if (filters.grade) {
      query['teachingExperience.subjects.grades'] = filters.grade;
    }

    // 处理教龄过滤
    if (filters.minExperience) {
      query['teachingExperience.years'] = {
        $gte: parseInt(filters.minExperience),
      };
    }

    // 处理评分过滤
    if (filters.minRating) {
      query['ratings.overall'] = { $gte: parseFloat(filters.minRating) };
    }

    // 处理价格过滤
    if (filters.maxPrice) {
      query['pricing.basePrice'] = { $lte: parseInt(filters.maxPrice) };
    }

    // 处理可用状态过滤
    if (filters.availabilityStatus) {
      query.availabilityStatus = filters.availabilityStatus;
    }

    // 处理地区过滤
    if (filters.city) {
      query['location.city'] = filters.city;
    }
    if (filters.district) {
      query['location.district'] = filters.district;
    }

    // 处理地理位置过滤
    if (
      filters.nearLocation &&
      filters.nearLocation.latitude &&
      filters.nearLocation.longitude
    ) {
      const { latitude, longitude, maxDistance = 10000 } = filters.nearLocation; // 默认10公里

      query['location.coordinates'] = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)],
          },
          $maxDistance: parseInt(maxDistance),
        },
      };
    }

    // 处理关键词搜索
    if (filters.keyword) {
      const keyword = filters.keyword;
      query.$or = [
        { firstName: { $regex: keyword, $options: 'i' } },
        { lastName: { $regex: keyword, $options: 'i' } },
        { 'education.school': { $regex: keyword, $options: 'i' } },
        { 'education.major': { $regex: keyword, $options: 'i' } },
        {
          'teachingExperience.subjects.name': {
            $regex: keyword,
            $options: 'i',
          },
        },
        { 'teachingStyle.description': { $regex: keyword, $options: 'i' } },
        { 'teachingStyle.keywords': { $regex: keyword, $options: 'i' } },
        { 'teachingStyle.strengths': { $regex: keyword, $options: 'i' } },
      ];
    }

    // 构建排序
    const sort = {};
    sort[sortBy] = sortOrder;

    // 构建字段选择
    const projection = fields
      ? fields.split(',').reduce((obj, field) => {
          obj[field.trim()] = 1;
          return obj;
        }, {})
      : {};

    try {
      // 执行查询 - 移除分页限制，返回所有结果
      const tutors = await TutorProfile.find(query)
        .select(projection)
        .sort(sort)
        .lean();

      // 获取总数
      const total = tutors.length;

      log.info(`查询教师列表成功: 找到 ${total} 条记录`);

      return {
        tutors,
        pagination: {
          total,
          page: 1,
          limit: total,
          pages: 1,
        },
      };
    } catch (error) {
      log.error(`查询教师列表时发生错误: ${error.message}`, error);
      throw error;
    }
  }

  /**
   * 根据科目查询教师
   * @param {String} subject - 科目名称
   * @param {Object} options - 分页和排序选项
   * @returns {Promise<Object>} - 教师列表和分页信息
   */
  static async findTutorsBySubject(subject, options = {}) {
    log.info(`根据科目查询教师: ${subject}`);
    return this.queryTutors({ subject }, options);
  }

  /**
   * 根据地区查询教师
   * @param {String} city - 城市
   * @param {String} district - 区域（可选）
   * @param {Object} options - 分页和排序选项
   * @returns {Promise<Object>} - 教师列表和分页信息
   */
  static async findTutorsByLocation(city, district = null, options = {}) {
    log.info(`根据地区查询教师: ${city} ${district || ''}`);

    const filters = { city };
    if (district) {
      filters.district = district;
    }

    return this.queryTutors(filters, options);
  }

  /**
   * 根据附近位置查询教师
   * @param {Number} latitude - 纬度
   * @param {Number} longitude - 经度
   * @param {Number} maxDistance - 最大距离（米）
   * @param {Object} options - 分页和排序选项
   * @returns {Promise<Object>} - 教师列表和分页信息
   */
  static async findNearbyTutors(
    latitude,
    longitude,
    maxDistance = 5000,
    options = {}
  ) {
    log.info(
      `查询附近教师: 位置(${latitude}, ${longitude}), 距离${maxDistance}米`
    );

    const filters = {
      nearLocation: {
        latitude,
        longitude,
        maxDistance,
      },
    };

    return this.queryTutors(filters, options);
  }

  /**
   * 获取推荐教师
   * @param {Object} studentPreferences - 学生偏好
   * @param {Object} options - 分页和排序选项
   * @returns {Promise<Object>} - 教师列表和分页信息
   */
  static async getRecommendedTutors(studentPreferences, options = {}) {
    log.info(`获取推荐教师: ${JSON.stringify(studentPreferences)}`);

    const filters = {};

    // 根据学生偏好构建过滤条件
    if (studentPreferences.subject) {
      filters.subject = studentPreferences.subject;
    }

    if (studentPreferences.grade) {
      filters.grade = studentPreferences.grade;
    }

    if (studentPreferences.location) {
      if (studentPreferences.location.city) {
        filters.city = studentPreferences.location.city;
      }
      if (studentPreferences.location.district) {
        filters.district = studentPreferences.location.district;
      }
    }

    if (studentPreferences.maxPrice) {
      filters.maxPrice = studentPreferences.maxPrice;
    }

    // 默认按评分排序
    options.sortBy = options.sortBy || 'ratings.overall';
    options.sortOrder = options.sortOrder || -1;

    return this.queryTutors(filters, options);
  }

  /**
   * 获取教师所在城市的家教需求帖子
   * @param {String} tutorId - 教师ID
   * @param {Object} options - 排序选项
   * @returns {Promise<Object>} - 帖子列表和分页信息
   */
  static async getCityTutoringRequests(tutorId, options = {}) {
    try {
      log.info(`获取教师 ${tutorId} 所在城市的家教需求帖子`);

      // 获取教师资料卡
      const tutorProfile = await TutorProfile.findOne({ tutorId });
      if (!tutorProfile) {
        throw new AppError('教师资料卡不存在', 404);
      }

      // 获取教师所在城市
      const city = tutorProfile.location.city;
      if (!city) {
        throw new AppError('教师没有设置城市信息', 400);
      }

      // 设置排序参数
      const {
        sortBy = 'createdAt',
        sortOrder = -1,
      } = options;

      const sort = {};
      sort[sortBy] = sortOrder;

      // 创建城市匹配模式 - 处理"北京"和"北京市"这样的差异
      // 移除"市"、"省"、"自治区"等后缀，只保留主要名称
      const cityPattern = city.replace(/(市|省|自治区|特别行政区)$/, '');
      
      // 使用正则表达式进行模糊匹配
      const requests = await TutoringRequest.find({
        'location.city': { $regex: new RegExp(`^${cityPattern}(市|省|自治区|特别行政区)?$`, 'i') },
        status: { $in: ['open', 'published'] },
      })
        .sort(sort);

      // 统计总数
      const total = requests.length;

      log.info(
        `成功获取教师 ${tutorId} 所在城市(${city})的家教需求帖子: ${requests.length} 条`
      );

      return {
        requests,
        pagination: {
          total,
          page: 1,
          limit: total,
          pages: 1,
        },
      };
    } catch (error) {
      log.error(`获取教师所在城市的家教需求帖子失败: ${error.message}`, error);
      throw error;
    }
  }

  /**
   * 根据多个条件获取教师所在城市的家教需求帖子
   * @param {String} tutorId - 教师ID
   * @param {Object} filters - 筛选条件
   * @param {Object} options - 分页和排序选项
   * @returns {Promise<Object>} - 帖子列表和分页信息
   */
  static async getCityTutoringRequestsWithFilters(
    tutorId,
    filters = {},
    options = {}
  ) {
    try {
      log.info(
        `获取教师 ${tutorId} 所在城市的家教需求帖子，带筛选条件: ${JSON.stringify(
          filters
        )}`
      );

      // 获取教师资料卡
      const tutorProfile = await TutorProfile.findOne({ tutorId });
      if (!tutorProfile) {
        throw new AppError('教师资料卡不存在', 404);
      }

      // 获取教师所在城市
      const city = tutorProfile.location.city;
      if (!city) {
        throw new AppError('教师没有设置城市信息', 400);
      }

      // 构建查询条件
      const query = {
        'location.city': city,
        status: { $in: ['open', 'published'] }, // 修改这里，使用 $in 操作符
      };

      // 添加科目筛选
      if (filters.subject) {
        query['subjects.name'] = filters.subject;
      }

      // 添加年级筛选
      if (filters.grade) {
        query['grade'] = filters.grade;
      }

      // 添加教育水平筛选
      if (filters.educationLevel) {
        query['preferences.educationLevel'] = filters.educationLevel;
      }

      // 添加价格区间筛选
      if (filters.minPrice !== undefined && filters.maxPrice !== undefined) {
        query['preferences.priceRange.min'] = { $lte: filters.maxPrice };
        query['preferences.priceRange.max'] = { $gte: filters.minPrice };
      }

      // 添加开课时间筛选
      if (filters.session) {
        if (filters.session.day) {
          query['preferences.schedule.days'] = filters.session.day;
        }
        if (filters.session.period) {
          query['preferences.schedule.periods'] = filters.session.period;
        }
      }

      // 设置排序参数（保留排序功能）
      const {
        sortBy = 'createdAt',
        sortOrder = -1,
      } = options;

      const sort = {};
      sort[sortBy] = sortOrder;

      // 执行查询 - 移除 skip 和 limit，返回所有结果
      const requests = await TutoringRequest.find(query)
        .sort(sort);

      // 统计总数
      const total = requests.length;

      log.info(
        `成功获取教师 ${tutorId} 所在城市(${city})的家教需求帖子: ${requests.length} 条`
      );

      // 返回所有结果，但保持响应格式一致
      return {
        requests,
        pagination: {
          total,
          page: 1,
          limit: total,
          pages: 1,
        },
      };
    } catch (error) {
      log.error(
        `根据条件获取教师所在城市的家教需求帖子失败: ${error.message}`,
        error
      );
      throw error;
    }
  }
}

module.exports = TutorProfileService;
