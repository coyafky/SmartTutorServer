const mongoose = require('mongoose');
const { faker } = require('@faker-js/faker/locale/zh_CN');
const TutorProfile = require('../models/TutorProfile');
const User = require('../models/User');

// 数据库连接配置
const MONGO_URI = 
  process.env.MONGODB_URI || 'mongodb://localhost:27017/smarttutor';

// 配置参数
const BATCH_SIZE = 50; // 每批处理50个教师数据

// 中国城市和区域数据
const CHINESE_CITIES = [
  '北京',
  '上海',
  '广州',
  '深圳',
  '杭州',
  '成都',
  '武汉',
  '南京',
  '西安',
];
const DISTRICTS = {
  北京: ['朝阳区', '海淀区', '西城区', '东城区', '丰台区'],
  上海: ['浦东新区', '徐汇区', '静安区', '黄浦区', '长宁区'],
  广州: ['天河区', '越秀区', '海珠区', '荔湾区', '白云区'],
  深圳: ['南山区', '福田区', '罗湖区', '宝安区', '龙岗区'],
  杭州: ['西湖区', '上城区', '下城区', '拱墅区', '余杭区'],
  成都: ['锦江区', '青羊区', '金牛区', '武侯区', '成华区'],
  武汉: ['江岸区', '江汉区', '硚口区', '汉阳区', '武昌区'],
  南京: ['玄武区', '秦淮区', '建邺区', '鼓楼区', '栖霞区'],
  西安: ['新城区', '碑林区', '莲湖区', '雁塔区', '未央区'],
};

// 中国大学数据
const CHINESE_UNIVERSITIES = [
  '清华大学',
  '北京大学',
  '复旦大学',
  '上海交通大学',
  '浙江大学',
  '南京大学',
  '武汉大学',
  '华中科技大学',
  '中山大学',
  '西安交通大学',
  '四川大学',
  '南开大学',
  '同济大学',
  '中国人民大学',
  '北京师范大学',
];

// 生成成功案例
function generateSuccessCases(count = 2) {
  return Array.from({ length: count }, () => ({
    description: faker.helpers.arrayElement([
      '帮助学生从60分提升到90分',
      '指导学生获得学科竞赛奖项',
      '帮助学生考入重点学校',
      '培养学生良好的学习习惯',
      '显著提升学生学习兴趣',
    ]),
    improvement: faker.number.int({ min: 20, max: 80 }),
    duration: faker.number.int({ min: 8, max: 24 }),
  }));
}

// 生成科目信息
function generateSubjects() {
  const subjects = ['数学', '语文', '英语', '物理', '化学', '生物'];
  const selectedSubjects = faker.helpers.arrayElements(subjects, {
    min: 1,
    max: 3,
  });

  return selectedSubjects.map((subject) => ({
    name: subject,
    grades: faker.helpers.arrayElements(
      [
        '小学一年级',
        '小学二年级',
        '小学三年级',
        '小学四年级',
        '小学五年级',
        '小学六年级',
        '初中一年级',
        '初中二年级',
        '初中三年级',
        '高中一年级',
        '高中二年级',
        '高中三年级',
      ],
      { min: 3, max: 6 }
    ),
    experience: faker.number.int({ min: 1, max: 5 }),
    successCases: generateSuccessCases(faker.number.int({ min: 1, max: 3 })),
  }));
}

// 生成教学时段
function generateSessions() {
  const days = ['周六', '周日'];
  const periods = ['早上', '下午', '晚上'];

  return faker.helpers.arrayElements(days, { min: 1, max: 2 }).flatMap((day) =>
    faker.helpers.arrayElements(periods, { min: 1, max: 3 }).map((period) => {
      let startTime, endTime;

      switch (period) {
        case '早上':
          startTime = '09:00';
          endTime = '12:00';
          break;
        case '下午':
          startTime = '14:00';
          endTime = '17:00';
          break;
        case '晚上':
          startTime = '19:00';
          endTime = '21:00';
          break;
      }

      return {
        day,
        period,
        available: faker.datatype.boolean(0.8), // 80%概率可用
        timeSlot: {
          startTime,
          endTime,
        },
        duration: 120,
        status: faker.helpers.arrayElement(['available', 'booked', 'blocked']),
      };
    })
  );
}

// 生成符合中国地理范围的坐标
function generateChinaCoordinates(city) {
  const cityRanges = {
    北京: { lon: [116.2, 116.5], lat: [39.8, 40.0] },
    上海: { lon: [121.4, 121.5], lat: [31.2, 31.3] },
    广州: { lon: [113.2, 113.3], lat: [23.1, 23.2] },
    深圳: { lon: [114.0, 114.1], lat: [22.5, 22.6] },
    杭州: { lon: [120.1, 120.2], lat: [30.2, 30.3] },
    成都: { lon: [104.0, 104.1], lat: [30.6, 30.7] },
    武汉: { lon: [114.2, 114.3], lat: [30.5, 30.6] },
    南京: { lon: [118.7, 118.8], lat: [32.0, 32.1] },
    西安: { lon: [108.9, 109.0], lat: [34.2, 34.3] },
  };

  const range = cityRanges[city] || { lon: [112, 123], lat: [20, 40] };
  return [
    faker.location.longitude(range.lon[0], range.lon[1]),
    faker.location.latitude(range.lat[0], range.lat[1]),
  ];
}

// 生成教师信息
function generateTutorProfile(user) {
  const city = faker.helpers.arrayElement(CHINESE_CITIES);
  const district = faker.helpers.arrayElement(DISTRICTS[city]);
  const coordinates = generateChinaCoordinates(city);

  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  const gender = faker.person.sex();

  // 直接使用用户的customId作为tutorId，确保一致性
  const tutorId = user.customId;

  return {
    isVerified: faker.datatype.boolean(0.7), // 70%概率已验证
    verifiedAt: faker.datatype.boolean(0.7) ? faker.date.recent() : null,
    status: faker.helpers.arrayElement(['active', 'inactive', 'suspended']),
    tutorId,
    userId: user._id,
    firstName,
    lastName,
    gender,
    education: {
      level: faker.helpers.arrayElement(['985', '211', '一本', '二本', '其他']),
      school: faker.helpers.arrayElement(CHINESE_UNIVERSITIES),
      major: faker.helpers.arrayElement([
        '数学',
        '物理',
        '化学',
        '中文',
        '英语',
        '生物',
        '历史',
        '地理',
        '政治',
      ]),
      graduationYear: faker.number.int({ min: 2010, max: 2023 }),
    },
    teachingExperience: {
      years: faker.number.int({ min: 1, max: 10 }),
      subjects: generateSubjects(),
    },
    availabilityStatus: faker.helpers.arrayElement([
      'available',
      'busy',
      'offline',
    ]),
    schedule: {
      weekend: {
        sessions: generateSessions(),
        defaultTimes: {
          早上: { startTime: '09:00', endTime: '12:00' },
          下午: { startTime: '14:00', endTime: '17:00' },
          晚上: { startTime: '19:00', endTime: '21:00' },
        },
      },
    },
    location: {
      address: `${city}${district}${faker.location.streetAddress()}`,
      district,
      city,
      geo: {
        type: 'Point',
        coordinates,
      },
    },
    pricing: {
      basePrice: faker.number.int({ min: 100, max: 300 }),
    },
    teachingStyle: {
      description: faker.lorem.paragraph(),
      keywords: faker.helpers.arrayElements(
        [
          '互动教学',
          '启发式',
          '因材施教',
          '寓教于乐',
          '系统化',
          '循序渐进',
          '案例分析',
          '问题导向',
          '个性化',
        ],
        { min: 2, max: 5 }
      ),
      strengths: faker.helpers.arrayElements(
        [
          '知识点讲解透彻',
          '善于激发兴趣',
          '解题技巧丰富',
          '耐心细致',
          '善于沟通',
          '经验丰富',
          '熟悉考纲',
          '提分效果显著',
        ],
        { min: 2, max: 4 }
      ),
    },
    ratings: {
      overall: faker.number.float({ min: 3, max: 5, precision: 0.1 }),
      teachingQuality: faker.number.float({ min: 3, max: 5, precision: 0.1 }),
      attitude: faker.number.float({ min: 3, max: 5, precision: 0.1 }),
      punctuality: faker.number.float({ min: 3, max: 5, precision: 0.1 }),
      communication: faker.number.float({ min: 3, max: 5, precision: 0.1 }),
      effectiveness: faker.number.float({ min: 3, max: 5, precision: 0.1 }),
    },
    statistics: {
      totalStudents: faker.number.int({ min: 5, max: 50 }),
      totalClasses: faker.number.int({ min: 20, max: 200 }),
      completionRate: faker.number.float({ min: 0.8, max: 1, precision: 0.01 }),
      repeatRate: faker.number.float({ min: 0.3, max: 0.9, precision: 0.01 }),
    },
  };
}

// 批量生成教师数据
async function generateTutorsBatch(tutorUsers, startIndex, batchSize) {
  const endIndex = Math.min(startIndex + batchSize, tutorUsers.length);
  const currentBatch = tutorUsers.slice(startIndex, endIndex);

  console.log(
    `处理批次 ${
      Math.floor(startIndex / batchSize) + 1
    }，用户索引 ${startIndex} 到 ${endIndex - 1}`
  );

  const tutorProfiles = [];
  const skippedIds = [];

  // 查找已存在的教师信息
  const existingTutorIds = new Set();
  const customIds = currentBatch.map((user) => user.customId);
  const existingTutors = await TutorProfile.find({
    tutorId: { $in: customIds },
  }).lean();

  existingTutors.forEach((tutor) => {
    existingTutorIds.add(tutor.tutorId);
  });

  // 为每个用户生成教师信息
  for (let i = 0; i < currentBatch.length; i++) {
    const user = currentBatch[i];
    const globalIndex = startIndex + i;

    // 检查是否已存在教师信息
    if (existingTutorIds.has(user.customId)) {
      skippedIds.push(user.customId);
      continue;
    }

    // 生成教师信息 - 直接使用user对象，确保tutorId与user.customId一致
    const tutorInfo = generateTutorProfile(user);
    tutorProfiles.push(tutorInfo);
  }

  // 批量插入教师信息
  let insertedCount = 0;
  if (tutorProfiles.length > 0) {
    try {
      const result = await TutorProfile.insertMany(tutorProfiles, {
        ordered: false,
      });
      insertedCount = result.length;
      console.log(`成功插入 ${insertedCount} 个教师信息`);
    } catch (error) {
      if (error.insertedDocs) {
        insertedCount = error.insertedDocs.length;
        console.log(
          `部分成功: 插入了 ${insertedCount}/${tutorProfiles.length} 个教师信息`
        );

        // 输出错误详情
        if (error.writeErrors && error.writeErrors.length > 0) {
          console.error(`错误数量: ${error.writeErrors.length}`);
          console.error('错误详情示例:');
          for (let e = 0; e < Math.min(5, error.writeErrors.length); e++) {
            try {
              const errorDetail = error.writeErrors[e];
              console.error(
                `- 错误 ${e + 1}: ${
                  errorDetail.err
                    ? errorDetail.err.errmsg || errorDetail.err.code
                    : JSON.stringify(errorDetail)
                }`
              );
              if (errorDetail.op) {
                console.error(`  教师ID: ${errorDetail.op.tutorId}`);
                console.error(`  用户ID: ${errorDetail.op.userId}`);
              }
            } catch (logError) {
              console.error(`- 无法解析错误 ${e + 1}: ${logError.message}`);
            }
          }
        }
      } else {
        console.error(`批量插入失败:`, error.message);
        throw error;
      }
    }
  }

  return {
    processed: currentBatch.length,
    inserted: insertedCount,
    skipped: skippedIds.length,
    skippedIds,
  };
}

// 主函数：为所有教师用户生成教师信息
async function generateTutors() {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('MongoDB 连接成功');

    // 查找所有角色为'tutor'的用户
    const tutorUsers = await User.find({ role: 'teacher' }).lean();
    console.log(`找到 ${tutorUsers.length} 个教师用户`);

    let createdCount = 0;
    let skippedCount = 0;

    // 批量生成教师信息
    for (let i = 0; i < tutorUsers.length; i += BATCH_SIZE) {
      const batchResult = await generateTutorsBatch(tutorUsers, i, BATCH_SIZE);
      createdCount += batchResult.inserted;
      skippedCount += batchResult.skipped;
    }

    console.log('=== 生成完成 ===');
    console.log(`总计: ${tutorUsers.length} 个教师用户`);
    console.log(`创建: ${createdCount} 个教师信息`);
    console.log(`跳过: ${skippedCount} 个已有教师信息的用户`);
  } catch (error) {
    console.error('生成教师信息时出错:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('数据库连接已关闭');
  }
}

// 执行脚本
generateTutors();
