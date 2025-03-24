const mongoose = require('mongoose');
const TutorProfileService = require('../../app/services/TutorProfileService');
const TutorProfile = require('../../models/TutorProfile');
const { AppError } = require('../../app/utils/errorHandler');

describe('TutorProfileService - Location Tests', () => {
  let testTutorId;

  beforeAll(async () => {
    await mongoose.connect('mongodb://localhost:27017/smart_tutor');

    const testProfile = await TutorProfile.create({
      tutorId: 'TUTOR_20240101000000',
      userId: new mongoose.Types.ObjectId(),
      firstName: '测试',
      lastName: '教师',
    });

    testTutorId = testProfile.tutorId;
  });

  afterAll(async () => {
    await TutorProfile.deleteMany({});
    await mongoose.connection.close();
  });

  describe('updateLocation', () => {
    it('应该成功更新有效的位置信息', async () => {
      const locationData = {
        address: '科技园路1号腾讯大厦',
        district: '南山区',
        city: '深圳市',
        geo: {
          type: 'Point',
          coordinates: [113.953411, 22.549176],
        },
      };

      const updatedProfile = await TutorProfileService.updateLocation(
        testTutorId,
        locationData
      );

      expect(updatedProfile.location.address).toBe(locationData.address);
      expect(updatedProfile.location.district).toBe(locationData.district);
      expect(updatedProfile.location.city).toBe(locationData.city);
      expect(updatedProfile.location.geo.type).toBe('Point');
      expect(updatedProfile.location.geo.coordinates).toEqual(
        locationData.geo.coordinates
      );
    });

    it('应该拒绝无效的坐标范围', async () => {
      const invalidLocationData = {
        address: '测试地址',
        district: '测试区',
        city: '测试市',
        geo: {
          type: 'Point',
          coordinates: [200, 100],
        },
      };

      await expect(
        TutorProfileService.updateLocation(testTutorId, invalidLocationData)
      ).rejects.toThrow('无效的经纬度坐标范围');
    });

    it('应该正确处理缺失的坐标信息', async () => {
      const partialLocationData = {
        address: '测试地址',
        district: '测试区',
        city: '测试市',
      };

      const updatedProfile = await TutorProfileService.updateLocation(
        testTutorId,
        partialLocationData
      );

      expect(updatedProfile.location.address).toBe(partialLocationData.address);
      expect(updatedProfile.location.geo.coordinates).toEqual([0, 0]);
    });

    it('应该拒绝不存在的教师ID', async () => {
      const locationData = {
        address: '测试地址',
        district: '测试区',
        city: '测试市',
        geo: {
          type: 'Point',
          coordinates: [116.403963, 39.915119],
        },
      };

      await expect(
        TutorProfileService.updateLocation('TUTOR_99999999999999', locationData)
      ).rejects.toThrow('教师资料卡不存在');
    });
  });
});
