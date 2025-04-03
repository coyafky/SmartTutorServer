/**
 * 家长路由性能测试脚本
 * 测试内容：家长注册、登录和资料管理相关API的性能
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
const TEST_PARENT = {
  username: `parent_${Date.now()}`,
  password: 'Test12345',
  email: `parent_${Date.now()}@example.com`,
  role: 'parent'
};

// 测试家长资料
const PARENT_PROFILE = {
  name: '测试家长',
  gender: '男',
  phone: '13800138000',
  address: {
    city: '北京',
    district: '海淀区',
    detailAddress: '中关村科技园'
  },
  preferredContactMethod: '电话',
  preferredContactTime: '晚上'
};

// 测试子女信息
const TEST_CHILD = {
  name: '测试学生',
  nickname: '小测试',
  gender: '男',
  age: 12,
  grade: '小学六年级',
  school: '测试小学',
  subjects: [
    {
      name: '数学',
      currentLevel: '良好',
      targetLevel: '优秀',
      learningGoals: '提高解题能力'
    },
    {
      name: '英语',
      currentLevel: '一般',
      targetLevel: '良好',
      learningGoals: '提高口语和听力'
    }
  ],
  learningStyle: '自主学习',
  academicPerformance: '良好',
  interests: ['编程', '绘画']
};

// 测试家教需求
const TEST_TUTORING_REQUEST = {
  title: '寻找数学家教',
  subject: '数学',
  grade: '六年级',
  targetScore: 'A',
  frequency: '每周两次',
  duration: '2小时/次',
  budget: 200,
  requirements: '有耐心，善于引导',
  location: {
    city: '北京',
    district: '海淀区'
  },
  preferredTeachingMethod: '线下',
  urgency: '一般'
};

// 公共API端点
const PUBLIC_ENDPOINTS = [];

// 需要认证的端点
const AUTH_ENDPOINTS = [
  { path: '/parentProfiles/:parentId', method: 'get' },
  { path: '/parentProfiles/:parentId/children', method: 'get' },
  { path: '/parentProfiles/:parentId/tutors/city', method: 'get', query: '?city=北京' },
  { path: '/parentProfiles/:parentId/tutors/subject', method: 'get', query: '?subject=数学' },
  { path: '/parentProfiles/:parentId/tutors/location', method: 'get', query: '?longitude=116.3&latitude=39.9' },
  { path: '/parentProfiles/:parentId/tutors/price', method: 'get', query: '?minPrice=100&maxPrice=300' },
  { path: '/parentProfiles/:parentId/tutors/education', method: 'get', query: '?educationLevel=本科' },
  { path: '/parentProfiles/:parentId/tutors/filter', method: 'get', query: '?subject=数学&minPrice=100&maxPrice=300' },
  { path: '/parentProfiles/:parentId/tutoringRequests', method: 'get' }
];

// 需要POST/PUT的端点测试数据
const TEST_DATA = {
  '/parentProfiles/:parentId/children': TEST_CHILD,
  '/parentProfiles/:parentId/tutoringRequests': TEST_TUTORING_REQUEST
};

// 全局变量
let testParentToken = '';
let testParentId = '';
let testChildId = '';

// 注册新家长
async function registerParent() {
  try {
    console.log('正在注册测试家长账号...');
    const response = await axios.post(`${BASE_URL}/auth/register`, TEST_PARENT);
    
    if (response.data && response.data.status === 'success') {
      console.log('家长账号注册成功');
      testParentId = response.data.data.user.customId || response.data.data.user._id;
      return true;
    } else {
      console.error('家长账号注册失败:', response.data);
      return false;
    }
  } catch (error) {
    console.error('家长账号注册出错:', error.message);
    if (error.response) {
      console.error('错误详情:', error.response.data);
      
      // 如果是重复用户名错误，尝试使用新用户名
      if (error.response.data.message && error.response.data.message.includes('已存在')) {
        TEST_PARENT.username = `parent_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        TEST_PARENT.email = `${TEST_PARENT.username}@example.com`;
        console.log(`尝试使用新用户名: ${TEST_PARENT.username}`);
        return await registerParent();
      }
    }
    return false;
  }
}

// 登录家长账号
async function loginParent() {
  try {
    console.log('正在登录测试家长账号...');
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      username: TEST_PARENT.username,
      password: TEST_PARENT.password
    });
    
    if (response.data && response.data.status === 'success') {
      testParentToken = response.data.token || response.data.data.token;
      testParentId = testParentId || response.data.data.user._id;
      console.log('家长账号登录成功');
      return true;
    } else {
      console.error('家长账号登录失败:', response.data);
      return false;
    }
  } catch (error) {
    console.error('家长账号登录出错:', error.message);
    if (error.response) {
      console.error('错误详情:', error.response.data);
    }
    return false;
  }
}

// 创建家长资料
async function createParentProfile() {
  console.log('正在创建家长资料...');
  try {
    const headers = {
      'Authorization': `Bearer ${testParentToken}`
    };
    
    const response = await axios.post(`${BASE_URL}/parentProfiles`, PARENT_PROFILE, {
      headers,
      timeout: TIMEOUT
    });
    
    if (response.data && response.data.profile) {
      if (response.data.profile._id) {
        testParentId = response.data.profile._id;
      }
      console.log('家长资料创建成功');
      return true;
    } else {
      console.error('家长资料创建失败：响应数据格式不符合预期');
      return false;
    }
  } catch (error) {
    console.error('家长资料创建失败：', error.message);
    if (error.response) {
      console.error('错误详情：', error.response.data);
    }
    return false;
  }
}

// 创建子女信息
async function createChild() {
  console.log('正在创建子女信息...');
  try {
    const headers = {
      'Authorization': `Bearer ${testParentToken}`
    };
    
    const response = await axios.post(`${BASE_URL}/parentProfiles/${testParentId}/children`, TEST_CHILD, {
      headers,
      timeout: TIMEOUT
    });
    
    if (response.data && response.data.child) {
      if (response.data.child._id) {
        testChildId = response.data.child._id;
      }
      console.log('子女信息创建成功');
      return true;
    } else {
      console.error('子女信息创建失败：响应数据格式不符合预期');
      return false;
    }
  } catch (error) {
    console.error('子女信息创建失败：', error.message);
    if (error.response) {
      console.error('错误详情：', error.response.data);
    }
    return false;
  }
}

// 测试公共API端点
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
    'Authorization': `Bearer ${testParentToken}`
  };
  
  for (const endpoint of AUTH_ENDPOINTS) {
    const times = [];
    const errors = [];
    
    // 替换路径中的参数
    let path = endpoint.path.replace(':parentId', testParentId);
    if (path.includes(':childId') && testChildId) {
      path = path.replace(':childId', testChildId);
    }
    
    // 添加查询参数
    if (endpoint.query) {
      path += endpoint.query;
    }
    
    console.log(`\n测试端点: ${path}`);
    
    // 确定请求方法和数据
    const method = endpoint.method || 'get';
    let data = null;
    
    if ((method === 'post' || method === 'put') && TEST_DATA[endpoint.path]) {
      data = TEST_DATA[endpoint.path];
    }
    
    // 并发请求
    const requests = Array(CONCURRENCY)
      .fill()
      .map(async () => {
        for (let i = 0; i < ITERATIONS / CONCURRENCY; i++) {
          const start = performance.now();
          try {
            if (method === 'get') {
              await axios.get(`${BASE_URL}${path}`, { 
                headers,
                timeout: TIMEOUT
              });
            } else if (method === 'post') {
              await axios.post(`${BASE_URL}${path}`, data, { 
                headers,
                timeout: TIMEOUT
              });
            } else if (method === 'put') {
              await axios.put(`${BASE_URL}${path}`, data, { 
                headers,
                timeout: TIMEOUT
              });
            } else if (method === 'delete') {
              await axios.delete(`${BASE_URL}${path}`, { 
                headers,
                timeout: TIMEOUT
              });
            }
            const end = performance.now();
            times.push(end - start);
          } catch (error) {
            errors.push(error.message);
            if (errors.length <= 3 && error.response) {
              console.error(`请求错误 (${path}): ${error.response.status} - ${JSON.stringify(error.response.data)}`);
            }
          }
        }
      });
    
    await Promise.all(requests);
    
    // 如果没有成功的请求，跳过统计
    if (times.length === 0) {
      console.log(`端点 ${path} 没有成功的请求，跳过统计`);
      results[path] = { 
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
    
    results[path] = { avg, min, max, median, p95, successRate, times };
    
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
  const html = `
  <!DOCTYPE html>
  <html lang="zh-CN">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>家长路由性能测试结果</title>
    <style>
      body { font-family: Arial, sans-serif; margin: 20px; }
      h1, h2 { color: #333; }
      table { border-collapse: collapse; width: 100%; margin-bottom: 20px; }
      th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
      th { background-color: #f2f2f2; }
      tr:nth-child(even) { background-color: #f9f9f9; }
      .success { color: green; }
      .warning { color: orange; }
      .error { color: red; }
      .chart-container { width: 100%; height: 400px; margin-bottom: 30px; }
    </style>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  </head>
  <body>
    <h1>家长路由性能测试结果</h1>
    <p>测试时间: ${new Date().toLocaleString()}</p>
    <p>测试配置: ${ITERATIONS} 次请求, ${CONCURRENCY} 并发</p>
    
    <h2>公共API端点</h2>
    ${
      Object.keys(publicResults).length > 0 
      ? `
      <table>
        <tr>
          <th>端点</th>
          <th>成功率</th>
          <th>平均 (ms)</th>
          <th>最小 (ms)</th>
          <th>最大 (ms)</th>
          <th>中位数 (ms)</th>
          <th>95% (ms)</th>
        </tr>
        ${Object.entries(publicResults).map(([endpoint, data]) => `
        <tr>
          <td>${endpoint}</td>
          <td class="${data.successRate === '100.00%' ? 'success' : data.successRate === '0%' ? 'error' : 'warning'}">${data.successRate}</td>
          <td>${data.avg ? data.avg.toFixed(2) : 'N/A'}</td>
          <td>${data.min ? data.min.toFixed(2) : 'N/A'}</td>
          <td>${data.max ? data.max.toFixed(2) : 'N/A'}</td>
          <td>${data.median ? data.median.toFixed(2) : 'N/A'}</td>
          <td>${data.p95 ? data.p95.toFixed(2) : 'N/A'}</td>
        </tr>
        `).join('')}
      </table>
      
      <div class="chart-container">
        <canvas id="publicChart"></canvas>
      </div>
      ` 
      : '<p>没有测试公共API端点</p>'
    }
    
    <h2>需要认证的API端点</h2>
    ${
      Object.keys(authResults).length > 0 
      ? `
      <table>
        <tr>
          <th>端点</th>
          <th>成功率</th>
          <th>平均 (ms)</th>
          <th>最小 (ms)</th>
          <th>最大 (ms)</th>
          <th>中位数 (ms)</th>
          <th>95% (ms)</th>
        </tr>
        ${Object.entries(authResults).map(([endpoint, data]) => `
        <tr>
          <td>${endpoint}</td>
          <td class="${data.successRate === '100.00%' ? 'success' : data.successRate === '0%' ? 'error' : 'warning'}">${data.successRate}</td>
          <td>${data.avg ? data.avg.toFixed(2) : 'N/A'}</td>
          <td>${data.min ? data.min.toFixed(2) : 'N/A'}</td>
          <td>${data.max ? data.max.toFixed(2) : 'N/A'}</td>
          <td>${data.median ? data.median.toFixed(2) : 'N/A'}</td>
          <td>${data.p95 ? data.p95.toFixed(2) : 'N/A'}</td>
        </tr>
        `).join('')}
      </table>
      
      <div class="chart-container">
        <canvas id="authChart"></canvas>
      </div>
      ` 
      : '<p>没有测试需要认证的API端点</p>'
    }
    
    <script>
      // 公共API图表
      ${
        Object.keys(publicResults).length > 0 
        ? `
        const publicCtx = document.getElementById('publicChart').getContext('2d');
        new Chart(publicCtx, {
          type: 'bar',
          data: {
            labels: ${JSON.stringify(Object.keys(publicResults))},
            datasets: [
              {
                label: '平均响应时间 (ms)',
                data: ${JSON.stringify(Object.values(publicResults).map(data => data.avg ? data.avg : 0))},
                backgroundColor: 'rgba(54, 162, 235, 0.5)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
              },
              {
                label: '95% 响应时间 (ms)',
                data: ${JSON.stringify(Object.values(publicResults).map(data => data.p95 ? data.p95 : 0))},
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1
              }
            ]
          },
          options: {
            responsive: true,
            scales: {
              y: {
                beginAtZero: true,
                title: {
                  display: true,
                  text: '响应时间 (ms)'
                }
              }
            }
          }
        });
        ` 
        : ''
      }
      
      // 需要认证的API图表
      ${
        Object.keys(authResults).length > 0 
        ? `
        const authCtx = document.getElementById('authChart').getContext('2d');
        new Chart(authCtx, {
          type: 'bar',
          data: {
            labels: ${JSON.stringify(Object.keys(authResults))},
            datasets: [
              {
                label: '平均响应时间 (ms)',
                data: ${JSON.stringify(Object.values(authResults).map(data => data.avg ? data.avg : 0))},
                backgroundColor: 'rgba(54, 162, 235, 0.5)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
              },
              {
                label: '95% 响应时间 (ms)',
                data: ${JSON.stringify(Object.values(authResults).map(data => data.p95 ? data.p95 : 0))},
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1
              }
            ]
          },
          options: {
            responsive: true,
            scales: {
              y: {
                beginAtZero: true,
                title: {
                  display: true,
                  text: '响应时间 (ms)'
                }
              },
              x: {
                ticks: {
                  maxRotation: 90,
                  minRotation: 45
                }
              }
            }
          }
        });
        ` 
        : ''
      }
    </script>
  </body>
  </html>
  `;
  
  fs.writeFileSync('parent-performance-results.html', html);
  console.log('可视化结果已保存到 parent-performance-results.html');
}

// 清理测试数据
async function cleanupTestData() {
  console.log('\n开始清理测试数据...');
  
  try {
    if (testParentId && testParentToken) {
      const headers = {
        'Authorization': `Bearer ${testParentToken}`
      };
      
      // 删除子女信息
      if (testChildId) {
        try {
          await axios.delete(`${BASE_URL}/parentProfiles/${testParentId}/children/${testChildId}`, {
            headers,
            timeout: TIMEOUT
          });
          console.log('子女信息已删除');
        } catch (error) {
          console.error('删除子女信息失败：', error.message);
        }
      }
      
      // 删除家长资料
      try {
        await axios.delete(`${BASE_URL}/parentProfiles/${testParentId}`, {
          headers,
          timeout: TIMEOUT
        });
        console.log('家长资料已删除');
      } catch (error) {
        console.error('删除家长资料失败：', error.message);
      }
    }
    
    console.log('测试数据清理完成');
  } catch (error) {
    console.error('清理测试数据时出错：', error.message);
  }
}

// 主函数
async function main() {
  console.log('开始家长路由性能测试...');
  
  // 注册和登录测试家长
  const registered = await registerParent();
  if (!registered) {
    console.error('家长账号注册失败，测试终止');
    return;
  }
  
  const loggedIn = await loginParent();
  if (!loggedIn) {
    console.error('家长账号登录失败，测试终止');
    return;
  }
  
  // 创建家长资料
  const profileCreated = await createParentProfile();
  if (!profileCreated) {
    console.log('无法创建家长资料，使用登录获取的ID继续测试');
  }
  
  if (!testParentId) {
    console.error('无法获取家长资料ID，测试终止');
    return;
  }
  
  // 创建子女信息
  const childCreated = await createChild();
  if (!childCreated) {
    console.log('无法创建子女信息，使用默认ID继续测试');
    testChildId = 'defaultChildId';
  }
  
  // 测试公共API端点
  const publicResults = await testPublicEndpoints();
  
  // 测试需要认证的API端点
  const authResults = await testAuthEndpoints();
  
  // 生成HTML报告
  generateHtmlReport(publicResults, authResults);
  
  // 清理测试数据
  await cleanupTestData();
  
  console.log('\n所有测试完成！');
}

// 执行主函数
main().catch(error => {
  console.error('测试过程中出错：', error);
});
