const mongoose = require('mongoose');

const dbConfig = {
  url: process.env.MONGO_URI || 'mongodb://localhost:27017/smarttutor',
  options: {
    serverSelectionTimeoutMS: 5000,
    maxPoolSize: 10
  }
};

const connectDB = async () => {
  try {
    if (!dbConfig.url) {
      throw new Error('数据库连接 URI 未定义');
    }

    await mongoose.connect(dbConfig.url, dbConfig.options);
    console.log('MongoDB 连接成功');
  } catch (error) {
    console.error('MongoDB 连接失败:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
