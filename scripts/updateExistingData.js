/**
 * 数据更新脚本
 * 安全地处理现有数据而不清空数据库
 * 
 * 使用方法:
 * node updateExistingData.js --collection=matches --operation=addField --field=newField --value=defaultValue
 * 
 * 参数说明:
 * --collection: 要处理的集合名称 (必填, 例如: matches, tutors, parents, requests)
 * --operation: 要执行的操作 (必填, 可选值: addField, updateField, regenerateIds)
 * --field: 要添加或更新的字段名 (适用于addField和updateField操作)
 * --value: 字段的默认值或新值 (适用于addField和updateField操作)
 * --query: MongoDB查询条件，JSON格式 (可选，默认处理所有文档)
 * --batchSize: 每批处理的记录数 (默认: 50)
 * --dryRun: 仅模拟执行而不实际修改数据 (默认: false)
 */

const mongoose = require('mongoose');
const { faker } = require('@faker-js/faker/locale/zh_CN');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const chalk = require('chalk'); // 用于彩色输出，可能需要安装: npm install chalk

// 导入所有可能需要的模型
const Match = require('../models/Match');
const Parent = require('../models/Parent');
const TutorProfile = require('../models/TutorProfile');
const TutoringRequest = require('../models/TutoringRequest');
const User = require('../models/User');
// 如果有其他模型，请在此处引入

// 解析命令行参数
const argv = yargs(hideBin(process.argv))
  .option('collection', {
    alias: 'c',
    description: '要处理的集合名称',
    type: 'string',
    demandOption: true
  })
  .option('operation', {
    alias: 'o',
    description: '要执行的操作',
    type: 'string',
    choices: ['addField', 'updateField', 'regenerateIds', 'custom'],
    demandOption: true
  })
  .option('field', {
    alias: 'f',
    description: '要添加或更新的字段名',
    type: 'string'
  })
  .option('value', {
    alias: 'v',
    description: '字段的默认值或新值',
    type: 'string'
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
    default: 50
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

// 获取正确的模型引用
const getModel = (collectionName) => {
  switch (collectionName.toLowerCase()) {
    case 'matches':
      return Match;
    case 'parents':
      return Parent;
    case 'tutors':
      return TutorProfile;
    case 'requests':
    case 'tutoringrequests':
      return TutoringRequest;
    case 'users':
      return User;
    // 如果有其他集合，请在此处添加
    default:
      throw new Error(`未知的集合名称: ${collectionName}`);
  }
};

// 添加新字段到所有文档
const addFieldToDocuments = async (model, field, value, query, batchSize, dryRun) => {
  console.log(chalk.blue(`开始处理添加字段操作 - 集合: ${model.collection.name}, 字段: ${field}, 默认值: ${value}`));
  
  try {
    // 解析查询条件
    const queryObj = JSON.parse(query);
    
    // 获取符合条件的文档总数
    const totalCount = await model.countDocuments(queryObj);
    console.log(chalk.yellow(`找到 ${totalCount} 个符合条件的文档`));
    
    if (totalCount === 0) {
      console.log(chalk.red('未找到匹配的文档，操作中止'));
      return;
    }
    
    if (dryRun) {
      console.log(chalk.green('这是一次演习，不会实际修改数据'));
      console.log(chalk.green(`将为 ${totalCount} 个文档添加字段 ${field} = ${value}`));
      return;
    }
    
    // 使用批处理方式处理数据
    let processedCount = 0;
    
    for (let skip = 0; skip < totalCount; skip += batchSize) {
      const documents = await model.find(queryObj).skip(skip).limit(batchSize);
      
      // 创建批量更新操作
      const bulkOps = documents.map(doc => ({
        updateOne: {
          filter: { _id: doc._id },
          update: { $set: { [field]: value } },
          upsert: false
        }
      }));
      
      // 执行批量更新
      const result = await model.bulkWrite(bulkOps);
      processedCount += result.modifiedCount;
      
      console.log(chalk.green(`处理进度: ${processedCount}/${totalCount} (${Math.round(processedCount/totalCount*100)}%)`));
    }
    
    console.log(chalk.green(`操作完成! 成功更新 ${processedCount} 个文档`));
    
  } catch (error) {
    console.error(chalk.red('添加字段时出错:'), error);
    throw error;
  }
};

// 更新字段值
const updateFieldInDocuments = async (model, field, value, query, batchSize, dryRun) => {
  console.log(chalk.blue(`开始处理更新字段操作 - 集合: ${model.collection.name}, 字段: ${field}, 新值: ${value}`));
  
  try {
    // 解析查询条件
    const queryObj = JSON.parse(query);
    
    // 添加条件确保只更新包含该字段的文档
    const fieldQuery = { ...queryObj, [field]: { $exists: true } };
    
    // 获取符合条件的文档总数
    const totalCount = await model.countDocuments(fieldQuery);
    console.log(chalk.yellow(`找到 ${totalCount} 个包含字段 ${field} 的文档`));
    
    if (totalCount === 0) {
      console.log(chalk.red(`未找到包含字段 ${field} 的文档，操作中止`));
      return;
    }
    
    if (dryRun) {
      console.log(chalk.green('这是一次演习，不会实际修改数据'));
      console.log(chalk.green(`将为 ${totalCount} 个文档更新字段 ${field} = ${value}`));
      return;
    }
    
    // 使用批处理方式处理数据
    let processedCount = 0;
    
    for (let skip = 0; skip < totalCount; skip += batchSize) {
      const documents = await model.find(fieldQuery).skip(skip).limit(batchSize);
      
      // 创建批量更新操作
      const bulkOps = documents.map(doc => ({
        updateOne: {
          filter: { _id: doc._id },
          update: { $set: { [field]: value } },
          upsert: false
        }
      }));
      
      // 执行批量更新
      const result = await model.bulkWrite(bulkOps);
      processedCount += result.modifiedCount;
      
      console.log(chalk.green(`处理进度: ${processedCount}/${totalCount} (${Math.round(processedCount/totalCount*100)}%)`));
    }
    
    console.log(chalk.green(`操作完成! 成功更新 ${processedCount} 个文档`));
    
  } catch (error) {
    console.error(chalk.red('更新字段时出错:'), error);
    throw error;
  }
};

// 重新生成ID (根据具体模型自定义实现)
const regenerateIdsForDocuments = async (model, query, batchSize, dryRun) => {
  console.log(chalk.blue(`开始为 ${model.collection.name} 重新生成ID`));
  
  try {
    // 这里需要根据不同集合实现特定的ID生成逻辑
    const modelName = model.collection.name;
    console.log(chalk.yellow(`注意: 这是一个示例实现，请根据 ${modelName} 的具体ID格式进行自定义`));
    
    // 解析查询条件
    const queryObj = JSON.parse(query);
    
    // 获取符合条件的文档总数
    const totalCount = await model.countDocuments(queryObj);
    console.log(chalk.yellow(`找到 ${totalCount} 个符合条件的文档`));
    
    if (totalCount === 0) {
      console.log(chalk.red('未找到匹配的文档，操作中止'));
      return;
    }
    
    if (dryRun) {
      console.log(chalk.green('这是一次演习，不会实际修改数据'));
      console.log(chalk.green(`将为 ${totalCount} 个文档重新生成ID`));
      return;
    }
    
    // 使用批处理方式处理数据
    let processedCount = 0;
    
    for (let skip = 0; skip < totalCount; skip += batchSize) {
      const documents = await model.find(queryObj).skip(skip).limit(batchSize);
      
      for (const doc of documents) {
        // 生成新ID (示例逻辑，需要根据实际情况调整)
        let newId;
        
        if (modelName === 'tutoringrequests') {
          // 家教请求ID示例格式
          const timestamp = new Date().toISOString().replace(/[-:T.Z]/g, '').substring(0, 14);
          const randomSuffix = Math.floor(Math.random() * 1000000000000).toString().padStart(12, '0');
          newId = `REQUEST_PARENT_${timestamp}_${randomSuffix}`;
        } else if (modelName === 'matches') {
          // 匹配ID示例格式
          const timestamp = new Date().toISOString().replace(/[-:T.Z]/g, '').substring(0, 14);
          const randomSuffix = Math.floor(Math.random() * 1000000000000).toString().padStart(12, '0');
          newId = `MATCH_${timestamp}_${randomSuffix}`;
        } else {
          // 其他集合的通用格式
          const timestamp = new Date().toISOString().replace(/[-:T.Z]/g, '').substring(0, 14);
          const randomSuffix = Math.floor(Math.random() * 1000000000000).toString().padStart(12, '0');
          newId = `${modelName.toUpperCase()}_${timestamp}_${randomSuffix}`;
        }
        
        // 更新文档ID (通常需要找到ID字段名称，这里假设是'requestId'或集合名+'Id')
        let idFieldName;
        if (modelName === 'tutoringrequests') {
          idFieldName = 'requestId';
        } else {
          idFieldName = modelName.slice(0, -1) + 'Id'; // 去掉复数s并加上Id
        }
        
        // 更新文档
        await model.updateOne({ _id: doc._id }, { $set: { [idFieldName]: newId } });
        processedCount++;
        
        if (processedCount % 10 === 0 || processedCount === totalCount) {
          console.log(chalk.green(`处理进度: ${processedCount}/${totalCount} (${Math.round(processedCount/totalCount*100)}%)`));
        }
      }
    }
    
    console.log(chalk.green(`操作完成! 成功更新 ${processedCount} 个文档的ID`));
    
  } catch (error) {
    console.error(chalk.red('重新生成ID时出错:'), error);
    throw error;
  }
};

// 主函数
const main = async () => {
  try {
    // 连接到数据库
    console.log(chalk.blue('正在连接到数据库...'));
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(chalk.green('数据库连接成功!'));

    // 获取模型
    const model = getModel(argv.collection);
    console.log(chalk.blue(`使用模型: ${model.modelName}`));

    // 根据操作类型执行相应的功能
    switch (argv.operation) {
      case 'addField':
        if (!argv.field || argv.value === undefined) {
          throw new Error('添加字段操作需要提供 field 和 value 参数');
        }
        await addFieldToDocuments(model, argv.field, argv.value, argv.query, argv.batchSize, argv.dryRun);
        break;
        
      case 'updateField':
        if (!argv.field || argv.value === undefined) {
          throw new Error('更新字段操作需要提供 field 和 value 参数');
        }
        await updateFieldInDocuments(model, argv.field, argv.value, argv.query, argv.batchSize, argv.dryRun);
        break;
        
      case 'regenerateIds':
        await regenerateIdsForDocuments(model, argv.query, argv.batchSize, argv.dryRun);
        break;
        
      case 'custom':
        console.log(chalk.yellow('自定义操作需要在脚本中编写特定实现'));
        console.log(chalk.yellow('请修改脚本添加你的自定义操作逻辑'));
        break;
        
      default:
        throw new Error(`不支持的操作类型: ${argv.operation}`);
    }

    console.log(chalk.green('操作完成，正在关闭数据库连接...'));
    await mongoose.connection.close();
    console.log(chalk.green('数据库连接已关闭'));
    
  } catch (error) {
    console.error(chalk.red('执行过程中出错:'), error);
    
    // 尝试关闭数据库连接
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      console.log(chalk.yellow('由于错误，数据库连接已强制关闭'));
    }
    
    process.exit(1);
  }
};

// 执行主函数
main();
