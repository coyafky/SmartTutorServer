/**
 * 教师路由性能测试脚本
 * 测试内容：教师注册、登录和资料管理相关API的性能
 */

const axios = require('axios');
const fs = require('fs');
const { performance } = require('perf_hooks');
const { v4: uuidv4 } = require('uuid');

// 服务器配置
const BASE_URL = 'http://localhost:3000/api';

// 测试配置
const ITERATIONS = 30; // 每个端点的请求次数
const CONCURRENCY = 5; // 并发请求数
const TIMEOUT = 5000; // 请求超时时间(毫秒)

// 测试用户信息
const TEST_TEACHER = {
  username: `teacher_${Date.now()}`,
  password: 'Test12345',
  email: `teacher_${Date.now()}@example.com`,
  role: 'teacher'
};

// 教师资料信息
const TUTOR_PROFILE = {
  name: '测试教师',
  gender: '男',
  age: 30,
  education: '硕士',
  subjects: ['数学', '物理'],
  teachingExperience: 5,
  hourlyRate: 200,
  introduction: '我是一名专业的家教老师，有丰富的教学经验。',
  location: {
    city: '北京',
    district: '海淀区',
    address: '中关村大街1号',
    geo: {
      type: 'Point',
      coordinates: [116.3, 39.9] // 添加经纬度坐标
    }
  },
  contactInfo: {
    phone: '13800138000',
    email: TEST_TEACHER.email,
    wechat: 'teacher_wechat'
  }
};

// 存储测试数据
let testTeacherId = '';
let testTeacherToken = '';
let testTutorProfileId = '';

// 测试端点 - 根据实际API路径调整
const PUBLIC_ENDPOINTS = [
  '/tutorProfiles/tutors', // 获取所有教师列表
  '/tutorProfiles/tutors/subject/数学', // 按学科查询教师
  '/tutorProfiles/tutors/location/北京/海淀区', // 按地区查询教师
  '/tutorProfiles/tutors/nearby?longitude=116.3&latitude=39.9&distance=5', // 查询附近教师
];

// 需要认证的端点
const AUTH_ENDPOINTS = [
  '/tutorProfiles/profile', // 获取自己的资料
  '/tutorProfiles/profile/availability', // 获取可用时间
  '/tutorProfiles/profile/status', // 更新可用状态
  '/tutorProfiles/profile/subjects', // 科目管理
  '/tutorProfiles/profile/location', // 位置信息
  '/tutorProfiles/profile/pricing', // 价格信息
  '/tutorProfiles/profile/teaching-style', // 教学风格
  '/tutorProfiles/profile/default-times', // 默认时间
  '/tutorProfiles/profile/city-requests', // 城市需求
  '/tutorProfiles/profile/city-requests/filters', // 带筛选的城市需求
];

// 需要参数的POST/PATCH端点测试数据
const TEST_DATA = {
  '/tutorProfiles/profile/status': { availabilityStatus: 'available' },
  '/tutorProfiles/profile/subjects': { name: '英语', level: '高中', description: '英语教学' },
  '/tutorProfiles/profile/location': { 
    city: '上海', 
    district: '浦东新区', 
    address: '张江高科技园区',
    geo: {
      type: 'Point',
      coordinates: [121.5, 31.2]
    }
  },
  '/tutorProfiles/profile/pricing': { hourlyRate: 250, packageOptions: [{ hours: 10, discount: 0.9 }] },
  '/tutorProfiles/profile/teaching-style': { 
    keywords: ['有耐心', '善于沟通'], 
    strengths: ['擅长应试', '注重基础'] 
  },
  '/tutorProfiles/profile/default-times': {
    weekday: {
      defaultTimes: {
        '早上': { startTime: '08:00', endTime: '12:00' },
        '下午': { startTime: '14:00', endTime: '18:00' },
        '晚上': { startTime: '19:00', endTime: '21:00' }
      }
    }
  },
  '/tutorProfiles/profile/sessions': {
    day: '周一',
    startTime: '14:00',
    endTime: '16:00',
    isAvailable: true
  }
};

// 注册新教师
async function registerTeacher() {
  try {
    console.log('正在注册测试教师账号...');
    const response = await axios.post(`${BASE_URL}/auth/register`, TEST_TEACHER);
    
    if (response.data && response.data.status === 'success') {
      console.log('教师账号注册成功');
      testTeacherId = response.data.data.user.customId || response.data.data.user._id;
      return true;
    } else {
      console.error('教师账号注册失败:', response.data);
      return false;
    }
  } catch (error) {
    console.error('教师账号注册出错:', error.message);
    if (error.response) {
      console.error('错误详情:', error.response.data);
      
      // 如果是重复用户名错误，尝试使用新用户名
      if (error.response.data.message && error.response.data.message.includes('已存在')) {
        TEST_TEACHER.username = `teacher_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        TEST_TEACHER.email = `${TEST_TEACHER.username}@example.com`;
        console.log(`尝试使用新用户名: ${TEST_TEACHER.username}`);
        return await registerTeacher();
      }
    }
    return false;
  }
}

// 教师登录
async function loginTeacher() {
  try {
    console.log('正在登录测试教师账号...');
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      username: TEST_TEACHER.username,
      password: TEST_TEACHER.password
    });
    
    if (response.data && response.data.status === 'success' && response.data.data && response.data.data.token) {
      console.log('教师账号登录成功');
      testTeacherToken = response.data.data.token;
      return true;
    } else {
      console.error('教师账号登录失败:', response.data);
      return false;
    }
  } catch (error) {
    console.error('教师账号登录出错:', error.message);
    if (error.response) {
      console.error('错误详情:', error.response.data);
    }
    return false;
  }
}

// 创建教师资料
async function createTutorProfile() {
  try {
    console.log('正在创建教师资料...');
    const headers = {
      'Authorization': `Bearer ${testTeacherToken}`
    };
    
    const response = await axios.post(`${BASE_URL}/tutorProfiles/profile`, TUTOR_PROFILE, { headers });
    
    if (response.data && response.data.status === 'success') {
      console.log('教师资料创建成功');
      // 检查返回的数据结构
      if (response.data.data && response.data.data.tutorProfile) {
        testTutorProfileId = response.data.data.tutorProfile._id;
        console.log(`教师资料ID: ${testTutorProfileId}`);
      } else {
        console.log('无法获取教师资料ID，使用默认ID继续测试');
        testTutorProfileId = 'unknown';
      }
      return true;
    } else {
      console.error('教师资料创建失败:', response.data);
      return false;
    }
  } catch (error) {
    console.error('教师资料创建出错:', error.message);
    if (error.response) {
      console.error('错误详情:', error.response.data);
    }
    return false;
  }
}

// 测试公共端点
async function testPublicEndpoints() {
  console.log('\n开始测试公共API端点...');
  const results = {};
  
  for (const endpoint of PUBLIC_ENDPOINTS) {
    const times = [];
    const errors = [];
    
    console.log(`\n测试端点: ${endpoint}`);
    
    // 并发请求
    const requests = Array(CONCURRENCY)
      .fill()
      .map(async () => {
        for (let i = 0; i < ITERATIONS / CONCURRENCY; i++) {
          const start = performance.now();
          try {
            await axios.get(`${BASE_URL}${endpoint}`, { 
              timeout: TIMEOUT
            });
            const end = performance.now();
            times.push(end - start);
          } catch (error) {
            errors.push(error.message);
          }
        }
      });
    
    await Promise.all(requests);
    
    // 如果没有成功的请求，跳过统计
    if (times.length === 0) {
      console.log(`端点 ${endpoint} 没有成功的请求，跳过统计`);
      results[endpoint] = { 
        error: '所有请求失败',
        successRate: '0%',
        errors: errors.slice(0, 5) // 只显示前5个错误
      };
      continue;
    }
    
    // 计算统计数据
    const avg = times.reduce((sum, time) => sum + time, 0) / times.length;
    const min = Math.min(...times);
    const max = Math.max(...times);
    const sorted = [...times].sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)] || 0;
    const p95 = sorted[Math.floor(sorted.length * 0.95)] || 0;
    const successRate = `${((times.length / ITERATIONS) * 100).toFixed(2)}%`;
    
    results[endpoint] = { avg, min, max, median, p95, successRate, times };
    
    // 输出结果
    console.log(`成功率: ${successRate}`);
    console.log(`平均响应时间: ${avg.toFixed(2)}ms`);
    console.log(`最小响应时间: ${min.toFixed(2)}ms`);
    console.log(`最大响应时间: ${max.toFixed(2)}ms`);
    console.log(`中位数响应时间: ${median.toFixed(2)}ms`);
    console.log(`95%响应时间: ${p95.toFixed(2)}ms`);
    console.log('----------------------------');
  }
  
  return results;
}

// 测试需要认证的端点
async function testAuthEndpoints() {
  console.log('\n开始测试需要认证的API端点...');
  const results = {};
  
  // 设置请求头
  const headers = {
    'Authorization': `Bearer ${testTeacherToken}`
  };
  
  for (const endpoint of AUTH_ENDPOINTS) {
    const times = [];
    const errors = [];
    
    console.log(`\n测试端点: ${endpoint}`);
    
    // 确定请求方法和数据
    let method = 'get';
    let data = null;
    
    if (endpoint.includes('/status') || 
        endpoint.includes('/location') || 
        endpoint.includes('/pricing') || 
        endpoint.includes('/teaching-style') ||
        endpoint.includes('/default-times')) {
      method = 'patch';
      data = TEST_DATA[endpoint];
    } else if (endpoint.includes('/subjects') && !endpoint.includes('/')) {
      method = 'post';
      data = TEST_DATA[endpoint];
    } else if (endpoint.includes('/sessions') && !endpoint.includes('/')) {
      method = 'post';
      data = TEST_DATA[endpoint];
    }
    
    // 并发请求
    const requests = Array(CONCURRENCY)
      .fill()
      .map(async () => {
        for (let i = 0; i < ITERATIONS / CONCURRENCY; i++) {
          const start = performance.now();
          try {
            if (method === 'get') {
              await axios.get(`${BASE_URL}${endpoint}`, { 
                headers,
                timeout: TIMEOUT
              });
            } else if (method === 'post') {
              await axios.post(`${BASE_URL}${endpoint}`, data, { 
                headers,
                timeout: TIMEOUT
              });
            } else if (method === 'patch') {
              await axios.patch(`${BASE_URL}${endpoint}`, data, { 
                headers,
                timeout: TIMEOUT
              });
            }
            const end = performance.now();
            times.push(end - start);
          } catch (error) {
            errors.push(error.message);
            if (errors.length <= 3 && error.response) {
              console.error(`请求错误 (${endpoint}): ${error.response.status} - ${JSON.stringify(error.response.data)}`);
            }
          }
        }
      });
    
    await Promise.all(requests);
    
    // 如果没有成功的请求，跳过统计
    if (times.length === 0) {
      console.log(`端点 ${endpoint} 没有成功的请求，跳过统计`);
      results[endpoint] = { 
        error: '所有请求失败',
        successRate: '0%',
        errors: errors.slice(0, 5) // 只显示前5个错误
      };
      continue;
    }
    
    // 计算统计数据
    const avg = times.reduce((sum, time) => sum + time, 0) / times.length;
    const min = Math.min(...times);
    const max = Math.max(...times);
    const sorted = [...times].sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)] || 0;
    const p95 = sorted[Math.floor(sorted.length * 0.95)] || 0;
    const successRate = `${((times.length / ITERATIONS) * 100).toFixed(2)}%`;
    
    results[endpoint] = { avg, min, max, median, p95, successRate, times };
    
    // 输出结果
    console.log(`成功率: ${successRate}`);
    console.log(`平均响应时间: ${avg.toFixed(2)}ms`);
    console.log(`最小响应时间: ${min.toFixed(2)}ms`);
    console.log(`最大响应时间: ${max.toFixed(2)}ms`);
    console.log(`中位数响应时间: ${median.toFixed(2)}ms`);
    console.log(`95%响应时间: ${p95.toFixed(2)}ms`);
    console.log('----------------------------');
  }
  
  return results;
}

// 生成HTML报告
function generateHtmlReport(publicResults, authResults) {
  const htmlContent = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>教师路由性能测试报告</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <style>
    body {
      font-family: 'Arial', sans-serif;
      margin: 0;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      background-color: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }
    h1, h2 {
      color: #333;
    }
    h1 {
      text-align: center;
      margin-bottom: 30px;
      padding-bottom: 10px;
      border-bottom: 2px solid #eee;
    }
    .chart-container {
      margin: 30px 0;
      height: 400px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    th, td {
      padding: 12px 15px;
      text-align: left;
      border-bottom: 1px solid #ddd;
    }
    th {
      background-color: #f8f8f8;
      font-weight: bold;
    }
    tr:hover {
      background-color: #f1f1f1;
    }
    .section {
      margin-bottom: 40px;
    }
    .summary {
      background-color: #f9f9f9;
      padding: 15px;
      border-radius: 5px;
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>教师路由性能测试报告</h1>
    
    <div class="summary">
      <p><strong>测试配置:</strong> ${ITERATIONS} 次请求, ${CONCURRENCY} 并发, ${TIMEOUT}ms 超时</p>
      <p><strong>测试时间:</strong> ${new Date().toLocaleString()}</p>
    </div>
    
    <div class="section">
      <h2>公共API端点性能</h2>
      <div class="chart-container">
        <canvas id="publicChart"></canvas>
      </div>
      
      <table>
        <tr>
          <th>端点</th>
          <th>成功率</th>
          <th>平均响应时间</th>
          <th>最小响应时间</th>
          <th>最大响应时间</th>
          <th>中位数响应时间</th>
          <th>95%响应时间</th>
        </tr>
        ${Object.entries(publicResults)
          .map(
            ([endpoint, data]) => `
        <tr>
          <td>${endpoint}</td>
          <td>${data.successRate || '0%'}</td>
          <td>${data.avg ? data.avg.toFixed(2) + 'ms' : 'N/A'}</td>
          <td>${data.min ? data.min.toFixed(2) + 'ms' : 'N/A'}</td>
          <td>${data.max ? data.max.toFixed(2) + 'ms' : 'N/A'}</td>
          <td>${data.median ? data.median.toFixed(2) + 'ms' : 'N/A'}</td>
          <td>${data.p95 ? data.p95.toFixed(2) + 'ms' : 'N/A'}</td>
        </tr>
        `
          )
          .join('')}
      </table>
    </div>
    
    <div class="section">
      <h2>需要认证的API端点性能</h2>
      <div class="chart-container">
        <canvas id="authChart"></canvas>
      </div>
      
      <table>
        <tr>
          <th>端点</th>
          <th>成功率</th>
          <th>平均响应时间</th>
          <th>最小响应时间</th>
          <th>最大响应时间</th>
          <th>中位数响应时间</th>
          <th>95%响应时间</th>
        </tr>
        ${Object.entries(authResults)
          .map(
            ([endpoint, data]) => `
        <tr>
          <td>${endpoint}</td>
          <td>${data.successRate || '0%'}</td>
          <td>${data.avg ? data.avg.toFixed(2) + 'ms' : 'N/A'}</td>
          <td>${data.min ? data.min.toFixed(2) + 'ms' : 'N/A'}</td>
          <td>${data.max ? data.max.toFixed(2) + 'ms' : 'N/A'}</td>
          <td>${data.median ? data.median.toFixed(2) + 'ms' : 'N/A'}</td>
          <td>${data.p95 ? data.p95.toFixed(2) + 'ms' : 'N/A'}</td>
        </tr>
        `
          )
          .join('')}
      </table>
    </div>
  </div>
  
  <script>
    // 公共API图表
    const publicCtx = document.getElementById('publicChart').getContext('2d');
    new Chart(publicCtx, {
      type: 'bar',
      data: {
        labels: ${JSON.stringify(Object.keys(publicResults))},
        datasets: [
          {
            label: '平均响应时间 (ms)',
            data: ${JSON.stringify(Object.values(publicResults).map(data => data.avg ? parseFloat(data.avg.toFixed(2)) : 0))},
            backgroundColor: 'rgba(54, 162, 235, 0.5)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1
          },
          {
            label: '95%响应时间 (ms)',
            data: ${JSON.stringify(Object.values(publicResults).map(data => data.p95 ? parseFloat(data.p95.toFixed(2)) : 0))},
            backgroundColor: 'rgba(255, 99, 132, 0.5)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: '响应时间 (ms)'
            }
          },
          x: {
            title: {
              display: true,
              text: 'API端点'
            }
          }
        }
      }
    });
    
    // 认证API图表
    const authCtx = document.getElementById('authChart').getContext('2d');
    new Chart(authCtx, {
      type: 'bar',
      data: {
        labels: ${JSON.stringify(Object.keys(authResults))},
        datasets: [
          {
            label: '平均响应时间 (ms)',
            data: ${JSON.stringify(Object.values(authResults).map(data => data.avg ? parseFloat(data.avg.toFixed(2)) : 0))},
            backgroundColor: 'rgba(54, 162, 235, 0.5)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1
          },
          {
            label: '95%响应时间 (ms)',
            data: ${JSON.stringify(Object.values(authResults).map(data => data.p95 ? parseFloat(data.p95.toFixed(2)) : 0))},
            backgroundColor: 'rgba(255, 99, 132, 0.5)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: '响应时间 (ms)'
            }
          },
          x: {
            title: {
              display: true,
              text: 'API端点'
            }
          }
        }
      }
    });
  </script>
</body>
</html>
  `;
  
  fs.writeFileSync('tutor-performance-results.html', htmlContent);
  console.log('可视化结果已保存到 tutor-performance-results.html');
}

// 清理测试数据
async function cleanupTestData() {
  if (testTeacherToken && testTutorProfileId) {
    try {
      console.log('\n开始清理测试数据...');
      const headers = {
        'Authorization': `Bearer ${testTeacherToken}`
      };
      
      // 删除教师资料
      await axios.delete(`${BASE_URL}/tutorProfiles/profile`, { headers });
      console.log('教师资料已删除');
      
      console.log('测试数据清理完成');
    } catch (error) {
      console.error('清理测试数据出错:', error.message);
    }
  }
}

// 主测试函数
async function runTest() {
  console.log('开始教师路由性能测试...');
  
  // 注册测试教师
  const registerSuccess = await registerTeacher();
  if (!registerSuccess) {
    console.error('教师注册失败，测试终止');
    return;
  }
  
  // 登录测试教师
  const loginSuccess = await loginTeacher();
  if (!loginSuccess) {
    console.error('教师登录失败，测试终止');
    return;
  }
  
  // 创建教师资料
  const profileSuccess = await createTutorProfile();
  if (!profileSuccess) {
    console.error('教师资料创建失败，测试终止');
    return;
  }
  
  // 测试公共端点
  const publicResults = await testPublicEndpoints();
  
  // 测试需要认证的端点
  const authResults = await testAuthEndpoints();
  
  // 生成HTML报告
  generateHtmlReport(publicResults, authResults);
  
  // 清理测试数据
  await cleanupTestData();
  
  console.log('\n所有测试完成！');
}

// 运行测试
runTest().catch(error => {
  console.error('测试过程中发生错误:', error);
});
