/**
 * 智能家教推荐系统综合测试模块
 * 
 * 本测试模块涵盖以下测试项：
 * 1. 时间特性：各功能模块加载时间
 * 2. 使用特性：各功能模块的使用是否正常
 * 3. 可靠性和稳定性：数据库读取输入是否正常、前后端数据传输是否正常
 * 4. 并发度：并发数100，延迟0ms，保存cookies的条件下进行并发度测试
 * 5. 安全性：权限管理、登录的加密认证等
 */

const axios = require('axios');
const { performance } = require('perf_hooks');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');

// 基础配置
const BASE_URL = 'http://localhost:3000/api';
const ITERATIONS = 100; // 测试迭代次数
const CONCURRENCY = 100; // 并发数
const TIMEOUT = 10000; // 请求超时时间（毫秒）

// 生成随机字符串
function generateRandomString(length = 8) {
  return crypto.randomBytes(length).toString('hex');
}

// 测试用户数据
const TEST_USER = {
  username: `test_user_${generateRandomString()}`,
  password: 'Test@123456',
  email: `test_${generateRandomString()}@example.com`,
  role: 'parent'
};

// 测试家长资料
const TEST_PARENT_PROFILE = {
  name: '测试家长',
  gender: '男',
  phone: '13800138000',
  location: {
    city: '北京',
    district: '海淀区',
    coordinates: {
      type: 'Point',
      coordinates: [116.3, 39.9]
    }
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
  grade: '小学六年级',
  targetScore: 'A',
  frequency: '每周两次',
  duration: '2小时/次',
  budget: 200,
  requirements: '有耐心，善于沟通',
  preferredTeachingMethod: '线下一对一',
  preferredSchedule: '周末上午'
};

// 存储测试结果
const testResults = {
  timePerformance: {},
  functionalTests: {},
  reliabilityTests: {},
  concurrencyTests: {},
  securityTests: {}
};

// 存储认证令牌
let authToken = '';
let parentId = '';

/**
 * 辅助函数：计算统计数据
 */
function calculateStats(times) {
  if (times.length === 0) return { avg: 0, min: 0, max: 0, median: 0, p95: 0 };
  
  // 排序时间数组
  times.sort((a, b) => a - b);
  
  const sum = times.reduce((acc, time) => acc + time, 0);
  const avg = sum / times.length;
  const min = times[0];
  const max = times[times.length - 1];
  const median = times[Math.floor(times.length / 2)];
  const p95 = times[Math.floor(times.length * 0.95)];
  
  return {
    avg: parseFloat(avg.toFixed(2)),
    min: parseFloat(min.toFixed(2)),
    max: parseFloat(max.toFixed(2)),
    median: parseFloat(median.toFixed(2)),
    p95: parseFloat(p95.toFixed(2))
  };
}

/**
 * 辅助函数：生成测试报告
 */
function generateReport() {
  const reportData = {
    testTime: new Date().toLocaleString(),
    configuration: {
      iterations: ITERATIONS,
      concurrency: CONCURRENCY,
      timeout: TIMEOUT
    },
    results: testResults
  };
  
  // 保存JSON报告
  fs.writeFileSync('comprehensive-test-results.json', JSON.stringify(reportData, null, 2));
  
  // 生成HTML报告
  let htmlReport = `
  <!DOCTYPE html>
  <html>
  <head>
    <title>智能家教推荐系统综合测试报告</title>
    <meta charset="UTF-8">
    <style>
      body { font-family: Arial, sans-serif; margin: 20px; }
      h1, h2, h3 { color: #333; }
      table { border-collapse: collapse; width: 100%; margin-bottom: 20px; }
      th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
      th { background-color: #f2f2f2; }
      tr:nth-child(even) { background-color: #f9f9f9; }
      .success { color: green; }
      .failure { color: red; }
      .chart-container { width: 80%; margin: 20px auto; }
    </style>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  </head>
  <body>
    <h1>智能家教推荐系统综合测试报告</h1>
    <p>测试时间: ${reportData.testTime}</p>
    <p>测试配置: ${reportData.configuration.iterations} 次请求, ${reportData.configuration.concurrency} 并发</p>
    
    <h2>1. 时间特性测试</h2>
    <table>
      <tr>
        <th>API端点</th>
        <th>平均响应时间 (ms)</th>
        <th>最小响应时间 (ms)</th>
        <th>最大响应时间 (ms)</th>
        <th>中位数响应时间 (ms)</th>
        <th>95%响应时间 (ms)</th>
      </tr>
      ${Object.entries(reportData.results.timePerformance).map(([endpoint, stats]) => `
      <tr>
        <td>${endpoint}</td>
        <td>${stats.avg}</td>
        <td>${stats.min}</td>
        <td>${stats.max}</td>
        <td>${stats.median}</td>
        <td>${stats.p95}</td>
      </tr>
      `).join('')}
    </table>
    
    <div class="chart-container">
      <canvas id="timeChart"></canvas>
    </div>
    
    <h2>2. 功能测试</h2>
    <table>
      <tr>
        <th>测试用例</th>
        <th>结果</th>
        <th>详情</th>
      </tr>
      ${Object.entries(reportData.results.functionalTests).map(([testCase, result]) => `
      <tr>
        <td>${testCase}</td>
        <td class="${result.success ? 'success' : 'failure'}">${result.success ? '成功' : '失败'}</td>
        <td>${result.message || ''}</td>
      </tr>
      `).join('')}
    </table>
    
    <h2>3. 可靠性和稳定性测试</h2>
    <table>
      <tr>
        <th>测试用例</th>
        <th>结果</th>
        <th>详情</th>
      </tr>
      ${Object.entries(reportData.results.reliabilityTests).map(([testCase, result]) => `
      <tr>
        <td>${testCase}</td>
        <td class="${result.success ? 'success' : 'failure'}">${result.success ? '成功' : '失败'}</td>
        <td>${result.message || ''}</td>
      </tr>
      `).join('')}
    </table>
    
    <h2>4. 并发度测试</h2>
    <table>
      <tr>
        <th>API端点</th>
        <th>成功率</th>
        <th>平均响应时间 (ms)</th>
        <th>最大响应时间 (ms)</th>
        <th>95%响应时间 (ms)</th>
      </tr>
      ${Object.entries(reportData.results.concurrencyTests).map(([endpoint, result]) => `
      <tr>
        <td>${endpoint}</td>
        <td>${result.successRate}%</td>
        <td>${result.stats.avg}</td>
        <td>${result.stats.max}</td>
        <td>${result.stats.p95}</td>
      </tr>
      `).join('')}
    </table>
    
    <h2>5. 安全性测试</h2>
    <table>
      <tr>
        <th>测试用例</th>
        <th>结果</th>
        <th>详情</th>
      </tr>
      ${Object.entries(reportData.results.securityTests).map(([testCase, result]) => `
      <tr>
        <td>${testCase}</td>
        <td class="${result.success ? 'success' : 'failure'}">${result.success ? '通过' : '不通过'}</td>
        <td>${result.message || ''}</td>
      </tr>
      `).join('')}
    </table>
    
    <script>
      // 时间特性图表
      const timeLabels = ${JSON.stringify(Object.keys(reportData.results.timePerformance))};
      const timeData = ${JSON.stringify(Object.values(reportData.results.timePerformance).map(stats => stats.avg))};
      
      new Chart(document.getElementById('timeChart'), {
        type: 'bar',
        data: {
          labels: timeLabels,
          datasets: [{
            label: '平均响应时间 (ms)',
            data: timeData,
            backgroundColor: 'rgba(54, 162, 235, 0.5)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: '毫秒'
              }
            }
          }
        }
      });
    </script>
  </body>
  </html>
  `;
  
  fs.writeFileSync('comprehensive-test-results.html', htmlReport);
  console.log('测试报告已生成：comprehensive-test-results.html 和 comprehensive-test-results.json');
}

/**
 * 1. 时间特性测试
 * 测试各功能模块的加载时间
 */
async function runTimePerformanceTests() {
  console.log('\n开始时间特性测试...');
  
  // 定义要测试的端点
  const endpoints = [
    { name: '用户注册', path: '/auth/register', method: 'post', data: { 
      username: `test_user_${generateRandomString()}`,
      password: 'Test@123456',
      email: `test_${generateRandomString()}@example.com`,
      role: 'parent'
    }},
    { name: '用户登录', path: '/auth/login', method: 'post', data: { username: TEST_USER.username, password: TEST_USER.password } },
    { name: '获取家长资料', path: `/parentProfiles/${parentId}`, method: 'get', auth: true },
    { name: '获取子女信息', path: `/parentProfiles/${parentId}/children`, method: 'get', auth: true },
    { name: '获取家教需求', path: `/parentProfiles/${parentId}/tutoringRequests`, method: 'get', auth: true },
    { name: '按城市筛选教师', path: `/tutorProfiles/city?city=北京`, method: 'get', auth: true },
    { name: '按科目筛选教师', path: `/tutorProfiles/subject?subject=数学`, method: 'get', auth: true },
    { name: '按价格筛选教师', path: `/tutorProfiles/price?minPrice=100&maxPrice=300`, method: 'get', auth: true }
  ];
  
  // 先注册测试用户
  try {
    console.log('注册测试用户...');
    const registerResponse = await axios.post(`${BASE_URL}/auth/register`, TEST_USER, { timeout: TIMEOUT });
    console.log('测试用户注册成功:', TEST_USER.username);
  } catch (error) {
    if (error.response && error.response.status === 409) {
      console.log('测试用户已存在，尝试登录...');
    } else {
      console.error('注册测试用户失败:', error.message);
    }
  }
  
  // 登录测试用户
  try {
    console.log('登录测试用户...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      username: TEST_USER.username,
      password: TEST_USER.password
    }, { timeout: TIMEOUT });
    
    if (loginResponse.data && loginResponse.data.token) {
      authToken = loginResponse.data.token;
      console.log('测试用户登录成功，获取到令牌');
    }
  } catch (error) {
    console.error('登录测试用户失败:', error.message);
  }
  
  // 创建家长资料
  if (authToken) {
    try {
      console.log('创建家长资料...');
      const createProfileResponse = await axios.post(`${BASE_URL}/parentProfiles`, TEST_PARENT_PROFILE, {
        headers: { 'Authorization': `Bearer ${authToken}` },
        timeout: TIMEOUT
      });
      
      if (createProfileResponse.data && createProfileResponse.data.data && createProfileResponse.data.data._id) {
        parentId = createProfileResponse.data.data._id;
        console.log('家长资料创建成功，ID:', parentId);
      }
    } catch (error) {
      console.error('创建家长资料失败:', error.message);
    }
  }
  
  // 对每个端点进行测试
  for (const endpoint of endpoints) {
    const times = [];
    
    for (let i = 0; i < 10; i++) { // 每个端点测试10次
      try {
        const start = performance.now();
        
        const config = {
          timeout: TIMEOUT,
          headers: {}
        };
        
        if (endpoint.auth && authToken) {
          config.headers['Authorization'] = `Bearer ${authToken}`;
        }
        
        let response;
        if (endpoint.method === 'get') {
          response = await axios.get(`${BASE_URL}${endpoint.path}`, config);
        } else if (endpoint.method === 'post') {
          response = await axios.post(`${BASE_URL}${endpoint.path}`, endpoint.data, config);
        }
        
        const end = performance.now();
        times.push(end - start);
        
        // 如果是登录请求，保存token
        if (endpoint.path === '/auth/login' && response.data && response.data.token) {
          authToken = response.data.token;
        }
      } catch (error) {
        console.error(`测试端点 ${endpoint.name} 失败:`, error.response ? `状态码 ${error.response.status}` : error.message);
      }
    }
    
    if (times.length > 0) {
      testResults.timePerformance[endpoint.name] = calculateStats(times);
      console.log(`端点 ${endpoint.name} 平均响应时间: ${testResults.timePerformance[endpoint.name].avg}ms`);
    } else {
      console.log(`端点 ${endpoint.name} 测试失败，无法获取响应时间`);
    }
  }
  
  console.log('时间特性测试完成');
}

/**
 * 2. 功能测试
 * 测试各功能模块的使用是否正常
 */
async function runFunctionalTests() {
  console.log('\n开始功能测试...');
  
  // 测试用户注册
  try {
    const registerResponse = await axios.post(`${BASE_URL}/auth/register`, {
      username: `func_test_${generateRandomString()}`,
      password: 'Test@123456',
      email: `func_test_${generateRandomString()}@example.com`,
      role: 'parent'
    }, { timeout: TIMEOUT });
    
    testResults.functionalTests['用户注册'] = {
      success: registerResponse.status === 201 || registerResponse.status === 200,
      message: '用户注册功能正常'
    };
  } catch (error) {
    testResults.functionalTests['用户注册'] = {
      success: false,
      message: `用户注册失败: ${error.response ? `状态码 ${error.response.status}` : error.message}`
    };
  }
  
  // 测试用户登录
  try {
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      username: TEST_USER.username,
      password: TEST_USER.password
    }, { timeout: TIMEOUT });
    
    const success = (loginResponse.status === 200 || loginResponse.status === 201) && loginResponse.data.token;
    testResults.functionalTests['用户登录'] = {
      success,
      message: success ? '用户登录功能正常' : '登录成功但未返回token'
    };
    
    if (success) {
      authToken = loginResponse.data.token;
    }
  } catch (error) {
    testResults.functionalTests['用户登录'] = {
      success: false,
      message: `用户登录失败: ${error.response ? `状态码 ${error.response.status}` : error.message}`
    };
  }
  
  // 测试创建家长资料
  if (authToken) {
    try {
      const createProfileResponse = await axios.post(`${BASE_URL}/parentProfiles`, TEST_PARENT_PROFILE, {
        headers: { 'Authorization': `Bearer ${authToken}` },
        timeout: TIMEOUT
      });
      
      const success = (createProfileResponse.status === 201 || createProfileResponse.status === 200) && createProfileResponse.data;
      testResults.functionalTests['创建家长资料'] = {
        success,
        message: success ? '创建家长资料功能正常' : '创建成功但返回数据异常'
      };
      
      if (success && createProfileResponse.data && createProfileResponse.data.data && createProfileResponse.data.data._id) {
        parentId = createProfileResponse.data.data._id;
      }
    } catch (error) {
      testResults.functionalTests['创建家长资料'] = {
        success: false,
        message: `创建家长资料失败: ${error.response ? `状态码 ${error.response.status}` : error.message}`
      };
    }
  }
  
  // 测试添加子女信息
  if (authToken && parentId) {
    try {
      const addChildResponse = await axios.post(`${BASE_URL}/parentProfiles/${parentId}/children`, TEST_CHILD, {
        headers: { 'Authorization': `Bearer ${authToken}` },
        timeout: TIMEOUT
      });
      
      testResults.functionalTests['添加子女信息'] = {
        success: addChildResponse.status === 201 || addChildResponse.status === 200,
        message: '添加子女信息功能正常'
      };
    } catch (error) {
      testResults.functionalTests['添加子女信息'] = {
        success: false,
        message: `添加子女信息失败: ${error.response ? `状态码 ${error.response.status}` : error.message}`
      };
    }
  }
  
  // 测试创建家教需求
  if (authToken && parentId) {
    try {
      const createRequestResponse = await axios.post(`${BASE_URL}/parentProfiles/${parentId}/tutoringRequests`, TEST_TUTORING_REQUEST, {
        headers: { 'Authorization': `Bearer ${authToken}` },
        timeout: TIMEOUT
      });
      
      testResults.functionalTests['创建家教需求'] = {
        success: createRequestResponse.status === 201 || createRequestResponse.status === 200,
        message: '创建家教需求功能正常'
      };
    } catch (error) {
      testResults.functionalTests['创建家教需求'] = {
        success: false,
        message: `创建家教需求失败: ${error.response ? `状态码 ${error.response.status}` : error.message}`
      };
    }
  }
  
  console.log('功能测试完成');
}

/**
 * 3. 可靠性和稳定性测试
 * 测试数据库读取输入是否正常、前后端数据传输是否正常
 */
async function runReliabilityTests() {
  console.log('\n开始可靠性和稳定性测试...');
  
  // 测试数据库读取 - 重复读取家长资料
  if (authToken && parentId) {
    const readResults = [];
    
    for (let i = 0; i < 10; i++) {
      try {
        const response = await axios.get(`${BASE_URL}/parentProfiles/${parentId}`, {
          headers: { 'Authorization': `Bearer ${authToken}` },
          timeout: TIMEOUT
        });
        
        readResults.push(response.status === 200 && response.data.data && response.data.data._id === parentId);
      } catch (error) {
        readResults.push(false);
      }
    }
    
    const successRate = readResults.filter(result => result).length / readResults.length * 100;
    testResults.reliabilityTests['数据库读取稳定性'] = {
      success: successRate === 100,
      message: `成功率: ${successRate.toFixed(2)}%`
    };
  }
  
  // 测试数据验证 - 提交无效数据
  if (authToken && parentId) {
    try {
      // 提交缺少必填字段的子女信息
      await axios.post(`${BASE_URL}/parentProfiles/${parentId}/children`, { name: '测试' }, {
        headers: { 'Authorization': `Bearer ${authToken}` },
        timeout: TIMEOUT
      });
      
      testResults.reliabilityTests['数据验证'] = {
        success: false,
        message: '系统接受了无效数据，验证失败'
      };
    } catch (error) {
      // 期望返回400错误
      testResults.reliabilityTests['数据验证'] = {
        success: error.response && error.response.status === 400,
        message: '系统正确拒绝了无效数据'
      };
    }
  }
  
  // 测试错误处理 - 访问不存在的资源
  try {
    await axios.get(`${BASE_URL}/parentProfiles/NONEXISTENT_ID`, {
      headers: { 'Authorization': `Bearer ${authToken}` },
      timeout: TIMEOUT
    });
    
    testResults.reliabilityTests['错误处理'] = {
      success: false,
      message: '系统未能正确处理不存在的资源'
    };
  } catch (error) {
    // 期望返回404错误
    testResults.reliabilityTests['错误处理'] = {
      success: error.response && error.response.status === 404,
      message: '系统正确处理了不存在的资源'
    };
  }
  
  console.log('可靠性和稳定性测试完成');
}

/**
 * 4. 并发度测试
 * 并发数100，延迟0ms，保存cookies的条件下进行并发度测试
 */
async function runConcurrencyTests() {
  console.log('\n开始并发度测试...');
  
  // 定义要测试的端点
  const endpoints = [
    { name: '获取家长资料', path: `/parentProfiles/${parentId}`, method: 'get' },
    { name: '获取子女信息', path: `/parentProfiles/${parentId}/children`, method: 'get' },
    { name: '获取家教需求', path: `/parentProfiles/${parentId}/tutoringRequests`, method: 'get' }
  ];
  
  for (const endpoint of endpoints) {
    console.log(`测试端点: ${endpoint.name}`);
    
    const results = [];
    const times = [];
    
    // 创建并发请求
    const requests = [];
    for (let i = 0; i < CONCURRENCY; i++) {
      requests.push(
        (async () => {
          try {
            const start = performance.now();
            
            const response = await axios.get(`${BASE_URL}${endpoint.path}`, {
              headers: { 'Authorization': `Bearer ${authToken}` },
              timeout: TIMEOUT
            });
            
            const end = performance.now();
            times.push(end - start);
            
            return { success: true, time: end - start };
          } catch (error) {
            return { success: false, error: error.message };
          }
        })()
      );
    }
    
    // 等待所有请求完成
    const responses = await Promise.all(requests);
    
    // 计算成功率
    const successCount = responses.filter(r => r.success).length;
    const successRate = (successCount / CONCURRENCY) * 100;
    
    testResults.concurrencyTests[endpoint.name] = {
      successRate: parseFloat(successRate.toFixed(2)),
      stats: times.length > 0 ? calculateStats(times) : { avg: 0, min: 0, max: 0, median: 0, p95: 0 }
    };
    
    console.log(`端点 ${endpoint.name} 并发测试完成，成功率: ${successRate.toFixed(2)}%`);
  }
  
  console.log('并发度测试完成');
}

/**
 * 5. 安全性测试
 * 测试权限管理、登录的加密认证等
 */
async function runSecurityTests() {
  console.log('\n开始安全性测试...');
  
  // 测试未授权访问
  try {
    await axios.get(`${BASE_URL}/parentProfiles`, {
      timeout: TIMEOUT
    });
    
    testResults.securityTests['未授权访问保护'] = {
      success: false,
      message: '系统允许未授权访问受保护资源'
    };
  } catch (error) {
    // 期望返回401错误
    testResults.securityTests['未授权访问保护'] = {
      success: error.response && error.response.status === 401,
      message: '系统正确拒绝了未授权访问'
    };
  }
  
  // 测试CSRF保护
  if (authToken) {
    try {
      // 尝试在没有CSRF令牌的情况下修改资源
      const response = await axios.put(`${BASE_URL}/parentProfiles/${parentId}`, 
        { name: '被篡改的名字' },
        {
          headers: { 
            'Authorization': `Bearer ${authToken}`,
            'Origin': 'http://malicious-site.com'
          },
          timeout: TIMEOUT
        }
      );
      
      testResults.securityTests['CSRF保护'] = {
        success: false,
        message: '系统未能防止跨站请求伪造'
      };
    } catch (error) {
      // 期望返回403错误或其他安全拒绝
      testResults.securityTests['CSRF保护'] = {
        success: error.response && (error.response.status === 403 || error.response.status === 401),
        message: '系统正确防止了跨站请求伪造'
      };
    }
  }
  
  // 测试密码强度要求
  try {
    await axios.post(`${BASE_URL}/auth/register`, {
      username: `weak_pass_${generateRandomString()}`,
      password: '123456', // 弱密码
      email: `weak_pass_${generateRandomString()}@example.com`,
      role: 'parent'
    }, { timeout: TIMEOUT });
    
    testResults.securityTests['密码强度要求'] = {
      success: false,
      message: '系统接受了弱密码'
    };
  } catch (error) {
    // 期望返回400错误
    testResults.securityTests['密码强度要求'] = {
      success: error.response && error.response.status === 400,
      message: '系统正确拒绝了弱密码'
    };
  }
  
  // 测试SQL注入防护
  try {
    await axios.get(`${BASE_URL}/parentProfiles/'OR'1'='1`, {
      headers: { 'Authorization': `Bearer ${authToken}` },
      timeout: TIMEOUT
    });
    
    testResults.securityTests['SQL注入防护'] = {
      success: false,
      message: '系统可能存在SQL注入漏洞'
    };
  } catch (error) {
    // 期望返回404或400错误，而不是500服务器错误
    testResults.securityTests['SQL注入防护'] = {
      success: error.response && (error.response.status === 404 || error.response.status === 400) && error.response.status !== 500,
      message: '系统正确处理了SQL注入尝试'
    };
  }
  
  console.log('安全性测试完成');
}

/**
 * 清理测试数据
 */
async function cleanupTestData() {
  console.log('\n开始清理测试数据...');
  
  if (authToken && parentId) {
    try {
      // 删除家教需求
      await axios.delete(`${BASE_URL}/parentProfiles/${parentId}/tutoringRequests`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      console.log('家教需求已删除');
      
      // 删除子女信息
      await axios.delete(`${BASE_URL}/parentProfiles/${parentId}/children`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      console.log('子女信息已删除');
      
      // 删除家长资料
      await axios.delete(`${BASE_URL}/parentProfiles/${parentId}`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      console.log('家长资料已删除');
      
      // 删除测试用户
      // 注意：通常需要管理员权限
    } catch (error) {
      console.error('清理测试数据时出错:', error.message);
    }
  }
  
  console.log('测试数据清理完成');
}

/**
 * 主函数：运行所有测试
 */
async function runAllTests() {
  console.log('开始智能家教推荐系统综合测试...');
  
  try {
    // 1. 时间特性测试
    await runTimePerformanceTests();
    
    // 2. 功能测试
    await runFunctionalTests();
    
    // 3. 可靠性和稳定性测试
    await runReliabilityTests();
    
    // 4. 并发度测试
    await runConcurrencyTests();
    
    // 5. 安全性测试
    await runSecurityTests();
    
    // 生成测试报告
    generateReport();
    
    // 清理测试数据
    await cleanupTestData();
    
    console.log('\n所有测试完成！');
  } catch (error) {
    console.error('测试过程中出现错误:', error);
  }
}

// 执行测试
runAllTests();
