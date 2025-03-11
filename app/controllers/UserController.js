const UserService = require('../services/UserService');
const { AppError } = require('../utils/errorHandler');

class UserController {
  // 获取用户列表
  static async getUsers(req, res, next) {
    try {
      const { page, limit, role, status } = req.query;
      const query = {};
      
      // 构建查询条件
      if (role) query.role = role;
      if (status) query.status = status;

      // 获取用户列表
      const result = await UserService.getUsers(query, { page, limit });

      res.status(200).json({
        status: 'success',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  // 获取单个用户信息
  static async getUser(req, res, next) {
    try {
      const { customId } = req.params;
      const user = await UserService.getUserById(customId);

      res.status(200).json({
        status: 'success',
        data: { user }
      });
    } catch (error) {
      next(error);
    }
  }

  // 更新用户信息
  static async updateUser(req, res, next) {
    try {
      const { customId } = req.params;
      const updateData = req.body;

      const user = await UserService.updateUser(customId, updateData);

      res.status(200).json({
        status: 'success',
        data: { user }
      });
    } catch (error) {
      next(error);
    }
  }

  // 更新用户状态
  static async updateUserStatus(req, res, next) {
    try {
      const { customId } = req.params;
      const { status } = req.body;

      if (!status) {
        throw new AppError('请提供要更新的状态', 400);
      }

      const user = await UserService.updateUserStatus(customId, status);

      res.status(200).json({
        status: 'success',
        data: { user }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = UserController;