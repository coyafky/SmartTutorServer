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
      if (
        parent.location &&
        parent.location.coordinates &&
        parent.location.coordinates.type === 'Point' &&
        !parent.location.coordinates.coordinates
      ) {
        // 如果坐标对象存在但没有坐标数组，添加默认坐标
        parent.location.coordinates.coordinates = [116.3, 39.9]; // 默认坐标，北京市中心
      }

      // 准备新的子女数据对象
      const newChildData = { ...childData };

      // 生成 childId
      // 提取父母 ID 中的时间戳部分
      let parentTimestamp = '';
      const parentIdMatch = parentId.match(/PARENT_(\d{14})/);

      if (parentIdMatch && parentIdMatch[1]) {
        parentTimestamp = parentIdMatch[1];
      } else {
        // 如果无法从父母 ID 中提取时间戳，则生成当前时间戳
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        parentTimestamp = `${year}${month}${day}${hours}${minutes}${seconds}`;
      }

      // 计算序号，从 01 开始
      const childrenCount = parent.children.length + 1;
      const sequenceNumber =
        childrenCount < 10 ? `0${childrenCount}` : `${childrenCount}`;

      // 生成格式为 CHILD_时间戳_序号 的 childId
      newChildData.childId = `CHILD_${parentTimestamp}_${sequenceNumber}`;

      console.log('Generated childId:', newChildData.childId);

      // 添加子女信息
      parent.children.push(newChildData);

      // 保存更新后的家长档案
      await parent.save();

      // 返回新添加的子女信息
      return parent.children[parent.children.length - 1];
    } catch (error) {
      console.error('Error in addChild:', error);
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

      // 直接在数组中查找 childId 匹配的子女
      const child = parent.children.find((c) => c.childId === childId);

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
      console.log(`尝试更新子女信息: parentId=${parentId}, childId=${childId}`);
      
      // 确保不修改 childId
      if (updateData.childId) {
        delete updateData.childId;
      }
      
      // 使用 MongoDB 的原生操作更新文档
      const result = await Parent.findOneAndUpdate(
        { 
          parentId: parentId, 
          'children.childId': childId 
        },
        { 
          $set: { 'children.$': { ...updateData, childId } } 
        },
        { 
          new: true, 
          runValidators: false 
        }
      );

      if (!result) {
        throw new Error('更新失败，未找到家长或子女信息');
      }

      // 找到更新后的子女信息
      const updatedChild = result.children.find(c => c.childId === childId);
      
      if (!updatedChild) {
        throw new Error('更新后未找到子女信息');
      }
      
      return updatedChild;
    } catch (error) {
      console.error('Error in updateChild:', error);
      throw new Error(`更新子女信息失败: ${error.message}`);
    }
  }

  // 删除子女信息
  static async deleteChild(parentId, childId) {
    try {
      console.log(`尝试删除子女信息: parentId=${parentId}, childId=${childId}`);
      
      // 使用 MongoDB 的原生操作更新文档
      const result = await Parent.findOneAndUpdate(
        { 
          parentId: parentId 
        },
        { 
          $pull: { children: { childId: childId } } 
        },
        { 
          new: true, 
          runValidators: false 
        }
      );

      if (!result) {
        throw new Error('删除失败，未找到家长信息');
      }

      // 检查子女是否已被删除
      const childStillExists = result.children.some(c => c.childId === childId);
      
      if (childStillExists) {
        throw new Error('删除失败，子女信息仍然存在');
      }
      
      return true;
    } catch (error) {
      console.error('Error in deleteChild:', error);
      throw new Error(`删除子女信息失败: ${error.message}`);
    }
  }
}

module.exports = ChildProfileService;
