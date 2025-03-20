/**
 * 地理位置控制器
 * 处理与地理位置相关的请求
 * @module controllers/GeoLocationController
 */

const GeoLocationService = require('../services/GeoLocationService');
const User = require('../../models/User');
const TutorProfile = require('../../models/TutorProfile');
const Parent = require('../../models/Parent');
const { AppError } = require('../utils/errorHandler');

/**
 * 地理位置控制器类
 * 提供地理位置相关的API接口
 */
class GeoLocationController {
  /**
   * 地址解析（地址转坐标）
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   * @param {Function} next - 下一个中间件函数
   * @returns {Promise<void>}
   */
  async geocode(req, res, next) {
    try {
      const { address, city } = req.query;
      
      if (!address) {
        return next(new AppError('地址参数不能为空', 400));
      }
      
      const result = await GeoLocationService.geocode({ address, city });
      
      if (!result.success) {
        return next(new AppError(result.message || '地址解析失败', 400));
      }
      
      return res.status(200).json({
        success: true,
        data: result,
        message: '地址解析成功'
      });
    } catch (error) {
      return next(new AppError('地址解析服务出错', 500));
    }
  }
  
  /**
   * 逆地址解析（坐标转地址）
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   * @param {Function} next - 下一个中间件函数
   * @returns {Promise<void>}
   */
  async regeocode(req, res, next) {
    try {
      const { longitude, latitude, radius, extensions } = req.query;
      
      if (!longitude || !latitude) {
        return next(new AppError('经纬度参数不能为空', 400));
      }
      
      const location = [parseFloat(longitude), parseFloat(latitude)];
      
      // 验证经纬度有效性
      if (location[0] < -180 || location[0] > 180 || location[1] < -90 || location[1] > 90) {
        return next(new AppError('无效的经纬度坐标', 400));
      }
      
      const result = await GeoLocationService.regeocode({
        location,
        radius: radius ? parseInt(radius, 10) : undefined,
        extensions
      });
      
      if (!result.success) {
        return next(new AppError(result.message || '逆地址解析失败', 400));
      }
      
      return res.status(200).json({
        success: true,
        data: result,
        message: '逆地址解析成功'
      });
    } catch (error) {
      return next(new AppError('逆地址解析服务出错', 500));
    }
  }
  
  /**
   * IP定位
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   * @param {Function} next - 下一个中间件函数
   * @returns {Promise<void>}
   */
  async ipLocation(req, res, next) {
    try {
      // 获取客户端IP
      const clientIp = req.query.ip || req.ip || req.headers['x-forwarded-for'] || '';
      
      const result = await GeoLocationService.ipLocation({ ip: clientIp });
      
      if (!result.success) {
        return next(new AppError(result.message || 'IP定位失败', 400));
      }
      
      return res.status(200).json({
        success: true,
        data: result,
        message: 'IP定位成功'
      });
    } catch (error) {
      return next(new AppError('IP定位服务出错', 500));
    }
  }
  
  /**
   * 计算距离
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   * @param {Function} next - 下一个中间件函数
   * @returns {Promise<void>}
   */
  async calculateDistance(req, res, next) {
    try {
      const { origins, destination, type } = req.body;
      
      if (!origins || !destination) {
        return next(new AppError('起点和终点坐标不能为空', 400));
      }
      
      // 验证坐标格式
      if (!Array.isArray(origins) || !Array.isArray(destination) || destination.length !== 2) {
        return next(new AppError('无效的坐标格式', 400));
      }
      
      const result = await GeoLocationService.calculateDistance({
        origins,
        destination,
        type
      });
      
      if (!result.success) {
        return next(new AppError(result.message || '距离计算失败', 400));
      }
      
      return res.status(200).json({
        success: true,
        data: result,
        message: '距离计算成功'
      });
    } catch (error) {
      return next(new AppError('距离计算服务出错', 500));
    }
  }
  
  /**
   * 搜索兴趣点
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   * @param {Function} next - 下一个中间件函数
   * @returns {Promise<void>}
   */
  async searchPOI(req, res, next) {
    try {
      const { 
        keywords, 
        types, 
        city, 
        longitude, 
        latitude, 
        radius, 
        page, 
        offset 
      } = req.query;
      
      if (!keywords && !types) {
        return next(new AppError('关键词或类型参数不能同时为空', 400));
      }
      
      // 构建位置参数
      let location;
      if (longitude && latitude) {
        location = [parseFloat(longitude), parseFloat(latitude)];
        
        // 验证经纬度有效性
        if (location[0] < -180 || location[0] > 180 || location[1] < -90 || location[1] > 90) {
          return next(new AppError('无效的经纬度坐标', 400));
        }
      }
      
      const result = await GeoLocationService.searchPOI({
        keywords,
        types,
        city,
        location,
        radius: radius ? parseInt(radius, 10) : undefined,
        page: page ? parseInt(page, 10) : undefined,
        offset: offset ? parseInt(offset, 10) : undefined
      });
      
      if (!result.success) {
        return next(new AppError(result.message || '搜索兴趣点失败', 400));
      }
      
      return res.status(200).json({
        success: true,
        data: result,
        message: '搜索兴趣点成功'
      });
    } catch (error) {
      return next(new AppError('搜索兴趣点服务出错', 500));
    }
  }
  
  /**
   * 获取当前位置信息
   * 根据用户IP或提供的坐标获取详细位置信息
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   * @param {Function} next - 下一个中间件函数
   * @returns {Promise<void>}
   */
  async getCurrentLocation(req, res, next) {
    try {
      const { longitude, latitude } = req.query;
      
      // 如果提供了坐标，使用逆地址解析
      if (longitude && latitude) {
        const location = [parseFloat(longitude), parseFloat(latitude)];
        
        // 验证经纬度有效性
        if (location[0] < -180 || location[0] > 180 || location[1] < -90 || location[1] > 90) {
          return next(new AppError('无效的经纬度坐标', 400));
        }
        
        const result = await GeoLocationService.regeocode({ location });
        
        if (!result.success) {
          return next(new AppError(result.message || '获取位置信息失败', 400));
        }
        
        return res.status(200).json({
          success: true,
          data: {
            source: 'coordinates',
            coordinates: location,
            formattedAddress: result.formattedAddress,
            province: result.addressComponent.province,
            city: result.addressComponent.city,
            district: result.addressComponent.district,
            adcode: result.addressComponent.adcode
          },
          message: '获取位置信息成功'
        });
      } 
      // 否则使用IP定位
      else {
        // 获取客户端IP
        const clientIp = req.ip || req.headers['x-forwarded-for'] || '';
        
        const result = await GeoLocationService.ipLocation({ ip: clientIp });
        
        if (!result.success) {
          return next(new AppError(result.message || '获取位置信息失败', 400));
        }
        
        // 从rectangle中提取中心点坐标
        let coordinates = [];
        if (result.rectangle) {
          const points = result.rectangle.split(';');
          if (points.length === 2) {
            const point1 = points[0].split(',').map(Number);
            const point2 = points[1].split(',').map(Number);
            coordinates = [
              (point1[0] + point2[0]) / 2,
              (point1[1] + point2[1]) / 2
            ];
          }
        }
        
        return res.status(200).json({
          success: true,
          data: {
            source: 'ip',
            coordinates,
            ip: clientIp,
            province: result.province,
            city: result.city,
            adcode: result.adcode
          },
          message: '获取位置信息成功'
        });
      }
    } catch (error) {
      return next(new AppError('获取位置信息服务出错', 500));
    }
  }
  
  /**
   * 更新用户地理位置
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   * @param {Function} next - 下一个中间件函数
   * @returns {Promise<void>}
   */
  async updateUserLocation(req, res, next) {
    try {
      const userId = req.user.id;
      const { 
        address, 
        district, 
        city, 
        province, 
        longitude, 
        latitude 
      } = req.body;
      
      if (!longitude || !latitude) {
        return next(new AppError('经纬度坐标不能为空', 400));
      }
      
      const coordinates = [parseFloat(longitude), parseFloat(latitude)];
      
      // 验证经纬度有效性
      if (coordinates[0] < -180 || coordinates[0] > 180 || coordinates[1] < -90 || coordinates[1] > 90) {
        return next(new AppError('无效的经纬度坐标', 400));
      }
      
      // 更新用户位置信息
      const user = await User.findOne({ customId: userId });
      
      if (!user) {
        return next(new AppError('用户不存在', 404));
      }
      
      // 更新用户模型中的位置信息
      user.location = {
        address,
        district,
        city,
        province,
        geo: {
          type: 'Point',
          coordinates
        }
      };
      
      await user.save();
      
      // 根据用户角色更新对应的详细资料
      if (user.role === 'teacher') {
        const tutorProfile = await TutorProfile.findOne({ customId: userId });
        
        if (tutorProfile) {
          tutorProfile.location = {
            address,
            district,
            city,
            geo: {
              type: 'Point',
              coordinates
            }
          };
          
          await tutorProfile.save();
        }
      } else if (user.role === 'parent') {
        const parentProfile = await Parent.findOne({ customId: userId });
        
        if (parentProfile) {
          parentProfile.location = {
            district,
            city,
            coordinates: {
              type: 'Point',
              coordinates
            }
          };
          
          await parentProfile.save();
        }
      }
      
      return res.status(200).json({
        success: true,
        data: {
          location: user.location
        },
        message: '用户位置更新成功'
      });
    } catch (error) {
      console.error('更新用户位置失败:', error);
      return next(new AppError('更新用户位置失败', 500));
    }
  }
  
  /**
   * 添加用户常用地址
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   * @param {Function} next - 下一个中间件函数
   * @returns {Promise<void>}
   */
  async addUserAddress(req, res, next) {
    try {
      const userId = req.user.id;
      const { 
        name, 
        address, 
        district, 
        city, 
        province, 
        longitude, 
        latitude,
        isDefault 
      } = req.body;
      
      if (!name || !address) {
        return next(new AppError('地址名称和详细地址不能为空', 400));
      }
      
      if (!longitude || !latitude) {
        return next(new AppError('经纬度坐标不能为空', 400));
      }
      
      const coordinates = [parseFloat(longitude), parseFloat(latitude)];
      
      // 验证经纬度有效性
      if (coordinates[0] < -180 || coordinates[0] > 180 || coordinates[1] < -90 || coordinates[1] > 90) {
        return next(new AppError('无效的经纬度坐标', 400));
      }
      
      // 获取用户
      const user = await User.findOne({ customId: userId });
      
      if (!user) {
        return next(new AppError('用户不存在', 404));
      }
      
      // 创建新地址
      const newAddress = {
        name,
        address,
        district,
        city,
        province,
        coordinates,
        isDefault: !!isDefault,
        createdAt: new Date()
      };
      
      // 如果设置为默认地址，将其他地址设为非默认
      if (newAddress.isDefault && user.savedAddresses && user.savedAddresses.length > 0) {
        user.savedAddresses.forEach(addr => {
          addr.isDefault = false;
        });
      }
      
      // 如果是第一个地址，自动设为默认
      if (!user.savedAddresses || user.savedAddresses.length === 0) {
        newAddress.isDefault = true;
      }
      
      // 添加新地址
      if (!user.savedAddresses) {
        user.savedAddresses = [];
      }
      
      user.savedAddresses.push(newAddress);
      
      await user.save();
      
      return res.status(201).json({
        success: true,
        data: {
          address: newAddress
        },
        message: '常用地址添加成功'
      });
    } catch (error) {
      console.error('添加常用地址失败:', error);
      return next(new AppError('添加常用地址失败', 500));
    }
  }
  
  /**
   * 获取用户常用地址列表
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   * @param {Function} next - 下一个中间件函数
   * @returns {Promise<void>}
   */
  async getUserAddresses(req, res, next) {
    try {
      const userId = req.user.id;
      
      // 获取用户
      const user = await User.findOne({ customId: userId });
      
      if (!user) {
        return next(new AppError('用户不存在', 404));
      }
      
      return res.status(200).json({
        success: true,
        data: {
          addresses: user.savedAddresses || []
        },
        message: '获取常用地址列表成功'
      });
    } catch (error) {
      console.error('获取常用地址列表失败:', error);
      return next(new AppError('获取常用地址列表失败', 500));
    }
  }
  
  /**
   * 删除用户常用地址
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   * @param {Function} next - 下一个中间件函数
   * @returns {Promise<void>}
   */
  async deleteUserAddress(req, res, next) {
    try {
      const userId = req.user.id;
      const addressId = req.params.id;
      
      if (!addressId) {
        return next(new AppError('地址ID不能为空', 400));
      }
      
      // 获取用户
      const user = await User.findOne({ customId: userId });
      
      if (!user) {
        return next(new AppError('用户不存在', 404));
      }
      
      // 检查地址是否存在
      if (!user.savedAddresses || user.savedAddresses.length === 0) {
        return next(new AppError('没有找到常用地址', 404));
      }
      
      // 查找要删除的地址
      const addressIndex = user.savedAddresses.findIndex(addr => addr._id.toString() === addressId);
      
      if (addressIndex === -1) {
        return next(new AppError('没有找到指定的地址', 404));
      }
      
      // 检查是否为默认地址
      const isDefault = user.savedAddresses[addressIndex].isDefault;
      
      // 删除地址
      user.savedAddresses.splice(addressIndex, 1);
      
      // 如果删除的是默认地址且还有其他地址，将第一个地址设为默认
      if (isDefault && user.savedAddresses.length > 0) {
        user.savedAddresses[0].isDefault = true;
      }
      
      await user.save();
      
      return res.status(200).json({
        success: true,
        message: '常用地址删除成功'
      });
    } catch (error) {
      console.error('删除常用地址失败:', error);
      return next(new AppError('删除常用地址失败', 500));
    }
  }
}

module.exports = new GeoLocationController();
