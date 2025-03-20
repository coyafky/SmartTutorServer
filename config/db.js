/**
 * 数据库配置文件
 * 负责建立与 MongoDB 数据库的连接
 */

// 导入 Mongoose 库，用于 MongoDB 对象数据建模和连接
const mongoose = require('mongoose');

/**
 * 数据库配置对象
 * @property {string} url - 数据库连接地址，优先使用环境变量中的 URI，如果未设置则使用本地默认地址
 * @property {Object} options - Mongoose 连接选项
 */
const dbConfig = {
  url: process.env.MONGO_URI || 'mongodb://localhost:27017/smarttutor',
  options: {
    serverSelectionTimeoutMS: 5000,  // 服务器选择超时时间（毫秒）
    maxPoolSize: 10                  // 连接池最大连接数
  }
};

/**
 * 连接数据库的异步函数
 * 尝试连接到 MongoDB，如果成功则输出成功消息，如果失败则输出错误并退出进程
 * @async
 * @function connectDB
 * @returns {Promise<void>}
 */
const connectDB = async () => {
  try {
    // 检查数据库 URL 是否存在
    if (!dbConfig.url) {
      throw new Error('数据库连接 URI 未定义');
    }

    // 尝试连接到 MongoDB
    await mongoose.connect(dbConfig.url, dbConfig.options);
    console.log('MongoDB 连接成功');
  } catch (error) {
    // 连接失败时输出错误并退出进程
    console.error('MongoDB 连接失败:', error.message);
    process.exit(1);  // 非零退出码表示错误
  }
};

// 导出连接函数供其他模块使用
module.exports = connectDB;
