/**
 * 家教请求数据丰富脚本
 * 为现有的家教请求数据添加额外信息，而不会清空现有数据
 * 
 * 使用方法:
 * node enrichTutoringRequests.js --field=preferences --batchSize=20
 * 
 * 参数说明:
 * --field: 要更新的字段 (可选值: subjects, preferences, location, all)
 * --query: MongoDB查询条件，JSON格式 (可选，默认处理所有缺少指定字段的文档)
 * --batchSize: 每批处理的记录数 (默认: 20)
 * --dryRun: 仅模拟执行而不实际修改数据 (默认: false)
 */

const mongoose = require('mongoose');
const { faker } = require('@faker-js/faker/locale/zh_CN');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

// 导入模型
const TutoringRequest = require('../models/TutoringRequest');
const Parent = require('../models/Parent');

// 解析命令行参数
const argv = yargs(hideBin(process.argv))
  .option('field', {
    alias: 'f',
    description: '要更新的字段',
    type: 'string',
    choices: ['subjects', 'preferences', 'location', 'all'],
    default: 'all'
  })
  .option('query', {
    alias: 'q',
    description: 'MongoDB查询条件，JSON格式',
    type: 'string',
    default: '{}'
  })
  .option('batchSize', {
    alias: 'b',
    description: '每批处理的记录数',
    type: 'number',
    default: 20
  })
  .option('dryRun', {
    alias: 'd',
    description: '仅模拟执行而不实际修改数据',
    type: 'boolean',
    default: false
  })
  .option('uri', {
    alias: 'u',
    description: 'MongoDB连接URI',
    type: 'string',
    default: 'mongodb://localhost:27017/smarttutor'
  })
  .help()
  .alias('help', 'h')
  .argv;

// 数据库连接
const MONGODB_URI = argv.uri || process.env.MONGODB_URI || 'mongodb://localhost:27017/smarttutor';
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

// 科目列表
const SUBJECTS = [
  '语文', '数学', '英语', '物理', '化学', '生物', 
  '历史', '地理', '政治'
];

// 年级列表
const GRADES = [

  '一年级', '二年级', '三年级', '四年级', '五年级', '六年级',
  '初中一年级', '初中二年级', '初中三年级',
  '高中一年级', '高中二年级', '高中三年级'
];

// 生成地址信息
const generateLocation = () => {
  const city = faker.helpers.arrayElement(CHINESE_CITIES);
  const district = faker.helpers.arrayElement(DISTRICTS[city] || ['未知区']);
  const address = `${faker.location.streetAddress()}`;
  
  return {
    city,
    district,
    address,
    coordinates: {
      latitude: parseFloat(faker.location.latitude()),
      longitude: parseFloat(faker.location.longitude())
    }
  };
};

// 生成科目信息
const generateSubjects = (count = faker.number.int({ min: 1, max: 3 })) => {
  const subjects = [];
  const selectedSubjects = new Set();
  
  while (subjects.length < count) {
    const subject = faker.helpers.arrayElement(SUBJECTS);
    
    if (!selectedSubjects.has(subject)) {
      selectedSubjects.add(subject);
      
      subjects.push({
        name: subject,
        currentScore: faker.number.int({ min: 60, max: 95 }),
        targetScore: faker.number.int({ min: 85, max: 100 }),
        difficulty: faker.helpers.arrayElement(['简单', '中等', '困难']),
        notes: faker.helpers.maybe(() => faker.lorem.sentence(), { probability: 0.7 })
      });
    }
  }
  
  return subjects;
};

// 生成偏好信息
const generatePreferences = () => {
  // 生成预算信息
  const budgetType = faker.helpers.arrayElement(['hourly', 'monthly']);
  const budgetAmount = budgetType === 'hourly' 
    ? faker.number.int({ min: 100, max: 500 }) 
    : faker.number.int({ min: 1000, max: 5000 });
  
  return {
    budget: {
      type: budgetType,
      amount: budgetAmount,
      currency: 'CNY',
      negotiable: faker.datatype.boolean()
    },
    teachingFrequency: faker.helpers.arrayElement(['每周一次', '每周两次', '每周三次', '每天']),
    teachingDuration: faker.helpers.arrayElement(['60分钟', '90分钟', '120分钟']),
    teachingLocation: faker.helpers.arrayElement(['学生家', '教师家', '线上', '公共场所']),
    teacherGender: faker.helpers.arrayElement(['男', '女', '无偏好']),
    teachingStyle: faker.helpers.arrayElements(
      ['有趣', '严格', '耐心', '互动', '启发式', '循序渐进'], 
      faker.number.int({ min: 1, max: 3 })
    ),
    additionalRequirements: faker.helpers.maybe(() => faker.lorem.paragraph(), { probability: 0.4 })
  };
};

// 更新家教请求的科目信息
const updateSubjects = async (batchSize, query, dryRun) => {
  console.log('开始更新家教请求的科目信息...');
  
  try {
    // 构建查询条件：查找没有科目或科目为空数组的文档
    let queryObj = JSON.parse(query);
    if (Object.keys(queryObj).length === 0) {
      queryObj = { 
        $or: [
          { subjects: { $exists: false } },
          { subjects: { $size: 0 } },
          { subjects: null }
        ]
      };
    }
    
    // 获取符合条件的文档总数
    const totalCount = await TutoringRequest.countDocuments(queryObj);
    console.log(`找到 ${totalCount} 个需要更新科目信息的家教请求`);
    
    if (totalCount === 0) {
      console.log('没有需要更新的文档，操作中止');
      return;
    }
    
    if (dryRun) {
      console.log('这是一次演习，不会实际修改数据');
      console.log(`将为 ${totalCount} 个家教请求生成科目信息`);
      return;
    }
    
    // 使用批处理方式处理数据
    let processedCount = 0;
    
    for (let skip = 0; skip < totalCount; skip += batchSize) {
      const documents = await TutoringRequest.find(queryObj).skip(skip).limit(batchSize);
      
      const bulkOps = documents.map(doc => ({
        updateOne: {
          filter: { _id: doc._id },
          update: { $set: { subjects: generateSubjects() } },
          upsert: false
        }
      }));
      
      const result = await TutoringRequest.bulkWrite(bulkOps);
      processedCount += result.modifiedCount;
      
      console.log(`处理进度: ${processedCount}/${totalCount} (${Math.round(processedCount/totalCount*100)}%)`);
    }
    
    console.log(`操作完成! 成功更新 ${processedCount} 个家教请求的科目信息`);
    
  } catch (error) {
    console.error('更新科目信息时出错:', error);
    throw error;
  }
};

// 更新家教请求的偏好信息
const updatePreferences = async (batchSize, query, dryRun) => {
  console.log('开始更新家教请求的偏好信息...');
  
  try {
    // 构建查询条件：查找没有偏好或偏好为空对象的文档
    let queryObj = JSON.parse(query);
    if (Object.keys(queryObj).length === 0) {
      queryObj = { 
        $or: [
          { preferences: { $exists: false } },
          { preferences: null },
          { preferences: {} }
        ]
      };
    }
    
    // 获取符合条件的文档总数
    const totalCount = await TutoringRequest.countDocuments(queryObj);
    console.log(`找到 ${totalCount} 个需要更新偏好信息的家教请求`);
    
    if (totalCount === 0) {
      console.log('没有需要更新的文档，操作中止');
      return;
    }
    
    if (dryRun) {
      console.log('这是一次演习，不会实际修改数据');
      console.log(`将为 ${totalCount} 个家教请求生成偏好信息`);
      return;
    }
    
    // 使用批处理方式处理数据
    let processedCount = 0;
    
    for (let skip = 0; skip < totalCount; skip += batchSize) {
      const documents = await TutoringRequest.find(queryObj).skip(skip).limit(batchSize);
      
      const bulkOps = documents.map(doc => ({
        updateOne: {
          filter: { _id: doc._id },
          update: { $set: { preferences: generatePreferences() } },
          upsert: false
        }
      }));
      
      const result = await TutoringRequest.bulkWrite(bulkOps);
      processedCount += result.modifiedCount;
      
      console.log(`处理进度: ${processedCount}/${totalCount} (${Math.round(processedCount/totalCount*100)}%)`);
    }
    
    console.log(`操作完成! 成功更新 ${processedCount} 个家教请求的偏好信息`);
    
  } catch (error) {
    console.error('更新偏好信息时出错:', error);
    throw error;
  }
};

// 更新家教请求的地址信息
const updateLocation = async (batchSize, query, dryRun) => {
  console.log('开始更新家教请求的地址信息...');
  
  try {
    // 构建查询条件：查找没有地址或地址信息不完整的文档
    let queryObj = JSON.parse(query);
    if (Object.keys(queryObj).length === 0) {
      queryObj = { 
        $or: [
          { location: { $exists: false } },
          { location: null },
          { 'location.city': { $exists: false } },
          { 'location.district': { $exists: false } },
          { 'location.address': { $exists: false } }
        ]
      };
    }
    
    // 获取符合条件的文档总数
    const totalCount = await TutoringRequest.countDocuments(queryObj);
    console.log(`找到 ${totalCount} 个需要更新地址信息的家教请求`);
    
    if (totalCount === 0) {
      console.log('没有需要更新的文档，操作中止');
      return;
    }
    
    if (dryRun) {
      console.log('这是一次演习，不会实际修改数据');
      console.log(`将为 ${totalCount} 个家教请求生成地址信息`);
      return;
    }
    
    // 使用批处理方式处理数据
    let processedCount = 0;
    
    for (let skip = 0; skip < totalCount; skip += batchSize) {
      const documents = await TutoringRequest.find(queryObj).skip(skip).limit(batchSize);
      
      const bulkOps = documents.map(doc => ({
        updateOne: {
          filter: { _id: doc._id },
          update: { $set: { location: generateLocation() } },
          upsert: false
        }
      }));
      
      const result = await TutoringRequest.bulkWrite(bulkOps);
      processedCount += result.modifiedCount;
      
      console.log(`处理进度: ${processedCount}/${totalCount} (${Math.round(processedCount/totalCount*100)}%)`);
    }
    
    console.log(`操作完成! 成功更新 ${processedCount} 个家教请求的地址信息`);
    
  } catch (error) {
    console.error('更新地址信息时出错:', error);
    throw error;
  }
};

// 主函数
const main = async () => {
  try {
    // 连接到数据库
    console.log('正在连接到数据库...');
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('数据库连接成功!');

    // 根据指定的字段执行相应的更新操作
    if (argv.field === 'all' || argv.field === 'subjects') {
      await updateSubjects(argv.batchSize, argv.query, argv.dryRun);
    }
    
    if (argv.field === 'all' || argv.field === 'preferences') {
      await updatePreferences(argv.batchSize, argv.query, argv.dryRun);
    }
    
    if (argv.field === 'all' || argv.field === 'location') {
      await updateLocation(argv.batchSize, argv.query, argv.dryRun);
    }

    console.log('所有操作完成，正在关闭数据库连接...');
    await mongoose.connection.close();
    console.log('数据库连接已关闭');
    
  } catch (error) {
    console.error('执行过程中出错:', error);
    
    // 尝试关闭数据库连接
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      console.log('由于错误，数据库连接已强制关闭');
    }
    
    process.exit(1);
  }
};

// 执行主函数
main();
