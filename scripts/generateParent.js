/**
 * 生成家长数据的脚本
 * 该脚本会根据现有用户生成家长档案
 * 不会清除现有数据，只会添加新记录
 */
const mongoose = require('mongoose');
const { faker } = require('@faker-js/faker/locale/zh_CN');
const Parent = require('../models/Parent');
const User = require('../models/User');

// 数据库连接配置
const MONGO_URI = 
  process.env.MONGODB_URI || 'mongodb://localhost:27017/smarttutor';

// 配置参数
const BATCH_SIZE = 50; // 每批处理50个家长数据

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
  南京: ['鼓楼区', '玄武区', '秦淮区', '建邺区', '雨花台区'],
  西安: ['新城区', '碑林区', '莲湖区', '雁塔区', '未央区'],
};

// 科目列表
const SUBJECTS = [
  '语文', '数学', '英语', '物理', '化学', '生物', 
  '历史', '地理', '政治'
];

// 年级列表
const GRADES = [
  '小学一年级', '小学二年级', '小学三年级', '小学四年级', '小学五年级', '小学六年级',
  '初中一年级', '初中二年级', '初中三年级',
  '高中一年级', '高中二年级', '高中三年级'
];


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

// 生成孩子信息
function generateChildInfo(parentId, index) {
  // 从parentId中提取时间戳部分
  const timestampPart = parentId.replace('PARENT_', '');
  
  // 生成childId，格式为 CHILD_时间戳_序号(01, 02等)
  const childIndex = (index + 1).toString().padStart(2, '0');
  const childId = `CHILD_${timestampPart}_${childIndex}`;
  
  // 随机选择年级
  const grade = faker.helpers.arrayElement(GRADES);
  
  // 确定科目数量，小学生科目少，高中生科目多
  let minSubjects = 1;
  let maxSubjects = 3;
  
  if (grade.includes('小学')) {
    minSubjects = 1;
    maxSubjects = 3;
  } else if (grade.includes('初中')) {
    minSubjects = 2;
    maxSubjects = 4;
  } else {
    minSubjects = 3;
    maxSubjects = 5;
  }
  
  // 随机选择适合年级的科目
  let availableSubjects = [...SUBJECTS];
  
  // 根据年级筛选科目
  if (grade.includes('小学')) {
    // 小学没有物理化学等科目
    availableSubjects = availableSubjects.filter(s => 
      !['物理', '化学', '生物', '政治'].includes(s)
    );
  } else if (grade.includes('初中一年级')) {
    // 初一没有化学
    availableSubjects = availableSubjects.filter(s => s !== '化学');
  }
  
  // 随机选择科目
  const selectedSubjects = faker.helpers.arrayElements(
    availableSubjects, 
    { min: minSubjects, max: maxSubjects }
  );
  
  // 为每个科目生成详情
  const subjects = selectedSubjects.map(name => {
    // 生成当前分数和目标分数
    const baseScore = faker.number.int({ min: 50, max: 85 });
    const targetScore = Math.min(100, baseScore + faker.number.int({ min: 5, max: 15 }));
    
    return {
      name,
      currentScore: `${baseScore}分`,
      targetScore: `${targetScore}分`,
      difficulty: faker.helpers.arrayElement(['简单', '中等', '困难'])
    };
  });
  
  return {
    childId,
    nickname: faker.person.lastName() + faker.helpers.arrayElement(['小朋友', '同学']),
    grade,
    subjects
  };
}

// 生成家长信息
function generateParentProfile(user) {
  const city = faker.helpers.arrayElement(CHINESE_CITIES);
  const district = faker.helpers.arrayElement(DISTRICTS[city]);
  const coordinates = generateChinaCoordinates(city);
  
  // 直接使用用户的customId作为parentId，确保一致性
  const parentId = user.customId;
  
  // 生成1-3个孩子
  const childrenCount = faker.number.int({ min: 1, max: 3 });
  const children = Array.from({ length: childrenCount }, (_, i) => 
    generateChildInfo(parentId, i)
  );
  
  // 生成随机预算范围 - 根据孩子年级和科目设置适当的预算
  let baseBudget = 150; // 基础预算
  
  // 根据孩子年级调整预算
  if (children.some(child => child.grade.includes('高中'))) {
    baseBudget += 70; // 高中学生预算更高
  } else if (children.some(child => child.grade.includes('初中'))) {
    baseBudget += 40; // 初中学生预算次之
  }
  
  // 根据科目调整预算
  const allSubjects = children.flatMap(child => child.subjects.map(s => s.name));
  if (allSubjects.some(subject => subject === '数学' || subject === '物理' || subject === '化学')) {
    baseBudget += 30; // 理科辅导费用高
  }
  
  const minBudget = baseBudget;
  const maxBudget = baseBudget + faker.number.int({ min: 50, max: 150 });
  
  // 根据孩子学习情况生成偏好设置
  const hasWeakStudents = children.some(child => 
    child.subjects.some(s => parseInt(s.currentScore) < 70)
  );
  
  // 教学风格偏好
  const teachingStylePreferences = [];
  if (hasWeakStudents) {
    teachingStylePreferences.push(...faker.helpers.arrayElements(
      ['循序渐进', '条理清晰', '耐心细致', '基础扎实'],
      { min: 2, max: 3 }
    ));
  } else {
    teachingStylePreferences.push(...faker.helpers.arrayElements(
      ['思维拓展', '题型训练', '解题思路', '快速提升', '难点突破'],
      { min: 2, max: 3 }
    ));
  }
  
  // 根据孩子年级确定教学频率和时长
  let teachingFrequency, teachingDuration, teacherGenderPreference;
  
  if (children.some(child => child.grade.includes('高中'))) {
    teachingFrequency = faker.helpers.arrayElement(['每周三次', '每周两次', '周末全天']);
    teachingDuration = faker.helpers.arrayElement(['120分钟', '150分钟', '180分钟']);
  } else if (children.some(child => child.grade.includes('初中'))) {
    teachingFrequency = faker.helpers.arrayElement(['每周两次', '每周三次', '周末带工作日']);
    teachingDuration = faker.helpers.arrayElement(['90分钟', '120分钟']);
  } else {
    teachingFrequency = faker.helpers.arrayElement(['每周一次', '每周两次', '灵活安排']);
    teachingDuration = faker.helpers.arrayElement(['60分钟', '90分钟']);
  }
  
  // 自定义加权随机选择函数（替代faker.helpers.weighted）
  function weightedRandom(options) {
    const weights = Object.values(options);
    const keys = Object.keys(options);
    
    // 计算权重和
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
    
    // 生成一个0到1之间的随机数
    const random = Math.random() * totalWeight;
    
    // 根据权重选择
    let weightSum = 0;
    for (let i = 0; i < weights.length; i++) {
      weightSum += weights[i];
      if (random < weightSum) {
        return keys[i];
      }
    }
    
    // 默认返回最后一个选项
    return keys[keys.length - 1];
  }
  
  // 教师性别偏好 - 小孩子更可能偏好女教师
  if (children.some(child => child.grade.includes('小学'))) {
    teacherGenderPreference = weightedRandom({ '女': 0.6, '男': 0.15, '不限': 0.25 });
  } else if (children.some(child => child.grade.includes('高中'))) {
    teacherGenderPreference = faker.helpers.arrayElement(['男', '女', '不限']);
  } else {
    teacherGenderPreference = faker.helpers.arrayElement(['不限', '男', '女']);
  }
  
  // 时间安排 - 100%的家长都要求周末上课
  let availableTimes = [];
  
  // 确保所有家长都选择周末时间
  availableTimes.push(...faker.helpers.arrayElements(
    ['周六上午', '周六下午', '周日上午', '周日下午'],
    { min: 2, max: 4 } // 增加可能选择的周末时段数量
  ));
  

  return {
    parentId,
    userId: user._id,
    nickname: user.name || faker.person.lastName() + faker.helpers.arrayElement(['爸爸', '妈妈', '家长']),
    location: {
      district,
      city,
      coordinates: {
        type: 'Point',
        coordinates, // [经度, 纬度] 数组
      },
    },
    children,
    preferences: {
      teachingFrequency,
      teachingDuration,
      teacherGenderPreference,
      teachingMethods: faker.helpers.arrayElements(
        ['一对一授课', '解题指导', '知识讲解', '思维拓展', '实验教学'],
        { min: 2, max: 3 }
      ),
      teachingStyle: teachingStylePreferences,
      teachingLocations: faker.helpers.arrayElements(
        ['学生家中', '教师住所'],
        { min: 1, max: 2 }
      ),
      budgetRange: {
        min: minBudget,
        max: maxBudget,
        period: faker.helpers.arrayElement(['per_hour', 'per_session'])
      },
      urgency: faker.helpers.arrayElement(['急需', '一般', '长期计划']),
    },
    contact: {
      phone: faker.phone.number(),
      email: faker.internet.email(),
      preferredContactMethod: faker.helpers.arrayElement(['微信', '电话', '短信', '邮箱'])
    },
    additionalInfo: {
      occupation: faker.person.jobTitle(),
      educationLevel: faker.helpers.arrayElement(['985', '211', '普通本科']),
      availableTimes,
      expectations: faker.helpers.arrayElements(
        ['提高成绩', '培养兴趣', '习惯养成', '解决难点', '简单附近'],
        { min: 2, max: 3 }
      ),
      // 注释信息 - 更真实的家长要求
      specialNotes: hasWeakStudents ? 
        '孩子学习有点吃力，希望老师能够有耐心，带动孩子的学习兴趣。' : 
        faker.helpers.arrayElement([
          '希望能找到质量高的老师，帮助孩子提高成绩。',
          '对老师的专业素养要求较高，最好是重点院校毕业。',
          '工作比较忙，希望能找到负责任的老师帮助监督孩子学习。',
          '全家对孩子要求比较高，希望能以实际提分效果为目标。'
        ])
    },
  };
}

// 批量生成家长数据
async function generateParentsBatch(parentUsers, startIndex, batchSize) {
  const endIndex = Math.min(startIndex + batchSize, parentUsers.length);
  const currentBatch = parentUsers.slice(startIndex, endIndex);

  console.log(
    `处理批次 ${
      Math.floor(startIndex / batchSize) + 1
    }，用户索引 ${startIndex} 到 ${endIndex - 1}`
  );

  const parentProfiles = [];
  const skippedIds = [];

  // 查找已存在的家长信息
  const existingParentIds = new Set();
  const customIds = currentBatch.map((user) => user.customId);
  const existingParents = await Parent.find({
    parentId: { $in: customIds },
  }).lean();

  existingParents.forEach((parent) => {
    existingParentIds.add(parent.parentId);
  });

  // 为每个用户生成家长信息
  for (let i = 0; i < currentBatch.length; i++) {
    const user = currentBatch[i];
    const globalIndex = startIndex + i;

    // 检查是否已存在家长信息
    if (existingParentIds.has(user.customId)) {
      skippedIds.push(user.customId);
      continue;
    }

    // 生成家长信息 - 直接使用user对象，确保parentId与user.customId一致
    const parentInfo = generateParentProfile(user);
    parentProfiles.push(parentInfo);
  }

  // 批量插入家长信息
  let insertedCount = 0;
  if (parentProfiles.length > 0) {
    try {
      const result = await Parent.insertMany(parentProfiles, {
        ordered: false,
      });
      insertedCount = result.length;
      console.log(`成功插入 ${insertedCount} 个家长信息`);
    } catch (error) {
      if (error.insertedDocs) {
        insertedCount = error.insertedDocs.length;
        console.log(
          `部分成功: 插入了 ${insertedCount}/${parentProfiles.length} 个家长信息`
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
                console.error(`  家长ID: ${errorDetail.op.parentId}`);
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

// 主函数：为所有家长用户生成家长信息
async function generateParents() {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('MongoDB 连接成功');

    // 查找所有角色为'parent'的用户
    const parentUsers = await User.find({ role: 'parent' }).lean();
    console.log(`找到 ${parentUsers.length} 个家长用户`);

    let createdCount = 0;
    let skippedCount = 0;

    // 批量生成家长信息
    for (let i = 0; i < parentUsers.length; i += BATCH_SIZE) {
      const batchResult = await generateParentsBatch(parentUsers, i, BATCH_SIZE);
      createdCount += batchResult.inserted;
      skippedCount += batchResult.skipped;
    }

    console.log('=== 生成完成 ===');
    console.log(`总计: ${parentUsers.length} 个家长用户`);
    console.log(`创建: ${createdCount} 个家长信息`);
    console.log(`跳过: ${skippedCount} 个已有家长信息的用户`);
  } catch (error) {
    console.error('生成家长信息时出错:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('数据库连接已关闭');
  }
}

// 执行脚本
generateParents();
