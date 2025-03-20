const ParentProfileService = require('../services/ParentProfileService');
const ChildProfileService = require('../services/ChildProfileService');

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
      res.status(204).json({
        status: 'success',
        data: null,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ParentProfileController;
