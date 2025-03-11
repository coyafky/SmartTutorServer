const { responseBodyMiddleware, accessLogger, errorLogger, consoleLogger, log } = require('../utils/logger');

// 请求日志中间件
const requestLogger = (req, res, next) => {
  // 记录请求开始时间
  req.startTime = Date.now();
  
  // 请求完成后记录
  res.on('finish', () => {
    const duration = Date.now() - req.startTime;
    const message = `${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`;
    
    if (res.statusCode >= 500) {
      log.error(`服务器错误: ${message}`);
    } else if (res.statusCode >= 400) {
      log.warn(`客户端错误: ${message}`);
    } else {
      log.info(`请求成功: ${message}`);
    }
  });
  
  next();
};

// 错误日志中间件
const errorLoggerMiddleware = (err, req, res, next) => {
  log.error(`处理请求时发生错误: ${req.method} ${req.originalUrl}`, err);
  next(err);
};

module.exports = {
  setupLoggers: (app) => {
    // 应用响应体拦截中间件
    app.use(responseBodyMiddleware);
    
    // 应用日志中间件
    if (process.env.NODE_ENV === 'production') {
      app.use(accessLogger);
      app.use(errorLogger);
    } else {
      app.use(consoleLogger);
    }
    
    // 应用自定义请求日志中间件
    app.use(requestLogger);
    
    // 返回错误日志中间件，需要在路由之后、错误处理之前使用
    return errorLoggerMiddleware;
  }
};