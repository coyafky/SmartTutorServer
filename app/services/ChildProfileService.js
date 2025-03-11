const Parent = require('../../models/Parent');
const mongoose = require('mongoose');

class ChildProfileService {
  // 添加子女信息
  async addChild(parentId, childData) {
    try {
      const parent = await Parent.findOne({ parentId });
      if (!parent) {
        throw new Error('未找到家长档案');
      }

      parent.children.push(childData);
      await parent.save();

      return parent.children[parent.children.length - 1];
    } catch (error) {
      throw new Error(`添加子女信息失败: ${error.message}`);
    }
  }

  // 获取子女信息列表
  async getChildren(parentId) {
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
  async getChild(parentId, childId) {
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
  async updateChild(parentId, childId, updateData) {
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
  async deleteChild(parentId, childId) {
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

module.exports = new ChildProfileService();