/**
 * 地理位置路由
 * 定义与地理位置相关的路由
 * @module routes/geoLocationRoutes
 */

const express = require('express');
const router = express.Router();
const GeoLocationController = require('../controllers/GeoLocationController');
const { authenticateToken } = require('../middlewares/auth');

/**
 * @route GET /api/geolocation/geocode
 * @desc 地址解析（地址转坐标）
 * @access 公开
 */
router.get('/geocode', GeoLocationController.geocode);

/**
 * @route GET /api/geolocation/regeocode
 * @desc 逆地址解析（坐标转地址）
 * @access 公开
 */
router.get('/regeocode', GeoLocationController.regeocode);

/**
 * @route GET /api/geolocation/ip
 * @desc IP定位
 * @access 公开
 */
router.get('/ip', GeoLocationController.ipLocation);

/**
 * @route POST /api/geolocation/distance
 * @desc 计算距离
 * @access 公开
 */
router.post('/distance', GeoLocationController.calculateDistance);

/**
 * @route GET /api/geolocation/search
 * @desc 搜索兴趣点
 * @access 公开
 */
router.get('/search', GeoLocationController.searchPOI);

/**
 * @route GET /api/geolocation/current
 * @desc 获取当前位置信息
 * @access 公开
 */
router.get('/current', GeoLocationController.getCurrentLocation);

/**
 * 需要认证的路由
 */
router.use(authenticateToken);

/**
 * @route POST /api/geolocation/user/update
 * @desc 更新用户地理位置
 * @access 私有
 */
router.post('/user/update', GeoLocationController.updateUserLocation);

/**
 * @route POST /api/geolocation/user/address/add
 * @desc 添加用户常用地址
 * @access 私有
 */
router.post('/user/address/add', GeoLocationController.addUserAddress);

/**
 * @route GET /api/geolocation/user/addresses
 * @desc 获取用户常用地址列表
 * @access 私有
 */
router.get('/user/addresses', GeoLocationController.getUserAddresses);

/**
 * @route DELETE /api/geolocation/user/address/:id
 * @desc 删除用户常用地址
 * @access 私有
 */
router.delete('/user/address/:id', GeoLocationController.deleteUserAddress);

module.exports = router;
