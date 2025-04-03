const mongoose = require('mongoose');
const { faker } = require('@faker-js/faker/locale/zh_CN');
const TutoringRequest = require('../models/TutoringRequest');
const Parent = require('../models/Parent');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

// 解析命令行参数
const argv = yargs(hideBin(process.argv))
  .option('count', {
    alias: 'c',
    description: '要生成的家教请求总数',
    type: 'number',
    default: 500,
  })
  .option('batchSize', {
    alias: 'b',
    description: '每批处理的数量',
    type: 'number',
    default: 50,
  })
  .option('clear', {
    description: '在生成前清空现有数据',
    type: 'boolean',
    default: false,
  })
  .option('maxPerParent', {
    alias: 'm',
    description: '每个家长最多生成的请求数',
    type: 'number',
    default: 3,
  })
  .option('uri', {
    alias: 'u',
    description: 'MongoDB连接URI',
    type: 'string',
    default: 'mongodb://localhost:27017/smarttutor',
  })
  .help()
  .alias('help', 'h').argv;

// 数据库连接配置
const MONGO_URI =
  argv.uri || process.env.MONGODB_URI || 'mongodb://localhost:27017/smarttutor';

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

// 生成科目信息
function generateSubjects() {
  const subjects = ['数学', '语文', '英语', '物理', '化学', '生物'];
  const selectedSubjects = faker.helpers.arrayElements(subjects, {
    min: 1,
    max: 3,
  });

  return selectedSubjects.map((subject) => ({
    name: subject,
    currentScore: faker.number.int({ min: 60, max: 85 }).toString(),
    targetScore: faker.number.int({ min: 85, max: 100 }).toString(),
    difficulty: faker.helpers.arrayElement(['简单', '中等', '困难']),
  }));
}

// 全局计数器和时间戳基准，用于生成唯一ID
let globalCounter = 0;
const baseTimestamp = Math.floor(Date.now() / 1000);

// 生成唯一的请求ID
function generateUniqueRequestId(parentId) {
  // 使用基础时间戳加上全局计数器作为秒数部分
  const timestamp = (
    baseTimestamp + Math.floor(globalCounter / 100)
  ).toString();
  // 使用全局计数器的后两位作为毫秒部分
  const millisPart = (globalCounter % 100).toString().padStart(2, '0');
  // 增加全局计数器
  globalCounter++;

  // 生成最终ID
  return `REQUEST_${parentId}_${timestamp}${millisPart}`;
}

// 检查ID是否已存在
async function isRequestIdExists(requestId) {
  const count = await TutoringRequest.countDocuments({ requestId });
  return count > 0;
}

// 生成家教需求请求
async function generateTutoringRequest(parent, existingIds = new Set()) {
  // 确保家长有孩子数据
  if (!parent.children || parent.children.length === 0) {
    console.log(`家长 ${parent.parentId} 没有孩子信息，跳过`);
    return null;
  }

  // 随机选择一个孩子
  const child = faker.helpers.arrayElement(parent.children);
  const city =
    parent.location?.city || faker.helpers.arrayElement(CHINESE_CITIES);
  const district =
    parent.location?.district ||
    faker.helpers.arrayElement(DISTRICTS[city] || DISTRICTS['北京']);
  const coordinates =
    parent.location?.coordinates?.coordinates || generateChinaCoordinates(city);

  // 生成唯一请求ID并确保不重复
  let requestId;
  let attempts = 0;
  const maxAttempts = 5;

  do {
    requestId = generateUniqueRequestId(parent.parentId);
    attempts++;
    // 如果尝试次数过多，添加随机字符以避免死循环
    if (attempts > maxAttempts) {
      requestId += faker.string.alphanumeric(4);
    }
  } while (existingIds.has(requestId) && attempts < maxAttempts * 2);

  // 将新ID添加到已存在ID集合中
  existingIds.add(requestId);

  return {
    requestId,
    status: faker.helpers.arrayElement(['published', 'pending', 'rejected']),
    reviewedAt: faker.datatype.boolean(0.7) ? faker.date.recent() : null,
    reviewedBy: faker.datatype.boolean(0.7)
      ? 'ADMIN_' + faker.string.alphanumeric(8)
      : null,
    reviewNote: faker.datatype.boolean(0.3) ? faker.lorem.sentence() : null,
    reports: faker.datatype.boolean(0.1)
      ? [
          {
            reportedBy: 'USER_' + faker.string.alphanumeric(8),
            reason: faker.lorem.sentence(),
            createdAt: faker.date.recent(),
          },
        ]
      : [],
    parentId: parent.parentId,
    childId: child.childId, // 确保使用正确的childId
    grade: child.grade,
    location: {
      address: `${city}${district}${faker.location.streetAddress()}`,
      district,
      city,
      coordinates: {
        type: 'Point',
        coordinates,
      },
    },
    subjects: generateSubjects(),
    preferences: {
      teachingLocation: faker.helpers.arrayElement(['家里', '教师家', '其他']),
      teacherGender: faker.helpers.arrayElement(['男', '女', '不限']),
      teachingStyle: faker.helpers.arrayElements(
        [
          '互动式教学',
          '启发式教学',
          '项目式学习',
          '翻转课堂',
          '传统讲授',
          '个性化辅导',
        ],
        { min: 1, max: 3 }
      ),
      budget: {
        min: faker.number.int({ min: 100, max: 200 }),
        max: faker.number.int({ min: 250, max: 400 }),
        period: faker.helpers.arrayElement(['per_hour', 'per_session']),
      },
    },
    createdAt: faker.date.recent(30),
    updatedAt: faker.date.recent(10),
  };
}

// 清空现有数据
async function clearExistingData() {
  console.log('正在清空现有家教请求数据...');
  const result = await TutoringRequest.deleteMany({});
  console.log(`已删除 ${result.deletedCount} 条家教请求记录`);
}

// 批量处理函数
async function processBatch(
  parents,
  batchIndex,
  batchSize,
  totalRequests,
  maxPerParent
) {
  const startIndex = batchIndex * batchSize;
  const endIndex = Math.min(startIndex + batchSize, totalRequests);
  const batchSize_actual = endIndex - startIndex;

  console.log(
    `\n处理批次 ${
      batchIndex + 1
    }，生成 ${batchSize_actual} 个请求（总进度: ${startIndex}/${totalRequests}）`
  );

  // 获取现有请求ID以避免冲突
  const existingRequestIds = new Set();
  const existingRequests = await TutoringRequest.find({}, 'requestId');
  existingRequests.forEach((req) => existingRequestIds.add(req.requestId));

  // 创建请求数据
  const requestsToCreate = [];
  let currentCount = 0;
  let parentIndex = 0;

  const startTime = Date.now();

  while (currentCount < batchSize_actual && parentIndex < parents.length) {
    const parent = parents[parentIndex];

    // 为每个家长生成1到maxPerParent个请求
    const requestCount = faker.number.int({ min: 1, max: maxPerParent });

    for (let i = 0; i < requestCount && currentCount < batchSize_actual; i++) {
      try {
        const requestData = await generateTutoringRequest(
          parent,
          existingRequestIds
        );
        if (requestData) {
          requestsToCreate.push(requestData);
          currentCount++;

          // 显示进度
          if (currentCount % 10 === 0 || currentCount === batchSize_actual) {
            process.stdout.write(
              `\r已生成: ${currentCount}/${batchSize_actual}`
            );
          }
        }
      } catch (error) {
        console.error(
          `\n生成请求数据时出错 (家长 ${parent.parentId}): ${error.message}`
        );
      }
    }

    parentIndex++;

    // 如果已经遍历完所有家长但还没生成足够的请求，则重新开始
    if (parentIndex >= parents.length && currentCount < batchSize_actual) {
      parentIndex = 0;
    }
  }

  console.log(`\n批次 ${batchIndex + 1} 数据生成完成，准备插入数据库...`);

  // 批量插入数据库
  try {
    if (requestsToCreate.length > 0) {
      await TutoringRequest.insertMany(requestsToCreate, { ordered: false });
      const endTime = Date.now();
      console.log(
        `批次 ${batchIndex + 1} 成功插入 ${requestsToCreate.length} 条记录`
      );
      console.log(
        `批次处理耗时: ${((endTime - startTime) / 1000).toFixed(2)}秒`
      );
      return requestsToCreate.length;
    } else {
      console.log(`批次 ${batchIndex + 1} 没有生成有效数据`);
      return 0;
    }
  } catch (error) {
    // 处理批量插入错误，尝试提取成功插入的数量
    if (error.writeErrors) {
      const successCount = requestsToCreate.length - error.writeErrors.length;
      console.error(
        `\n批次 ${batchIndex + 1} 部分插入成功: ${successCount}/${
          requestsToCreate.length
        }`
      );
      console.error(
        `错误数量: ${error.writeErrors.length}，第一个错误: ${
          error.writeErrors[0]?.errmsg || '未知错误'
        }`
      );
      return successCount;
    } else {
      console.error(`\n批次 ${batchIndex + 1} 插入失败: ${error.message}`);
      return 0;
    }
  }
}

// 主函数：批量生成家教需求请求
async function generateTutoringRequests() {
  console.log('===== 家教需求请求批量生成脚本 =====');
  console.log(`目标生成数量: ${argv.count}`);
  console.log(`批处理大小: ${argv.batchSize}`);
  console.log(`每个家长最多请求数: ${argv.maxPerParent}`);

  const startTime = Date.now();

  try {
    // 连接数据库
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB 连接成功');

    // 如果需要，清空现有数据
    if (argv.clear) {
      await clearExistingData();
    }

    // 查找所有家长用户，并确保包含children字段
    const parents = await Parent.find().select('+children').lean();
    console.log(`找到 ${parents.length} 个家长用户`);

    if (parents.length === 0) {
      console.error('没有找到家长用户，请先生成家长数据');
      return;
    }

    // 计算需要处理的批次数
    const totalBatches = Math.ceil(argv.count / argv.batchSize);
    console.log(`将分 ${totalBatches} 个批次处理`);

    let totalCreated = 0;

    // 按批次处理
    for (let i = 0; i < totalBatches; i++) {
      const createdCount = await processBatch(
        parents,
        i,
        argv.batchSize,
        argv.count,
        argv.maxPerParent
      );
      totalCreated += createdCount;
    }

    // 打印最终统计信息
    const endTime = Date.now();
    const totalTimeSeconds = (endTime - startTime) / 1000;

    console.log('\n===== 生成完成 =====');
    console.log(`总计生成: ${totalCreated} 个家教需求请求`);
    console.log(`总耗时: ${totalTimeSeconds.toFixed(2)}秒`);
    console.log(
      `平均速度: ${(totalCreated / totalTimeSeconds).toFixed(2)} 条/秒`
    );

    // 验证生成的数据
    const actualCount = await TutoringRequest.countDocuments();
    console.log(`数据库中实际家教请求数量: ${actualCount}`);
  } catch (error) {
    console.error('生成家教需求请求时出错:', error);
  } finally {
    await mongoose.disconnect();
    console.log('数据库连接已关闭');
  }
}

// 执行脚本
generateTutoringRequests();
