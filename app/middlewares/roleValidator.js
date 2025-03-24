const { AppError } = require('../utils/errorHandler');

// 验证用户是否为家长角色的中间件
const validateParentRole = (req, res, next) => {
  // 检查用户是否存在（应该已经由 auth 中间件设置）
  if (!req.user) {
    return next(new AppError('未经授权的访问', 401));
  }

  // 检查用户角色是否为家长
  if (req.user.role !== 'parent') {
    return next(new AppError('只有家长可以执行此操作', 403));
  }

  // 如果验证通过，继续下一个中间件
  next();
};

// 新增教师角色验证中间件
const validateTeacherRole = (req, res, next) => {
  if (!req.user) {
    return next(new AppError('未经授权的访问', 401));
  }

  if (req.user.role !== 'teacher') {
    return next(new AppError('只有教师可以执行此操作', 403));
  }

  next();
};

module.exports = {
  validateParentRole,
  validateTeacherRole // 导出新增的中间件
};