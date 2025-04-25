/**
 * 服务器入口文件
 * 负责配置和启动智能家教推荐系统的后端服务
 */

// 加载环境变量
require('dotenv').config();

// 导入核心依赖
const express = require('express'); // Web 框架
const http = require('http'); // HTTP 服务器
const cors = require('cors'); // 跨域资源共享
const morgan = require('morgan'); // HTTP 请求日志记录器
const connectDB = require('./config/db'); // 数据库连接函数
const { errorHandler } = require('./app/utils/errorHandler'); // 全局错误处理工具
const SocketService = require('./app/services/SocketService'); // Socket.IO 服务

// 导入路由模块
const tutorProfileRoutes = require('./app/routes/tutorProfileRoutes'); // 教师资料路由
const authRoutes = require('./app/routes/auth'); // 认证路由
const userRoutes = require('./app/routes/user'); // 用户路由
const parentProfileRoutes = require('./app/routes/parentProfileRoutes'); // 家长资料路由
const adminRoutes = require('./app/routes/adminRoutes'); // 管理员路由
const recommendationRoutes = require('./app/routes/recommendationRoutes'); // 推荐功能路由
const geoLocationRoutes = require('./app/routes/geoLocationRoutes'); // 地理位置路由
const messageRoutes = require('./app/routes/messageRoutes'); // 消息交流路由
const ratingRoutes = require('./app/routes/ratingRoutes'); // 评价路由
const lessonRoutes = require('./app/routes/lessonRoutes'); // 课程管理路由
const notificationRoutes = require('./app/routes/notificationRoutes'); // 通知路由
// 初始化 Express 应用和 HTTP 服务器
const app = express();
const server = http.createServer(app);

/**
 * 数据库连接
 * 使用环境变量中的 MongoDB URI 连接到数据库
 */
connectDB();

/**
 * 中间件配置
 */
// 配置跨域资源共享 (CORS)，允许所有来源访问
app.use(
  cors({
    origin: '*', // 允许任何来源
    credentials: false // 当使用 origin: '*' 时，credentials 必须为 false
  })
);

// 注意: 如果在生产环境需要携带凭证（cookies），请使用以下方式：
// app.use(
//   cors({
//     origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['http://localhost:5173'],
//     credentials: true
//   })
// );

// 服务器端口配置，优先使用环境变量中的端口，默认为3000
const PORT = process.env.PORT || 3000;

// 解析 JSON 请求体
app.use(express.json());

// 解析 URL 编码的请求体
app.use(express.urlencoded({ extended: true }));

// 开发环境下的 HTTP 请求日志
app.use(morgan('dev'));

/**
 * API 路由注册
 * 所有路由都以 /api 前缀开始，按功能模块分类
 */
app.use('/api/auth', authRoutes); // 认证相关路由（登录、注册等）
app.use('/api/users', userRoutes); // 用户管理路由
app.use('/api/tutorProfiles', tutorProfileRoutes); // 教师资料路由
app.use('/api/admin', adminRoutes); // 管理员路由
app.use('/api/parentProfiles', parentProfileRoutes); // 家长资料路由
app.use('/api/recommendations', recommendationRoutes); // 推荐功能路由
app.use('/api/geolocation', geoLocationRoutes); // 地理位置路由
app.use('/api/messages', messageRoutes); // 消息交流路由
app.use('/api/ratings', ratingRoutes); // 评价路由
app.use('/api/lessons', lessonRoutes); // 课程管理路由
app.use('/api/notifications', notificationRoutes); // 通知路由
/**
 * 404 错误处理中间件
 * 当请求的资源不存在时返回404状态码和错误信息
 */
app.use((req, res, next) => {
  res.status(404).json({
    status: 'error',
    message: '未找到请求的资源',
  });
});

/**
 * 全局错误处理中间件
 * 统一处理应用中抛出的所有错误
 */
app.use(errorHandler);

/**
 * 初始化 Socket.IO 服务
 * 用于家长和老师之间的即时消息交互
 */
SocketService.initialize(server);

/**
 * 启动服务器
 * 监听指定端口并输出启动信息
 */
server.listen(PORT, () => {
  console.log(`服务器正在运行，端口 ${PORT}`);
  console.log(`Socket.IO 服务已启动，支持即时消息功能`);
});

/**
 * 全局异常处理
 * 捕获未处理的 Promise 拒绝，防止应用崩溃
 * @param {Error} err - 错误对象
 */
process.on('unhandledRejection', (err) => {
  console.error('未处理的 Promise 拒绝:', err);
  // 记录错误但不退出进程，保持服务器运行
  console.error('服务器继续运行中...');
});

/**
 * 全局异常处理
 * 捕获未捕获的异常，防止应用崩溃
 * @param {Error} err - 错误对象
 */
process.on('uncaughtException', (err) => {
  console.error('未捕获的异常:', err);
  // 记录错误但不退出进程，保持服务器运行
  console.error('服务器继续运行中...');
});

/**
 * 导出方式
 * 同时兼容Vercel Serverless环境和常规Node.js环境
 */

// 判断是否在Vercel环境中
// 为Vercel提供导出一个Express应用实例
module.exports = app;

// 同时允许在常规环境中访问app和server
module.exports.app = app;
module.exports.server = server;
