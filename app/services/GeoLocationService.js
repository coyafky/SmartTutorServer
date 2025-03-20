/**
 * 地理位置服务
 * 提供与地理位置相关的功能，包括地址解析、逆地址解析、IP定位等
 * @module services/GeoLocationService
 */

const axios = require('axios');
const { AppError } = require('../utils/errorHandler');

/**
 * 地理位置服务类
 * 封装高德地图API提供的地理位置服务
 */
class GeoLocationService {
  /**
   * 构造函数
   * 初始化高德地图API的基础URL和密钥
   */
  constructor() {
    this.baseUrl = 'https://restapi.amap.com/v3';
    this.key = process.env.AMAP_API_KEY || '';
    
    if (!this.key) {
      console.warn('警告: 未设置高德地图API密钥 (AMAP_API_KEY)');
    }
  }
  
  /**
   * 地址解析（地址转坐标）
   * 将详细的结构化地址转换为高德经纬度坐标
   * @param {Object} params - 请求参数
   * @param {string} params.address - 结构化地址信息
   * @param {string} [params.city] - 指定查询的城市
   * @returns {Promise<Object>} 解析结果
   */
  async geocode(params) {
    try {
      if (!params.address) {
        return { success: false, message: '地址参数不能为空' };
      }
      
      const response = await axios.get(`${this.baseUrl}/geocode/geo`, {
        params: {
          key: this.key,
          address: params.address,
          city: params.city || '',
          output: 'JSON'
        }
      });
      
      const data = response.data;
      
      if (data.status !== '1') {
        return { 
          success: false, 
          message: data.info || '地址解析失败' 
        };
      }
      
      if (!data.geocodes || data.geocodes.length === 0) {
        return { 
          success: false, 
          message: '未找到匹配的地址' 
        };
      }
      
      const result = data.geocodes[0];
      const coordinates = result.location.split(',').map(Number);
      
      return {
        success: true,
        formattedAddress: result.formatted_address,
        province: result.province,
        city: result.city,
        district: result.district,
        township: result.township,
        neighborhood: result.neighborhood,
        building: result.building,
        adcode: result.adcode,
        coordinates,
        level: result.level
      };
    } catch (error) {
      console.error('地址解析出错:', error);
      return { 
        success: false, 
        message: '地址解析服务出错' 
      };
    }
  }
  
  /**
   * 逆地址解析（坐标转地址）
   * 将经纬度坐标转换为详细结构化地址
   * @param {Object} params - 请求参数
   * @param {Array<number>} params.location - 经纬度坐标 [longitude, latitude]
   * @param {number} [params.radius=1000] - 搜索半径
   * @param {string} [params.extensions='base'] - 返回结果控制 base/all
   * @returns {Promise<Object>} 解析结果
   */
  async regeocode(params) {
    try {
      if (!params.location || !Array.isArray(params.location) || params.location.length !== 2) {
        return { success: false, message: '无效的坐标格式' };
      }
      
      const locationStr = params.location.join(',');
      const radius = params.radius || 1000;
      const extensions = params.extensions || 'base';
      
      const response = await axios.get(`${this.baseUrl}/geocode/regeo`, {
        params: {
          key: this.key,
          location: locationStr,
          radius,
          extensions,
          output: 'JSON'
        }
      });
      
      const data = response.data;
      
      if (data.status !== '1') {
        return { 
          success: false, 
          message: data.info || '逆地址解析失败' 
        };
      }
      
      if (!data.regeocode) {
        return { 
          success: false, 
          message: '未找到匹配的地址信息' 
        };
      }
      
      const result = data.regeocode;
      
      return {
        success: true,
        formattedAddress: result.formatted_address,
        addressComponent: result.addressComponent,
        roads: result.roads,
        roadinters: result.roadinters,
        pois: result.pois,
        aois: result.aois
      };
    } catch (error) {
      console.error('逆地址解析出错:', error);
      return { 
        success: false, 
        message: '逆地址解析服务出错' 
      };
    }
  }
  
  /**
   * IP定位
   * 根据IP地址获取位置信息
   * @param {Object} params - 请求参数
   * @param {string} [params.ip] - IP地址，默认为发起请求的客户端IP
   * @returns {Promise<Object>} 定位结果
   */
  async ipLocation(params = {}) {
    try {
      const response = await axios.get(`${this.baseUrl}/ip`, {
        params: {
          key: this.key,
          ip: params.ip || '',
          output: 'JSON'
        }
      });
      
      const data = response.data;
      
      if (data.status !== '1') {
        return { 
          success: false, 
          message: data.info || 'IP定位失败' 
        };
      }
      
      return {
        success: true,
        province: data.province,
        city: data.city,
        adcode: data.adcode,
        rectangle: data.rectangle,
        info: data.info
      };
    } catch (error) {
      console.error('IP定位出错:', error);
      return { 
        success: false, 
        message: 'IP定位服务出错' 
      };
    }
  }
  
  /**
   * 计算距离
   * 计算两点间的距离
   * @param {Object} params - 请求参数
   * @param {Array<Array<number>>} params.origins - 起点坐标集合 [[lng1, lat1], [lng2, lat2], ...]
   * @param {Array<number>} params.destination - 终点坐标 [lng, lat]
   * @param {string} [params.type='straight'] - 计算方式 straight:直线距离 driving:驾车导航距离
   * @returns {Promise<Object>} 距离计算结果
   */
  async calculateDistance(params) {
    try {
      if (!params.origins || !Array.isArray(params.origins) || params.origins.length === 0) {
        return { success: false, message: '起点坐标不能为空' };
      }
      
      if (!params.destination || !Array.isArray(params.destination) || params.destination.length !== 2) {
        return { success: false, message: '终点坐标格式无效' };
      }
      
      // 将起点坐标数组转换为字符串
      const originsStr = params.origins.map(point => point.join(',')).join('|');
      const destinationStr = params.destination.join(',');
      const type = params.type || 'straight';
      
      const response = await axios.get(`${this.baseUrl}/distance`, {
        params: {
          key: this.key,
          origins: originsStr,
          destination: destinationStr,
          type,
          output: 'JSON'
        }
      });
      
      const data = response.data;
      
      if (data.status !== '1') {
        return { 
          success: false, 
          message: data.info || '距离计算失败' 
        };
      }
      
      return {
        success: true,
        results: data.results,
        info: data.info
      };
    } catch (error) {
      console.error('距离计算出错:', error);
      return { 
        success: false, 
        message: '距离计算服务出错' 
      };
    }
  }
  
  /**
   * 搜索兴趣点
   * 根据关键词搜索兴趣点
   * @param {Object} params - 请求参数
   * @param {string} [params.keywords] - 关键词
   * @param {string} [params.types] - POI类型
   * @param {string} [params.city] - 搜索城市
   * @param {Array<number>} [params.location] - 中心点坐标 [lng, lat]
   * @param {number} [params.radius=3000] - 搜索半径，单位：米
   * @param {number} [params.page=1] - 页码
   * @param {number} [params.offset=20] - 每页记录数
   * @returns {Promise<Object>} 搜索结果
   */
  async searchPOI(params = {}) {
    try {
      if (!params.keywords && !params.types) {
        return { success: false, message: '关键词或类型参数不能同时为空' };
      }
      
      const searchParams = {
        key: this.key,
        keywords: params.keywords || '',
        types: params.types || '',
        city: params.city || '',
        radius: params.radius || 3000,
        page: params.page || 1,
        offset: params.offset || 20,
        extensions: 'all',
        output: 'JSON'
      };
      
      // 如果提供了位置，添加到请求参数
      if (params.location && Array.isArray(params.location) && params.location.length === 2) {
        searchParams.location = params.location.join(',');
      }
      
      const response = await axios.get(`${this.baseUrl}/place/text`, {
        params: searchParams
      });
      
      const data = response.data;
      
      if (data.status !== '1') {
        return { 
          success: false, 
          message: data.info || '搜索兴趣点失败' 
        };
      }
      
      return {
        success: true,
        count: data.count,
        pois: data.pois,
        suggestion: data.suggestion,
        info: data.info
      };
    } catch (error) {
      console.error('搜索兴趣点出错:', error);
      return { 
        success: false, 
        message: '搜索兴趣点服务出错' 
      };
    }
  }
}

// 导出单例实例
module.exports = new GeoLocationService();
