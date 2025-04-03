/**
 * 生成匹配数据脚本
 * 批量生成家长与教师之间的匹配记录
 * 
 * 使用方法:
 * node generateMatches.js --count=50 --batchSize=10 --clear=false
 * 
 * 参数说明:
 * --count: 要生成的匹配记录数量 (默认: 50)
 * --batchSize: 每批处理的记录数 (默认: 10)
 * --clear: 是否清空现有匹配数据 (默认: false)
 */

const mongoose = require('mongoose');
const { faker } = require('@faker-js/faker/locale/zh_CN');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

// 导入模型
const Match = require('../models/Match');
const Parent = require('../models/Parent');
const TutorProfile = require('../models/TutorProfile');
const TutoringRequest = require('../models/TutoringRequest');

// 解析命令行参数
const argv = yargs(hideBin(process.argv))
  .option('count', {
    alias: 'c',
    description: '要生成的匹配记录数量',
    type: 'number',
    default: 50
  })
  .option('batchSize', {
    alias: 'b',
    description: '每批处理的记录数',
    type: 'number',
    default: 10
  })
  .option('clear', {
    description: '是否清空现有匹配数据',
    type: 'boolean',
    default: false
  })
  .help()
  .alias('help', 'h')
  .argv;

// 数据库连接
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/smarttutor';

// 生成唯一的匹配ID
const generateUniqueMatchId = async (parentId, tutorId, index) => {
  const timestamp = new Date().toISOString().replace(/[-:T.Z]/g, '').substring(0, 14);
  const parentIdShort = parentId.replace('PARENT_', '').substring(0, 8);
  const tutorIdShort = tutorId.replace('TUTOR_', '').substring(0, 8);
  const sequenceNumber = String(index).padStart(4, '0');
  
  // 格式: MATCH_ParentId短码_TutorId短码_时间戳_序列号
  const matchId = `MATCH_${parentIdShort}_${tutorIdShort}_${timestamp}_${sequenceNumber}`;
  
  // 检查ID是否已存在
  const existingMatch = await Match.findOne({ matchId });
  if (existingMatch) {
    // 如果ID已存在，递增序列号并重试
    return generateUniqueMatchId(parentId, tutorId, index + 1);
  }
  
  return matchId;
};

// 随机选择一个状态，并根据状态设置相关字段
const generateStatusAndDates = () => {
  const statuses = ['pending', 'accepted', 'rejected', 'completed', 'cancelled'];
  const weights = [0.2, 0.3, 0.15, 0.25, 0.1]; // 权重分配
  
  // 根据权重随机选择状态
  let random = Math.random();
  let cumulativeWeight = 0;
  let selectedStatus = statuses[0];
  
  for (let i = 0; i < statuses.length; i++) {
    cumulativeWeight += weights[i];
    if (random <= cumulativeWeight) {
      selectedStatus = statuses[i];
      break;
    }
  }
  
  // 创建基础日期对象
  const now = new Date();
  const createdAt = new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000); // 最近30天内
  const result = { status: selectedStatus, createdAt };
  
  // 根据状态设置相关日期
  if (selectedStatus !== 'pending') {
    // 更新时间在创建时间之后
    result.updatedAt = new Date(createdAt.getTime() + Math.random() * 5 * 24 * 60 * 60 * 1000);
    
    if (selectedStatus === 'completed') {
      // 完成时间在更新时间之后
      result.completedAt = new Date(result.updatedAt.getTime() + Math.random() * 10 * 24 * 60 * 60 * 1000);
      
      // 完成状态添加评分和评价
      result.parentRating = Math.floor(Math.random() * 5) + 1;
      result.parentReview = faker.lorem.paragraph(1);
      result.tutorRating = Math.floor(Math.random() * 5) + 1;
      result.tutorReview = faker.lorem.paragraph(1);
    } else if (selectedStatus === 'cancelled') {
      // 取消时间在更新时间之后
      result.cancelledAt = new Date(result.updatedAt.getTime() + Math.random() * 3 * 24 * 60 * 60 * 1000);
      result.cancelReason = faker.helpers.arrayElement([
        '时间冲突',
        '找到其他教师',
        '价格不合适',
        '需求变更',
        '个人原因'
      ]);
    }
  }
  
  return result;
};

// 生成匹配数据
const generateMatchData = async (parents, tutors, requests, index) => {
  // 随机选择家长、教师和请求
  const parent = faker.helpers.arrayElement(parents);
  const tutor = faker.helpers.arrayElement(tutors);
  const request = faker.helpers.arrayElement(requests);
  
  // 生成唯一匹配ID
  const matchId = await generateUniqueMatchId(parent.parentId, tutor.tutorId, index);
  
  // 生成状态和日期
  const { status, createdAt, updatedAt, completedAt, cancelledAt, parentRating, parentReview, tutorRating, tutorReview, cancelReason } = generateStatusAndDates();
  
  // 构建匹配数据
  return {
    matchId,
    parentId: parent.parentId,
    tutorId: tutor.tutorId,
    requestId: request._id, // 使用MongoDB的ObjectId
    status,
    createdAt,
    updatedAt,
    completedAt,
    cancelledAt,
    parentRating,
    parentReview,
    tutorRating,
    tutorReview,
    cancelReason
  };
};

// 批量生成并插入匹配数据
const generateAndInsertMatches = async (count, batchSize) => {
  console.log(`开始生成${count}条匹配记录，批处理大小: ${batchSize}`);
  
  // 获取所有家长、教师和请求数据
  const parents = await Parent.find({});
  const tutors = await TutorProfile.find({});
  const requests = await TutoringRequest.find({});
  
  if (parents.length === 0 || tutors.length === 0 || requests.length === 0) {
    console.error('错误: 数据库中没有足够的家长、教师或请求数据');
    return;
  }
  
  console.log(`找到 ${parents.length} 个家长, ${tutors.length} 个教师, ${requests.length} 个请求`);
  
  let successCount = 0;
  let errorCount = 0;
  let duplicateCount = 0;
  
  // 计算需要处理的批次数
  const batches = Math.ceil(count / batchSize);
  
  console.time('总耗时');
  
  for (let batch = 0; batch < batches; batch++) {
    const batchStart = batch * batchSize;
    const batchEnd = Math.min(batchStart + batchSize, count);
    const currentBatchSize = batchEnd - batchStart;
    
    console.log(`\n处理批次 ${batch + 1}/${batches} (索引 ${batchStart}-${batchEnd - 1})`);
    console.time(`批次${batch + 1}耗时`);
    
    const batchData = [];
    
    // 生成当前批次的匹配数据
    for (let i = 0; i < currentBatchSize; i++) {
      try {
        const matchData = await generateMatchData(parents, tutors, requests, batchStart + i);
        batchData.push(matchData);
      } catch (error) {
        console.error(`生成第 ${batchStart + i} 条匹配数据时出错:`, error.message);
        errorCount++;
      }
    }
    
    // 批量插入数据
    try {
      const result = await Match.insertMany(batchData, { ordered: false });
      successCount += result.length;
      console.log(`成功插入 ${result.length} 条匹配记录`);
    } catch (error) {
      if (error.writeErrors) {
        // 处理重复键错误
        const duplicates = error.writeErrors.filter(err => err.code === 11000).length;
        const otherErrors = error.writeErrors.length - duplicates;
        
        duplicateCount += duplicates;
        errorCount += otherErrors;
        
        // 计算成功插入的数量
        const inserted = currentBatchSize - error.writeErrors.length;
        successCount += inserted;
        
        console.log(`批量插入部分成功: ${inserted} 成功, ${duplicates} 重复, ${otherErrors} 其他错误`);
      } else {
        console.error(`批量插入失败:`, error.message);
        errorCount += currentBatchSize;
      }
    }
    
    console.timeEnd(`批次${batch + 1}耗时`);
  }
  
  console.timeEnd('总耗时');
  
  console.log(`\n生成匹配记录完成:`);
  console.log(`- 成功: ${successCount}`);
  console.log(`- 重复: ${duplicateCount}`);
  console.log(`- 错误: ${errorCount}`);
  console.log(`- 总计: ${successCount + duplicateCount + errorCount}`);
};

// 清空现有匹配数据
const clearMatchData = async () => {
  try {
    const result = await Match.deleteMany({});
    console.log(`已清空 ${result.deletedCount} 条匹配记录`);
  } catch (error) {
    console.error('清空匹配数据失败:', error);
    process.exit(1);
  }
};

// 主函数
const main = async () => {
  try {
    console.log('连接到数据库...');
    await mongoose.connect(MONGODB_URI);
    console.log('数据库连接成功');
    
    // 如果需要，清空现有数据
    if (argv.clear) {
      await clearMatchData();
    }
    
    // 生成并插入匹配数据
    await generateAndInsertMatches(argv.count, argv.batchSize);
    
    console.log('匹配数据生成完成');
  } catch (error) {
    console.error('发生错误:', error);
  } finally {
    // 关闭数据库连接
    await mongoose.connection.close();
    console.log('数据库连接已关闭');
  }
};

// 执行主函数
main();
