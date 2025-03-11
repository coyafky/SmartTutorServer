const User = require('../../models/User');
const { AppError } = require('../utils/errorHandler');

class UserService {
  // 获取用户列表
  static async getUsers(query = {}, options = {}) {
    const { page = 1, limit = 10, sort = '-createdAt' } = options;
    
    const users = await User
      .find(query)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await User.countDocuments(query);

    return {
      users,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    };
  }

  // 获取单个用户信息
  static async getUserById(customId) {
    const user = await User.findOne({ customId });
    if (!user) {
      throw new AppError('用户不存在', 404);
    }
    return user;
  }

  // 更新用户信息
  static async updateUser(customId, updateData) {
    // 不允许更新敏感字段
    delete updateData.password;
    delete updateData.role;
    delete updateData.customId;

    const user = await User.findOneAndUpdate(
      { customId },
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!user) {
      throw new AppError('用户不存在', 404);
    }

    return user;
  }

  // 更改用户状态
  static async updateUserStatus(customId, status) {
    const user = await User.findOneAndUpdate(
      { customId },
      { status, updatedAt: new Date() },
      { new: true }
    );

    if (!user) {
      throw new AppError('用户不存在', 404);
    }

    return user;
  }
}

module.exports = UserService;