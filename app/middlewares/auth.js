// 引入所需模块
const jwt = require('jsonwebtoken');
const { AppError } = require('../utils/errorHandler');
const User = require('../../models/User');

// 使用环境变量中的 JWT 密钥
const JWT_SECRET = process.env.JWT_SECRET;

// 验证 Token 的中间件
const authenticateToken = async (req, res, next) => {
  try {
    // 从请求头获取 token
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    // 如果没有 token，返回未授权错误
    if (!token) {
      return next(new AppError('未提供访问令牌', 401));
    }

    // 验证 token
    const decoded = jwt.verify(token, JWT_SECRET);

    // 查找用户
    const user = await User.findOne({ customId: decoded.customId });
    if (!user) {
      return next(new AppError('用户不存在', 401));
    }

    // 将用户信息添加到请求对象中
    req.user = user;
    next();
  } catch (error) {
    next(new AppError('无效的访问令牌', 401));
  }
};

// 检查用户角色的中间件
const checkRole = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('您没有权限执行此操作', 403));
    }
    next();
  };
};

module.exports = {
  authenticateToken,
  checkRole
};