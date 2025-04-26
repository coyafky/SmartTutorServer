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
    serverSelectionTimeoutMS: 30000,   // 增加超时时间到30秒
    maxPoolSize: 10,                 // 连接池最大连接数
    useNewUrlParser: true,          // 使用新的URL解析器
    useUnifiedTopology: true,       // 使用新的统一拓扑引擎
    retryWrites: true,              // 自动重试写操作
    socketTimeoutMS: 45000,         // 增加套接字超时时间
    heartbeatFrequencyMS: 10000,    // 降低心跳频率
    family: 4                       // 强制使用IPv4
  }
};

/**
 * 连接数据库的异步函数
 * 尝试连接到 MongoDB，包含重试机制和详细的错误处理
 * @async
 * @function connectDB
 * @returns {Promise<void>}
 */
const connectDB = async () => {
  console.log('正在连接MongoDB数据库...');
  
  // 最大重试次数
  const MAX_RETRIES = 3;
  let retries = 0;
  let connected = false;
  
  // 检查环境变量
  console.log(`环境: ${process.env.NODE_ENV || '未设置'}`);
  // 日志连接字符串（隐藏密码）
  const redactedUri = dbConfig.url.replace(/\/\/([^:]+):([^@]+)@/, '//\\1:******@');
  console.log(`连接到: ${redactedUri}`);
  
  while (retries < MAX_RETRIES && !connected) {
    try {
      // 检查数据库 URL 是否存在
      if (!dbConfig.url) {
        throw new Error('数据库连接 URI 未定义');
      }

      // 检查连接字符串格式
      if (!dbConfig.url.startsWith('mongodb://') && !dbConfig.url.startsWith('mongodb+srv://')) {
        throw new Error('数据库连接字符串格式不正确，必须以mongodb://或mongodb+srv://开头');
      }

      // 尝试连接到 MongoDB
      console.log(`尝试连接 (${retries + 1}/${MAX_RETRIES})...`);
      await mongoose.connect(dbConfig.url, dbConfig.options);
      
      connected = true;
      console.log('MongoDB 连接成功');
      
      // 设置连接事件监听器
      mongoose.connection.on('disconnected', () => {
        console.log('MongoDB 连接已断开，尝试重连...');
        setTimeout(() => connectDB(), 5000); // 尝试重新连接
      });
      
      mongoose.connection.on('error', (err) => {
        console.error('MongoDB 连接出错:', err.message);
      });
      
    } catch (error) {
      retries++;
      console.error(`MongoDB 连接失败 (${retries}/${MAX_RETRIES}):`, error.message);
      console.error('错误详情:', error);
      
      // 检查特定错误类型
      if (error.name === 'MongoParseError') {
        console.error('连接字符串解析错误，请检查MongoDB URI格式');
      } else if (error.name === 'MongoNetworkError') {
        console.error('网络错误，可能是网络连接问题或IP白名单设置');
      } else if (error.message.includes('authentication failed')) {
        console.error('认证失败，请检查用户名和密码');
      }
      
      if (retries < MAX_RETRIES) {
        // 等待后重试
        const waitTime = retries * 3000; // 每次重试增加等待时间
        console.log(`将在 ${waitTime}ms 后重试...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      } else if (process.env.NODE_ENV === 'production') {
        // 在生产环境中只记录错误但不退出
        console.error('所有重试均失败，但在生产环境中继续运行。数据库功能将不可用。');
      } else {
        // 开发环境下退出
        console.error('所有重试均失败，程序将退出。');
        process.exit(1);  // 非零退出码表示错误
      }
    }
  }
  
  // 如果在生产环境中依然无法连接，返回而不退出
  if (!connected && process.env.NODE_ENV === 'production') {
    console.error('无法连接到MongoDB，但在生产环境中继续运行。数据库功能将不可用。');
    return;
  }
};

// 导出连接函数供其他模块使用
module.exports = connectDB;
