const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../../models/User');
const { AppError } = require('../utils/errorHandler');
const { log } = require('../utils/logger');

// 使用环境变量中的 JWT 配置
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;

class AuthService {
  // 用户注册服务
  static async register(userData) {
    const { username, password, role } = userData;
    
    log.info(`尝试注册新用户: ${username}, 角色: ${role}`);

    // 检查用户名是否已存在
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      log.warn(`注册失败: 用户名 ${username} 已存在`);
      throw new AppError('用户名已存在', 409);
    }

    // 根据角色生成正确的前缀
    let rolePrefix;
    switch (role) {
      case 'teacher':
        rolePrefix = 'TUTOR';
        break;
      case 'parent':
        rolePrefix = 'PARENT';
        break;
      case 'admin':
        rolePrefix = 'ADMIN';
        break;
      default:
        log.warn(`注册失败: 无效的用户角色 ${role}`);
        throw new AppError('无效的用户角色', 400);
    }

    // 生成14位的时间戳字符串
    const timestamp = new Date().toISOString()
      .replace(/[-T:.Z]/g, '')  // 移除所有特殊字符
      .slice(0, 14);            // 只取前14位

    const customId = `${rolePrefix}_${timestamp}`;
    log.debug(`为用户 ${username} 生成的自定义ID: ${customId}`);

    try {
      // 加密密码
      const hashedPassword = await bcrypt.hash(password, 12);

      // 创建新用户
      const user = await User.create({
        customId,
        username,
        password: hashedPassword,
        role
      });

      log.info(`用户注册成功: ${username}, ID: ${customId}`);

      // 生成 JWT token
      const token = this.generateToken(user);

      return { user, token };
    } catch (error) {
      log.error(`用户注册过程中发生错误: ${error.message}`, error);
      throw error;
    }
  }

  // 用户登录服务
  static async login(username, password) {
    log.info(`尝试登录: ${username}`);
    
    try {
      // 查找用户并包含密码字段
      const user = await User.findOne({ username }).select('+password');
      
      if (!user) {
        log.warn(`登录失败: 用户名 ${username} 不存在`);
        throw new AppError('用户名或密码错误', 401);
      }

      // 验证密码
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        log.warn(`登录失败: 用户 ${username} 密码错误`);
        throw new AppError('用户名或密码错误', 401);
      }

      // 检查用户状态
      if (user.status !== 'active') {
        log.warn(`登录失败: 用户 ${username} 状态为 ${user.status}`);
        throw new AppError(`您的账号已${user.status === 'banned' ? '被禁用' : '未激活'}`, 403);
      }

      // 更新最后登录时间
      user.lastLoginAt = new Date();
      await user.save();

      log.info(`用户 ${username} 登录成功`);

      // 生成 token
      const token = this.generateToken(user);

      return { user, token };
    } catch (error) {
      if (!error.isOperational) {
        log.error(`登录过程中发生错误: ${error.message}`, error);
      }
      throw error
    }
  }

  // 生成 JWT token
  static generateToken(user) {
    return jwt.sign(
      { 
        customId: user.customId,
        role: user.role 
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
  }
}

module.exports = AuthService;