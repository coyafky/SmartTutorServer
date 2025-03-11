require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');
const { errorHandler } = require('./app/utils/errorHandler');
// 导入路由
const tutorProfileRoutes = require('./app/routes/tutorProfileRoutes');
// 导入路由
const authRoutes = require('./app/routes/auth');
const userRoutes = require('./app/routes/user');
// const parentProfileRoutes = require('./app/routes/parentProfileRoutes');
// 初始化 Express 应用

const app = express();

// 连接数据库
connectDB(process.env.MONGODB_URI);

// 中间件配置
// 跨域配置使用环境变量
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

// 端口配置使用环境变量
const PORT = process.env.PORT || 3000;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// API 路由
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tutorProfiles', tutorProfileRoutes);
// app.use('api/parentProfiles', parentProfileRoutes);
// 处理 404 错误
app.use((req, res, next) => {
  res.status(404).json({
    status: 'error',
    message: '未找到请求的资源',
  });
});

// 全局错误处理中间件
app.use(errorHandler);

// 启动服务器
app.listen(PORT, () => {
  console.log(`服务器正在运行，端口 ${PORT}`);
});

// 处理未捕获的异常
process.on('unhandledRejection', (err) => {
  console.error('未处理的 Promise 拒绝:', err);
  // 记录错误但不退出进程
  console.error('服务器继续运行中...');
});

// 处理未捕获的异常
process.on('uncaughtException', (err) => {
  console.error('未捕获的异常:', err);
  // 记录错误但不退出进程
  console.error('服务器继续运行中...');
});

module.exports = app;
