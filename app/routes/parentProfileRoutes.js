const express = require('express');
const router = express.Router();
const ParentProfileController = require('../controllers/ParentProfileController');
const { authenticateToken, checkRole } = require('../middlewares/auth');
const { validateParentRole } = require('../middlewares/roleValidator');

// 创建家长档案
router.post(
  '/',
  authenticateToken,
  validateParentRole,
  ParentProfileController.createProfile
);

// 获取家长档案
router.get('/:parentId', authenticateToken, ParentProfileController.getProfile);

// 更新家长档案
router.put(
  '/:parentId',
  authenticateToken,
  validateParentRole,
  ParentProfileController.updateProfile
);

// 删除家长档案
router.delete('/:parentId', authenticateToken, ParentProfileController.deleteProfile);

// 子女管理相关路由
// 添加子女信息
router.put(
  '/:parentId/children',
  authenticateToken,
  validateParentRole,
  ParentProfileController.addChild
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
  validateParentRole,
  ParentProfileController.updateChild
);

// 删除子女信息
router.delete(
  '/:parentId/children/:childId',
  authenticateToken,
  validateParentRole,
  ParentProfileController.deleteChild
);

module.exports = router;
