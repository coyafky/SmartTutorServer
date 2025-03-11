const express = require('express');
const router = express.Router();
const ParentProfileController = require('../controllers/ParentProfileController');
const { auth } = require('../middleware/auth');
const { validateParentProfile } = require('../middleware/roleValidator');
// parent profile 中的 controller 和
// 创建家长档案
router.post(
  '/',
  auth,
  validateParentProfile,
  ParentProfileController.createProfile
);

// 获取家长档案
router.get('/:parentId', auth, ParentProfileController.getProfile);

// 更新家长档案
router.put(
  '/:parentId',
  auth,
  validateParentProfile,
  ParentProfileController.updateProfile
);

// 删除家长档案
router.delete('/:parentId', auth, ParentProfileController.deleteProfile);

module.exports = router;
