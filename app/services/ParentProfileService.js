const Parent = require('../../models/Parent');

class ParentProfileService {
  // 创建家长档案
  async createProfile(profileData) {
    try {
      const parent = new Parent(profileData);
      return await parent.save();
    } catch (error) {
      throw new Error(`创建家长档案失败: ${error.message}`);
    }
  }

  // 获取家长档案
  async getProfile(parentId) {
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
  async updateProfile(parentId, updateData) {
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
  async deleteProfile(parentId) {
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
  async updateStatistics(parentId, statisticsData) {
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
}

module.exports = new ParentProfileService();
