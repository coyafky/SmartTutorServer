const express = require('express');
const router = express.Router();
const ParentProfileController = require('../controllers/ParentProfileController');
const { authenticateToken } = require('../middlewares/auth');
const { validateChildProfile } = require('../middlewares/validator');

// 添加子女信息
router.post(
  '/:parentId/children',
  authenticateToken,
  validateChildProfile,
  ChildProfileService.addChild
);

// 获取子女信息列表
router.get(
  '/:parentId/children',
  authenticateToken,
  ParentProfileController.getChildren
);

// 获取单个子女信息
router.get(
  '/:parentId/children/:childId',
  authenticateToken,
  ParentProfileController.getChild
);

// 更新子女信息
router.put(
  '/:parentId/children/:childId',
  authenticateToken,
  validateChildProfile,
  ParentProfileController.updateChild
);

// 删除子女信息
router.delete(
  '/:parentId/children/:childId',
  authenticateToken,
  ParentProfileController.deleteChild
);

module.exports = router;
