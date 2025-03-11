const ResponseHandler = require('../utils/responseHandler');

const errorHandler = (err, req, res, next) => {
    console.error(err.stack);

    if (err.name === 'ValidationError') {
        return ResponseHandler.error(res, err.message, 400);
    }

    if (err.name === 'CastError') {
        return ResponseHandler.error(res, '无效的ID格式', 400);
    }

    if (err.code === 11000) {
        return ResponseHandler.error(res, '数据重复', 400);
    }

    return ResponseHandler.error(
        res,
        process.env.NODE_ENV === 'production' ? '服务器内部错误' : err.message,
        500
    );
};

module.exports = errorHandler;
