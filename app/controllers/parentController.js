const Parent = require('../../models/Parent');
const ResponseHandler = require('../utils/responseHandler');

// 生成家长ID
const generateParentId = () => {
    const date = new Date();
    const timestamp = date.getFullYear().toString() +
        (date.getMonth() + 1).toString().padStart(2, '0') +
        date.getDate().toString().padStart(2, '0') +
        date.getHours().toString().padStart(2, '0') +
        date.getMinutes().toString().padStart(2, '0') +
        date.getSeconds().toString().padStart(2, '0');
    return `PARENT_${timestamp}`;
};

// 创建家长信息
exports.createParent = async (req, res, next) => {
    try {
        const parentData = { ...req.body };
        parentData.parentId = generateParentId();

        const parent = new Parent(parentData);
        const savedParent = await parent.save();

        return ResponseHandler.success(res, savedParent, '家长信息创建成功', 201);
    } catch (error) {
        next(error);
    }
};

// 获取单个家长信息
exports.getParent = async (req, res, next) => {
    try {
        const parent = await Parent.findOne({ parentId: req.params.parentId });
        if (!parent) {
            return ResponseHandler.error(res, '未找到该家长信息', 404);
        }

        return ResponseHandler.success(res, parent);
    } catch (error) {
        next(error);
    }
};

// 更新家长信息
exports.updateParent = async (req, res, next) => {
    try {
        const parent = await Parent.findOneAndUpdate(
            { parentId: req.params.parentId },
            req.body,
            { new: true, runValidators: true }
        );

        if (!parent) {
            return ResponseHandler.error(res, '未找到该家长信息', 404);
        }

        return ResponseHandler.success(res, parent, '家长信息更新成功');
    } catch (error) {
        next(error);
    }
};

// 删除家长信息
exports.deleteParent = async (req, res, next) => {
    try {
        const parent = await Parent.findOneAndDelete({ parentId: req.params.parentId });

        if (!parent) {
            return ResponseHandler.error(res, '未找到该家长信息', 404);
        }

        return ResponseHandler.success(res, null, '家长信息已成功删除');
    } catch (error) {
        next(error);
    }
};

// 获取所有家长列表
exports.getAllParents = async (req, res, next) => {
    try {
        const { status, page = 1, limit = 10 } = req.query;
        const query = {};
        
        if (status) {
            query.status = status;
        }

        const skip = (page - 1) * limit;
        const parents = await Parent.find(query)
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 });

        const total = await Parent.countDocuments(query);

        return ResponseHandler.success(res, {
            parents,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        next(error);
    }
};
