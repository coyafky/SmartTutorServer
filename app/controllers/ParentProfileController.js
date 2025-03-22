const ParentProfileService = require('../services/ParentProfileService');
const ChildProfileService = require('../services/ChildProfileService');
const TutorProfile = require('../../models/TutorProfile');

class ParentProfileController {
  // 创建家长档案
  static async createProfile(req, res, next) {
    try {
      // 使用用户的 customId 作为 parentId
      const profileData = { ...req.body, parentId: req.user.customId };
      const profile = await ParentProfileService.createProfile(profileData);
      
      res.status(201).json({
        status: 'success',
        data: profile,
      });
    } catch (error) {
      next(error);
    }
  }

  // 获取家长档案
  static async getProfile(req, res, next) {
    try {
      const profile = await ParentProfileService.getProfile(
        req.params.parentId
      );
      res.status(200).json({
        status: 'success',
        data: {
          profile,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // 更新家长档案
  static async updateProfile(req, res, next) {
    try {
      const profile = await ParentProfileService.updateProfile(
        req.params.parentId,
        req.body
      );
      res.status(200).json({
        status: 'success',
        data: {
          profile,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // 删除家长档案
  static async deleteProfile(req, res, next) {
    try {
      await ParentProfileService.deleteProfile(req.params.parentId);
      res.status(204).json({
        status: 'success',
        data: null,
      });
    } catch (error) {
      next(error);
    }
  }

  // 添加子女信息
  static async addChild(req, res, next) {
    try {
      const child = await ChildProfileService.addChild(
        req.params.parentId,
        req.body
      );
      res.status(201).json({
        status: 'success',
        data: {
          child,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // 获取子女信息列表
  static async getChildren(req, res, next) {
    try {
      const children = await ChildProfileService.getChildren(
        req.params.parentId
      );
      res.status(200).json({
        status: 'success',
        data: {
          children,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // 获取单个子女信息
  static async getChild(req, res, next) {
    try {
      const child = await ChildProfileService.getChild(
        req.params.parentId,
        req.params.childId
      );
      res.status(200).json({
        status: 'success',
        data: {
          child,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // 更新子女信息
  static async updateChild(req, res, next) {
    try {
      const child = await ChildProfileService.updateChild(
        req.params.parentId,
        req.params.childId,
        req.body
      );
      res.status(200).json({
        status: 'success',
        data: {
          child,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // 删除子女信息
  static async deleteChild(req, res, next) {
    try {
      await ChildProfileService.deleteChild(
        req.params.parentId,
        req.params.childId
      );
      res.status(200).json({
        status: 'success',
        data: null,
      });
    } catch (error) {
      next(error);
    }
  }

  // 获取同城市的教师列表
  static async getTutorsByCity(req, res, next) {
    try {
      const tutors = await ParentProfileService.getTutorsByCity(req.params.parentId);
      res.status(200).json({
        status: 'success',
        data: {
          tutors,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // 按科目筛选教师
  static async getTutorsBySubject(req, res, next) {
    try {
      const { subject } = req.query;
      if (!subject) {
        return res.status(400).json({
          status: 'fail',
          message: '请提供科目名称',
        });
      }
      
      const tutors = await ParentProfileService.getTutorsBySubject(
        req.params.parentId,
        subject
      );
      
      res.status(200).json({
        status: 'success',
        data: {
          tutors,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // 按地理位置筛选教师
  static async getTutorsByLocation(req, res, next) {
    try {
      const { longitude, latitude } = req.query;
      if (!longitude || !latitude) {
        return res.status(400).json({
          status: 'fail',
          message: '请提供经纬度坐标',
        });
      }
      
      const location = {
        longitude: parseFloat(longitude),
        latitude: parseFloat(latitude),
      };
      
      const tutors = await ParentProfileService.getTutorsByLocation(
        req.params.parentId,
        location
      );
      
      res.status(200).json({
        status: 'success',
        data: {
          tutors,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // 按价格区间筛选教师
  static async getTutorsByPriceRange(req, res, next) {
    try {
      const { minPrice, maxPrice } = req.query;
      if (!minPrice || !maxPrice) {
        return res.status(400).json({
          status: 'fail',
          message: '请提供最低和最高价格',
        });
      }
      
      const tutors = await ParentProfileService.getTutorsByPriceRange(
        req.params.parentId,
        parseFloat(minPrice),
        parseFloat(maxPrice)
      );
      
      res.status(200).json({
        status: 'success',
        data: {
          tutors,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // 按学历筛选教师
  static async getTutorsByEducation(req, res, next) {
    try {
      const { educationLevel } = req.query;
      if (!educationLevel) {
        return res.status(400).json({
          status: 'fail',
          message: '请提供学历要求',
        });
      }
      
      const tutors = await ParentProfileService.getTutorsByEducation(
        req.params.parentId,
        educationLevel
      );
      
      res.status(200).json({
        status: 'success',
        data: {
          tutors,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // 按开课时间筛选教师
  static async getTutorsBySession(req, res, next) {
    try {
      const { day, period } = req.query;
      if (!day || !period) {
        return res.status(400).json({
          status: 'fail',
          message: '请提供开课日期和时间段',
        });
      }
      
      const session = { day, period };
      const tutors = await ParentProfileService.getTutorsBySession(
        req.params.parentId,
        session
      );
      
      res.status(200).json({
        status: 'success',
        data: {
          tutors,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // 多条件筛选教师
  static async getTutorsByMultipleConditions(req, res, next) {
    try {
      // 从请求中获取各种筛选条件
      const {
        subject,
        minPrice,
        maxPrice,
        educationLevel,
        minRating,
        minExperience,
        availabilityStatus,
        day,
        period
      } = req.query;
      
      // 构建条件对象
      const conditions = {};
      
      if (subject) conditions.subject = subject;
      if (minPrice !== undefined && maxPrice !== undefined) {
        conditions.minPrice = parseFloat(minPrice);
        conditions.maxPrice = parseFloat(maxPrice);
      }
      if (educationLevel) conditions.educationLevel = educationLevel;
      if (minRating) conditions.minRating = parseFloat(minRating);
      if (minExperience) conditions.minExperience = parseInt(minExperience);
      if (availabilityStatus) conditions.availabilityStatus = availabilityStatus;
      if (day || period) {
        conditions.session = {};
        if (day) conditions.session.day = day;
        if (period) conditions.session.period = period;
      }
      
      const tutors = await ParentProfileService.getTutorsByMultipleConditions(
        req.params.parentId,
        conditions
      );
      
      res.status(200).json({
        status: 'success',
        data: {
          tutors,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // 按科目和价格区间筛选教师
  static async getTutorsBySubjectAndPrice(req, res, next) {
    try {
      const { subject, minPrice, maxPrice } = req.query;
      if (!subject || !minPrice || !maxPrice) {
        return res.status(400).json({
          status: 'fail',
          message: '请提供科目、最低价格和最高价格',
        });
      }
      
      const tutors = await ParentProfileService.getTutorsBySubjectAndPrice(
        req.params.parentId,
        subject,
        parseFloat(minPrice),
        parseFloat(maxPrice)
      );
      
      res.status(200).json({
        status: 'success',
        data: {
          tutors,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // 按科目、学历和评分筛选教师
  static async getTutorsBySubjectEducationAndRating(req, res, next) {
    try {
      const { subject, educationLevel, minRating } = req.query;
      if (!subject || !educationLevel || !minRating) {
        return res.status(400).json({
          status: 'fail',
          message: '请提供科目、学历和最低评分',
        });
      }
      
      const tutors = await ParentProfileService.getTutorsBySubjectEducationAndRating(
        req.params.parentId,
        subject,
        educationLevel,
        parseFloat(minRating)
      );
      
      res.status(200).json({
        status: 'success',
        data: {
          tutors,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // 按开课时间、科目和教学经验筛选教师
  static async getTutorsBySessionSubjectAndExperience(req, res, next) {
    try {
      const { day, period, subject, minExperience } = req.query;
      if (!day || !period || !subject || !minExperience) {
        return res.status(400).json({
          status: 'fail',
          message: '请提供开课日期、时间段、科目和最低教学经验',
        });
      }
      
      const session = { day, period };
      const tutors = await ParentProfileService.getTutorsBySessionSubjectAndExperience(
        req.params.parentId,
        session,
        subject,
        parseInt(minExperience)
      );
      
      res.status(200).json({
        status: 'success',
        data: {
          tutors,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ParentProfileController;
