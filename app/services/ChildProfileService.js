const Parent = require('../../models/Parent');
const mongoose = require('mongoose');

class ChildProfileService {
  // 添加子女信息
  static async addChild(parentId, childData) {
    try {
      // 查找家长档案
      const parent = await Parent.findOne({ parentId });
      if (!parent) {
        throw new Error('未找到家长档案');
      }

      // 确保坐标有效
      if (parent.location && parent.location.coordinates && 
          parent.location.coordinates.type === 'Point' && 
          !parent.location.coordinates.coordinates) {
        // 如果坐标对象存在但没有坐标数组，添加默认坐标
        parent.location.coordinates.coordinates = [116.3, 39.9]; // 默认坐标，北京市中心
      }

      // 添加子女信息
      parent.children.push(childData);
      
      // 保存更新后的家长档案
      await parent.save();

      // 返回新添加的子女信息
      return parent.children[parent.children.length - 1];
    } catch (error) {
      throw new Error(`添加子女信息失败: ${error.message}`);
    }
  }

  // 获取子女信息列表
  static async getChildren(parentId) {
    try {
      const parent = await Parent.findOne({ parentId });
      if (!parent) {
        throw new Error('未找到家长档案');
      }
      return parent.children;
    } catch (error) {
      throw new Error(`获取子女信息列表失败: ${error.message}`);
    }
  }

  // 获取单个子女信息
  static async getChild(parentId, childId) {
    try {
      const parent = await Parent.findOne({ parentId });
      if (!parent) {
        throw new Error('未找到家长档案');
      }

      const child = parent.children.id(childId);
      if (!child) {
        throw new Error('未找到子女信息');
      }

      return child;
    } catch (error) {
      throw new Error(`获取子女信息失败: ${error.message}`);
    }
  }

  // 更新子女信息
  static async updateChild(parentId, childId, updateData) {
    try {
      const parent = await Parent.findOne({ parentId });
      if (!parent) {
        throw new Error('未找到家长档案');
      }

      const child = parent.children.id(childId);
      if (!child) {
        throw new Error('未找到子女信息');
      }

      Object.assign(child, updateData);
      await parent.save();

      return child;
    } catch (error) {
      throw new Error(`更新子女信息失败: ${error.message}`);
    }
  }

  // 删除子女信息
  static async deleteChild(parentId, childId) {
    try {
      const parent = await Parent.findOne({ parentId });
      if (!parent) {
        throw new Error('未找到家长档案');
      }

      const child = parent.children.id(childId);
      if (!child) {
        throw new Error('未找到子女信息');
      }

      child.remove();
      await parent.save();

      return true;
    } catch (error) {
      throw new Error(`删除子女信息失败: ${error.message}`);
    }
  }
}

module.exports = ChildProfileService;