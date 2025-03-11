const express = require('express');
const router = express.Router();
const ParentProfileController = require('../controllers/ParentProfileController');
const { auth } = require('../middleware/auth');
const { validateChildProfile } = require('../middleware/validator');

// 添加子女信息
router.post(
  '/:parentId/children',
  auth,
  validateChildProfile,
  ParentProfileController.addChild
);

// 获取子女信息列表
router.get(
  '/:parentId/children',
  auth,
  ParentProfileController.getChildren
);

// 获取单个子女信息
router.get(
  '/:parentId/children/:childId',
  auth,
  ParentProfileController.getChild
);

// 更新子女信息
router.put(
  '/:parentId/children/:childId',
  auth,
  validateChildProfile,
  ParentProfileController.updateChild
);

// 删除子女信息
router.delete(
  '/:parentId/children/:childId',
  auth,
  ParentProfileController.deleteChild
);

module.exports = router;