const AuthService = require('../services/AuthService');
const { AppError } = require('../utils/errorHandler');

class AuthController {
  // 用户注册控制器
  static async register(req, res, next) {
    try {
      const { username, password, role } = req.body;

      // 验证必要字段
      if (!username || !password || !role) {
        throw new AppError('请提供完整的注册信息', 400);
      }

      // 调用注册服务
      const { user, token } = await AuthService.register({ username, password, role });

      // 返回成功响应
      res.status(201).json({
        status: 'success',
        data: {
          user,
          token
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // 用户登录控制器
  static async login(req, res, next) {
    try {
      const { username, password } = req.body;

      // 验证必要字段
      if (!username || !password) {
        throw new AppError('请提供用户名和密码', 400);
      }

      // 调用登录服务
      const { user, token } = await AuthService.login(username, password);

      // 返回成功响应
      res.status(200).json({
        status: 'success',
        data: {
          user,
          token
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AuthController;