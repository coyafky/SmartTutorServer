/**
 * 为教师添加开课时间数据的脚本
 * 这个脚本会为数据库中的教师添加随机的开课时间数据
 */

const mongoose = require('mongoose');
const TutorProfile = require('../models/TutorProfile');

// 连接数据库
mongoose
  .connect('mongodb://localhost:27017/smartTutor')
  .then(() => {
    console.log('MongoDB 连接成功');
    addSessionsToTutors();
  })
  .catch((err) => {
    console.error('MongoDB 连接失败:', err);
    process.exit(1);
  });

/**
 * 为教师添加开课时间数据
 */
async function addSessionsToTutors() {
  try {
    // 获取所有教师
    const tutors = await TutorProfile.find({});
    console.log(`找到 ${tutors.length} 位教师`);

    // 可用的时间段
    const days = ['周六', '周日'];
    const periods = ['早上', '下午', '晚上'];
    
    // 更新计数器
    let updatedCount = 0;
    
    // 为每个教师添加随机的开课时间
    for (const tutor of tutors) {
      // 为每个教师随机生成2-5个时间段
      const sessionCount = Math.floor(Math.random() * 4) + 2;
      const sessions = [];
      
      // 已添加的时间段组合，用于避免重复
      const addedCombinations = new Set();
      
      // 生成随机时间段
      for (let i = 0; i < sessionCount; i++) {
        // 随机选择日期和时间段
        const day = days[Math.floor(Math.random() * days.length)];
        const period = periods[Math.floor(Math.random() * periods.length)];
        
        // 检查是否已添加该组合
        const combination = `${day}-${period}`;
        if (addedCombinations.has(combination)) {
          continue; // 跳过重复的组合
        }
        
        addedCombinations.add(combination);
        
        // 随机决定是否可用
        const available = Math.random() > 0.2; // 80%的概率为可用
        
        // 创建时间段
        const session = {
          day,
          period,
          available,
          timeSlot: {
            duration: 120, // 2小时
            status: available ? 'available' : (Math.random() > 0.5 ? 'booked' : 'blocked')
          }
        };
        
        sessions.push(session);
      }
      
      // 更新教师数据
      tutor.sessions = sessions;
      await tutor.save();
      updatedCount++;
      
      // 每100个教师输出一次进度
      if (updatedCount % 100 === 0) {
        console.log(`已更新 ${updatedCount}/${tutors.length} 位教师`);
      }
    }
    
    console.log(`成功为 ${updatedCount} 位教师添加了开课时间数据`);
    mongoose.disconnect();
  } catch (error) {
    console.error('添加开课时间数据失败:', error);
    mongoose.disconnect();
    process.exit(1);
  }
}
