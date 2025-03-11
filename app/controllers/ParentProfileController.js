const ParentProfileService = require('../services/ParentProfileService');
const ChildProfileService = require('../services/ChildProfileService');

class ParentProfileController {
  // 创建家长档案
  async createProfile(req, res, next) {
    try {
      const profile = await ParentProfileService.createProfile(req.body);
      
    } catch (error) {
      next(error);
    }
  }

  // 获取家长档案
  async getProfile(req, res, next) {
    try {
      const profile = await ParentProfileService.getProfile(req.params.parentId);
     
    } catch (error) {
      next(error);
    }
  }

  // 更新家长档案
  async updateProfile(req, res, next) {
    try {
      const profile = await ParentProfileService.updateProfile(req.params.parentId, req.body);
     
    } catch (error) {
      next(error);
    }
  }

  // 删除家长档案
  async deleteProfile(req, res, next) {
    try {
      await ParentProfileService.deleteProfile(req.params.parentId);
      
    } catch (error) {
      next(error);
    }
  }

  // 添加子女信息
  async addChild(req, res, next) {
    try {
      const child = await ChildProfileService.addChild(req.params.parentId, req.body);
     
    } catch (error) {
      next(error);
    }
  }

  // 获取子女信息列表
  async getChildren(req, res, next) {
    try {
      const children = await ChildProfileService.getChildren(req.params.parentId);
     
    } catch (error) {
      next(error);
    }
  }

  // 获取单个子女信息
  async getChild(req, res, next) {
    try {
      const child = await ChildProfileService.getChild(req.params.parentId, req.params.childId);
      
    } catch (error) {
      next(error);
    }
  }

  // 更新子女信息
  async updateChild(req, res, next) {
    try {
      const child = await ChildProfileService.updateChild(
        req.params.parentId,
        req.params.childId,
        req.body
      );
      
    } catch (error) {
      next(error);
    }
  }

  // 删除子女信息
  async deleteChild(req, res, next) {
    try {
      await ChildProfileService.deleteChild(req.params.parentId, req.params.childId);
     
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ParentProfileController();