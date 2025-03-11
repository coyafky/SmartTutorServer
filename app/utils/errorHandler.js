const { log } = require('./logger');

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

const errorHandler = (err, req, res, next) => {
  // 处理错误并返回响应
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  
  // 记录错误
  if (err.statusCode >= 500) {
    log.error(`服务器错误: ${err.message}`, err);
  } else {
    log.warn(`客户端错误: ${err.message}`);
  }
  
  // 开发环境下返回详细错误信息
  if (process.env.NODE_ENV === 'development') {
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }
  // 生产环境下返回简化的错误信息
  else {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }
};

module.exports = { AppError, errorHandler };
