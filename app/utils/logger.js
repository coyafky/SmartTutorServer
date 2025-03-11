const fs = require('fs');
const path = require('path');
const morgan = require('morgan');

// 确保日志目录存在
const logDirectory = path.join(__dirname, '../..', 'logs');
if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory);
}

// 创建访问日志写入流
const accessLogStream = fs.createWriteStream(
  path.join(logDirectory, 'access.log'),
  { flags: 'a' }
);

// 创建错误日志写入流
const errorLogStream = fs.createWriteStream(
  path.join(logDirectory, 'error.log'),
  { flags: 'a' }
);

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
const accessLogger = morgan(detailedFormat, { stream: accessLogStream });
const consoleLogger = morgan(detailedFormat);
const errorLogger = morgan(errorFormat, { 
  stream: errorLogStream,
  skip: (req, res) => res.statusCode < 400
});

// 自定义日志函数
const log = {
  info: (message) => {
    const logEntry = `[INFO] [${new Date().toISOString()}] ${message}`;
    console.log(logEntry);
    fs.appendFileSync(path.join(logDirectory, 'app.log'), logEntry + '\n');
  },
  error: (message, error) => {
    const logEntry = `[ERROR] [${new Date().toISOString()}] ${message} ${error ? ': ' + error.stack : ''}`;
    console.error(logEntry);
    fs.appendFileSync(path.join(logDirectory, 'error.log'), logEntry + '\n');
  },
  warn: (message) => {
    const logEntry = `[WARN] [${new Date().toISOString()}] ${message}`;
    console.warn(logEntry);
    fs.appendFileSync(path.join(logDirectory, 'app.log'), logEntry + '\n');
  },
  debug: (message) => {
    if (process.env.NODE_ENV === 'development') {
      const logEntry = `[DEBUG] [${new Date().toISOString()}] ${message}`;
      console.debug(logEntry);
      fs.appendFileSync(path.join(logDirectory, 'debug.log'), logEntry + '\n');
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