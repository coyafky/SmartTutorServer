const ResponseHandler = require('../utils/responseHandler');

const validateRequest = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body);
        if (error) {
            return ResponseHandler.error(res, error.details[0].message, 400);
        }
        next();
    };
};

module.exports = validateRequest;
