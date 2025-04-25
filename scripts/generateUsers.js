const { faker } = require('@faker-js/faker/locale/zh_CN');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

// 配置参数
const TOTAL_USERS = 1000; // 增加到1000个用户
const BATCH_SIZE = 100; // 每批插入100个用户，提高效率

// 连接到MongoDB
mongoose
  .connect('mongodb://localhost:27017/smarttutor', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('成功连接到MongoDB');
  })
  .catch((err) => {
    console.error('连接MongoDB失败:', err);
    process.exit(1);
  });

// 用于跟踪已生成的customId
const generatedIds = new Set();

// 全局计数器，确保每个ID都是唯一的
let globalCounter = 0;

// 生成符合模型要求的自定义ID
function generateCustomId(role, index = 0) {
  // 确保角色前缀正确
  let prefix;
  switch (role) {
    case 'teacher':
      prefix = 'TUTOR';
      break;
    case 'parent':
      prefix = 'PARENT';
      break;
    case 'admin':
      prefix = 'ADMIN';
      break;
    default:
      prefix = 'TUTOR';
  }

  // 获取当前时间
  const now = new Date();

  // 添加索引偏移以避免同一批次中的重复
  // 使用全局计数器而不是索引，确保绝对唯一性
  globalCounter++;

  // 格式化为14位数字时间戳的基础部分：年月日时分
  let baseTimestamp =
    now.getFullYear().toString() +
    (now.getMonth() + 1).toString().padStart(2, '0') +
    now.getDate().toString().padStart(2, '0') +
    now.getHours().toString().padStart(2, '0') +
    now.getMinutes().toString().padStart(2, '0');

  // 使用全局计数器的后两位数字作为秒数部分
  // 这样即使在同一分钟内生成多个ID，也能确保唯一性
  let secondsPart = (globalCounter % 100).toString().padStart(2, '0');

  // 组合成完整的14位时间戳
  let timestamp = baseTimestamp + secondsPart;

  // 确保时间戳正好是14位
  if (timestamp.length > 14) {
    timestamp = timestamp.substring(0, 14);
  } else if (timestamp.length < 14) {
    // 不太可能发生，但为了安全起见
    timestamp = timestamp.padEnd(14, '0');
  }

  // 生成基础ID
  let customId = `${prefix}_${timestamp}`;

  // 如果ID已存在，继续修改时间戳直到唯一
  let attempts = 0;
  while (generatedIds.has(customId) && attempts < 1000) {
    attempts++;
    // 修改最后几位数字
    const incrementedCounter = globalCounter + attempts;
    secondsPart = (incrementedCounter % 100).toString().padStart(2, '0');
    timestamp = baseTimestamp + secondsPart;

    // 如果还是有冲突，修改分钟部分
    if (attempts > 50) {
      const minutesPart = (
        (parseInt(baseTimestamp.slice(10, 12)) + Math.floor(attempts / 50)) %
        60
      )
        .toString()
        .padStart(2, '0');
      timestamp = baseTimestamp.slice(0, 10) + minutesPart + secondsPart;
    }

    customId = `${prefix}_${timestamp}`;
  }

  // 记录已生成的ID
  generatedIds.add(customId);

  // 最终验证
  if (!/^(TUTOR|PARENT|ADMIN)_\d{14}$/.test(customId)) {
    console.error(`生成的ID不符合格式要求: ${customId}`);
    // 紧急修复 - 生成一个绝对唯一的符合格式的ID
    const emergencyTimestamp =
      '20250326' + globalCounter.toString().padStart(6, '0');
    customId = `${prefix}_${emergencyTimestamp}`;
    generatedIds.add(customId);
  }

  return customId;
}

// 生成随机用户
function generateRandomUser(index = 0) {
  const role = faker.helpers.arrayElement(['parent', 'teacher']);
  const createdAt = faker.date.past(2);
  const verifiedAt = faker.datatype.boolean(0.8)
    ? faker.date.between({ from: createdAt, to: new Date() })
    : null;

  return {
    customId: generateCustomId(role, index),
    username:
      faker.internet.username().replace(/[^a-zA-Z0-9]/g, '') +
      '_' +
      faker.string.alphanumeric(6),
    // 使用bcrypt哈希密码
    password: bcrypt.hashSync(faker.internet.password({ length: 10 }), 10),
    role: role,
    avatar: faker.image.avatar(),
    status: faker.helpers.arrayElement(['active', 'inactive', 'banned']),
    createdAt: createdAt,
    updatedAt: createdAt,
    lastLoginAt: faker.datatype.boolean(0.7)
      ? faker.date.between({ from: createdAt, to: new Date() })
      : null,
    verifiedAt: verifiedAt,
  };
}

// 批量生成用户数据（使用insertMany）
async function generateUsers() {
  const batches = Math.ceil(TOTAL_USERS / BATCH_SIZE);
  let generatedCount = 0;
  let startTime = Date.now();

  console.log(`开始生成 ${TOTAL_USERS} 个用户，分 ${batches} 批处理...`);

  // 全局索引，确保每个用户的customId都不同
  let globalIndex = 0;

  for (let i = 0; i < batches; i++) {
    const batchStartTime = Date.now();
    const currentBatchSize = Math.min(BATCH_SIZE, TOTAL_USERS - generatedCount);
    const users = [];

    for (let j = 0; j < currentBatchSize; j++) {
      // 使用全局索引而不是批次内索引
      users.push(generateRandomUser(globalIndex));
      globalIndex++;
    }

    try {
      // 使用ordered: false允许部分插入成功
      await User.insertMany(users, { ordered: false });
      generatedCount += users.length;
      const batchTime = (Date.now() - batchStartTime) / 1000;
      console.log(
        `批次 ${i + 1}/${batches}: 已生成 ${
          users.length
        } 个用户 (${batchTime.toFixed(2)}秒)`
      );
      console.log(
        `总进度: ${generatedCount}/${TOTAL_USERS} (${(
          (generatedCount / TOTAL_USERS) *
          100
        ).toFixed(2)}%)`
      );
    } catch (error) {
      if (error.writeErrors) {
        // 统计成功插入的数量
        const successCount = error.insertedDocs ? error.insertedDocs.length : 0;
        generatedCount += successCount;
        console.log(
          `批次 ${
            i + 1
          } 部分成功: 插入了 ${successCount}/${currentBatchSize} 个用户`
        );
        console.error(`错误数量: ${error.writeErrors.length}`);

        // 输出前5个错误的详细信息
        if (error.writeErrors.length > 0) {
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
                console.error(`  文档ID: ${errorDetail.op.customId}`);
                console.error(`  用户名: ${errorDetail.op.username}`);
              }
            } catch (logError) {
              console.error(`- 无法解析错误 ${e + 1}: ${logError.message}`);
            }
          }
        }
      } else {
        console.error(`批次 ${i + 1} 失败:`, error.message);
      }
    }
  }

  const totalTime = (Date.now() - startTime) / 1000;
  console.log(
    `总用时: ${totalTime.toFixed(2)}秒，平均每秒生成 ${(
      generatedCount / totalTime
    ).toFixed(2)} 个用户`
  );
  return generatedCount;
}

// 生成管理员用户
async function generateAdminUser() {
  try {
    // 检查是否已存在管理员
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('管理员用户已存在:', existingAdmin.username);
      return true;
    }

    const admin = new User({
      customId: generateCustomId('admin'),
      username: 'admin',
      // 使用bcrypt哈希密码 - 密码为 "admin123"
      password: bcrypt.hashSync('admin123', 10),
      role: 'admin',
      avatar:
        process.env.DEFAULT_AVATAR_URL || 'https://via.placeholder.com/150',
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLoginAt: new Date(),
      verifiedAt: new Date(),
    });

    await admin.save();
    console.log('管理员用户创建成功:', admin.username);
    return true;
  } catch (error) {
    console.error('创建管理员用户失败:', error.message);
    return false;
  }
}

// 清空用户集合功能已移除
// 为了避免意外删除用户数据，此脚本不再支持清除功能
async function clearUsers() {
  console.log('警告: 清除用户数据功能已被移除，以保护现有数据');
  console.log('如需清除数据，请使用MongoDB管理工具手动操作');
  return false;
}

// 主函数
async function main() {
  try {
    // 获取命令行参数
    const args = process.argv.slice(2);
    if (args.includes('--clear')) {
      console.log('警告: --clear 参数已不再支持');
      await clearUsers();
    }

    // 1. 生成管理员
    await generateAdminUser();

    // 尝试修复可能的模式验证问题
    console.log('检查User模型的验证规则...');
    const userSchema = User.schema;
    console.log(
      `customId正则验证: ${userSchema.path('customId').options.match}`
    );

    // 2. 生成普通用户
    console.log(`开始生成 ${TOTAL_USERS} 个用户...`);
    const userCount = await generateUsers();
    console.log(`成功生成 ${userCount} 个用户`);

    // 3. 验证数据
    const totalCount = await User.countDocuments();
    console.log(`数据库中现有用户总数: ${totalCount}`);

    // 4. 角色分布统计
    const roleStats = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } },
    ]);
    console.log('用户角色分布:');
    roleStats.forEach((stat) => {
      console.log(`- ${stat._id}: ${stat.count} 用户`);
    });
  } catch (error) {
    console.error('生成用户时发生错误:', error);
  } finally {
    await mongoose.disconnect();
    console.log('数据库连接已关闭');
  }
}

// 执行主函数
main();
