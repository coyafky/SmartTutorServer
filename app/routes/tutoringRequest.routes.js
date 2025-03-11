const express = require('express');
const router = express.Router();
const TutoringRequestController = require('../controllers/TutoringRequestController');
const { authenticate } = require('../middlewares/auth');
const { validateParentRole } = require('../middlewares/roleValidator');

// 创建家教需求帖子
router.post(
  '/',
  authenticate,
  validateParentRole,
  TutoringRequestController.createRequest
);

// 获取单个家教需求帖子
router.get(
  '/:requestId',
  authenticate,
  TutoringRequestController.getRequest
);

// 更新家教需求帖子
router.put(
  '/:requestId',
  authenticate,
  validateParentRole,
  TutoringRequestController.updateRequest
);

// 删除家教需求帖子
router.delete(
  '/:requestId',
  authenticate,
  validateParentRole,
  TutoringRequestController.deleteRequest
);

// 查询家教需求帖子列表
router.get(
  '/',
  authenticate,
  TutoringRequestController.queryRequests
);

module.exports = router;