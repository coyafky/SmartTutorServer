const fs = require('fs');
const path = require('path');
const morgan = require('morgan');

// 判断环境，在Vercel等Serverless环境中使用控制台日志而非文件日志
const isServerlessEnv = process.env.VERCEL || process.env.NODE_ENV === 'production';

// 日志流对象
let accessLogStream, errorLogStream;

// 只在非Serverless环境中创建文件日志
if (!isServerlessEnv) {
  // 确保日志目录存在
  const logDirectory = path.join(__dirname, '../..', 'logs');
  if (!fs.existsSync(logDirectory)) {
    fs.mkdirSync(logDirectory);
  }

  // 创建访问日志写入流
  accessLogStream = fs.createWriteStream(
    path.join(logDirectory, 'access.log'),
    { flags: 'a' }
  );

  // 创建错误日志写入流
  errorLogStream = fs.createWriteStream(
    path.join(logDirectory, 'error.log'),
    { flags: 'a' }
  );
}

// 自定义日志格式，包含请求体和响应体
morgan.token('request-body', (req) => {
  if (req.body && Object.keys(req.body).length > 0) {
    // 敏感信息处理
    const body = { ...req.body };
    if (body.password) body.password = '******';
    return JSON.stringify(body);
  }
  return '-';
});

morgan.token('response-body', (req, res) => {
  if (res._body) {
    return JSON.stringify(res._body);
  }
  return '-';
});

// 创建一个响应拦截器，用于捕获响应体
const responseBodyMiddleware = (req, res, next) => {
  const originalSend = res.send;
  
  res.send = function(body) {
    res._body = body;
    return originalSend.call(this, body);
  };
  
  next();
};

// 详细的日志格式
const detailedFormat = ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" :response-time ms :request-body';

// 错误日志格式
const errorFormat = ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :response-time ms :request-body';

// 创建日志记录器
let accessLogger, errorLogger;

// 在Serverless环境中使用控制台输出
// 在非Serverless环境中使用文件日志
if (isServerlessEnv) {
  accessLogger = morgan(detailedFormat);
  errorLogger = morgan(errorFormat, {
    skip: (req, res) => res.statusCode < 400
  });
} else {
  accessLogger = morgan(detailedFormat, { stream: accessLogStream });
  errorLogger = morgan(errorFormat, { 
    stream: errorLogStream,
    skip: (req, res) => res.statusCode < 400
  });
}

const consoleLogger = morgan(detailedFormat);

// 自定义日志函数
const log = {
  info: (message) => {
    const logEntry = `[INFO] [${new Date().toISOString()}] ${message}`;
    console.log(logEntry);
    // 只在非Serverless环境写入文件
    if (!isServerlessEnv && logDirectory) {
      try {
        fs.appendFileSync(path.join(logDirectory, 'app.log'), logEntry + '\n');
      } catch (err) {
        console.error('Failed to write to log file:', err);
      }
    }
  },
  error: (message, error) => {
    const logEntry = `[ERROR] [${new Date().toISOString()}] ${message} ${error ? ': ' + error.stack : ''}`;
    console.error(logEntry);
    // 只在非Serverless环境写入文件
    if (!isServerlessEnv && logDirectory) {
      try {
        fs.appendFileSync(path.join(logDirectory, 'error.log'), logEntry + '\n');
      } catch (err) {
        console.error('Failed to write to error log file:', err);
      }
    }
  },
  warn: (message) => {
    const logEntry = `[WARN] [${new Date().toISOString()}] ${message}`;
    console.warn(logEntry);
    // 只在非Serverless环境写入文件
    if (!isServerlessEnv && logDirectory) {
      try {
        fs.appendFileSync(path.join(logDirectory, 'app.log'), logEntry + '\n');
      } catch (err) {
        console.error('Failed to write to log file:', err);
      }
    }
  },
  debug: (message) => {
    if (process.env.NODE_ENV === 'development') {
      const logEntry = `[DEBUG] [${new Date().toISOString()}] ${message}`;
      console.debug(logEntry);
      // 只在非Serverless环境写入文件
      if (!isServerlessEnv && logDirectory) {
        try {
          fs.appendFileSync(path.join(logDirectory, 'debug.log'), logEntry + '\n');
        } catch (err) {
          console.error('Failed to write to debug log file:', err);
        }
      }
    }
  }
};

module.exports = {
  responseBodyMiddleware,
  accessLogger,
  errorLogger,
  consoleLogger,
  log
};