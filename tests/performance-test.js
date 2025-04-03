const axios = require('axios');
const fs = require('fs');
const { performance } = require('perf_hooks');

// 服务器配置
const BASE_URL = 'http://localhost:3000/api';

// 认证信息
const AUTH_TOKEN = ''; // 需要填入有效的认证令牌

// 测试端点 - 根据实际API路径调整
const ENDPOINTS = [
  '/tutorProfiles/tutors', // 公共API，不需要认证
  '/admin/statistics/users', // 需要管理员认证
  '/admin/statistics/matches', // 需要管理员认证
  '/admin/statistics/tutors', // 需要管理员认证
];

// 测试配置
const ITERATIONS = 50; // 每个端点的请求次数
const CONCURRENCY = 5; // 并发请求数
const TIMEOUT = 5000; // 请求超时时间(毫秒)

// 首先获取认证令牌
async function getAuthToken() {
  try {
    console.log('尝试获取认证令牌...');
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      username: 'AdminThree', // 替换为实际管理员账号
      password: '12345678', // 替换为实际密码
    });
    
    // 打印完整响应以便调试
    console.log('登录响应:', JSON.stringify(response.data, null, 2));
    
    // 根据登录控制器的返回格式获取token
    if (response.data && response.data.status === 'success' && response.data.data && response.data.data.token) {
      console.log('成功获取认证令牌');
      return response.data.data.token;
    } else {
      console.error('认证令牌格式不正确:', response.data);
      return null;
    }
  } catch (error) {
    console.error('获取认证令牌失败:', error.message);
    if (error.response) {
      console.error('错误状态码:', error.response.status);
      console.error('错误详情:', error.response.data);
    }
    return null;
  }
}

// 主测试函数
async function runTest() {
  // 获取认证令牌
  const token = AUTH_TOKEN || (await getAuthToken());
  if (!token) {
    console.error('无法获取认证令牌，测试终止');
    return;
  }

  console.log('认证令牌获取成功，开始性能测试...');

  // 设置请求头
  const headers = {
    Authorization: `Bearer ${token}`,
  };

  const results = {};

  for (const endpoint of ENDPOINTS) {
    const times = [];
    console.log(`\n测试端点: ${endpoint}`);

    // 并发请求
    const requests = Array(CONCURRENCY)
      .fill()
      .map(async () => {
        for (let i = 0; i < ITERATIONS / CONCURRENCY; i++) {
          const start = performance.now();
          try {
            await axios.get(`${BASE_URL}${endpoint}`, {
              headers,
              timeout: TIMEOUT,
            });
            const end = performance.now();
            times.push(end - start);
          } catch (error) {
            console.error(`请求失败: ${endpoint}`, error.message);
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

    console.log(`成功率: ${successRate}`);
    console.log(`平均响应时间: ${avg.toFixed(2)}ms`);
    console.log(`最小响应时间: ${min.toFixed(2)}ms`);
    console.log(`最大响应时间: ${max.toFixed(2)}ms`);
    console.log(`中位数响应时间: ${median.toFixed(2)}ms`);
    console.log(`95%响应时间: ${p95.toFixed(2)}ms`);
    console.log('----------------------------');
  }

  // 保存结果
  fs.writeFileSync(
    'performance-results.json',
    JSON.stringify(results, null, 2)
  );
  console.log('测试完成，结果已保存到 performance-results.json');

  // 生成可视化HTML报告
  generateHtmlReport(results);

  return results;
}

// 生成HTML报告
function generateHtmlReport(results) {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Smart_tutor 性能测试结果</title>
  <meta charset="UTF-8">
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 20px;
      background-color: #f5f5f5;
    }
    h1, h2 {
      color: #333;
      text-align: center;
    }
    .chart-container {
      width: 800px;
      height: 400px;
      margin: 20px auto;
      background-color: white;
      padding: 15px;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    .summary {
      max-width: 800px;
      margin: 20px auto;
      background-color: white;
      padding: 15px;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    th, td {
      padding: 8px;
      text-align: left;
      border-bottom: 1px solid #ddd;
    }
    th {
      background-color: #f2f2f2;
    }
    tr:hover {
      background-color: #f5f5f5;
    }
  </style>
</head>
<body>
  <h1>Smart_tutor 性能测试结果</h1>
  
  <div class="summary">
    <h2>测试摘要</h2>
    <table>
      <tr>
        <th>API端点</th>
        <th>成功率</th>
        <th>平均响应时间</th>
        <th>中位数响应时间</th>
        <th>95%响应时间</th>
      </tr>
      ${Object.entries(results)
        .map(
          ([endpoint, data]) => `
      <tr>
        <td>${endpoint}</td>
        <td>${data.successRate || '0%'}</td>
        <td>${data.avg ? data.avg.toFixed(2) + 'ms' : 'N/A'}</td>
        <td>${data.median ? data.median.toFixed(2) + 'ms' : 'N/A'}</td>
        <td>${data.p95 ? data.p95.toFixed(2) + 'ms' : 'N/A'}</td>
      </tr>
      `
        )
        .join('')}
    </table>
  </div>
  
  <div class="chart-container">
    <canvas id="responseTimeChart"></canvas>
  </div>
  
  <div class="chart-container">
    <canvas id="successRateChart"></canvas>
  </div>
  
  <script>
    const results = ${JSON.stringify(results)};
    
    // 响应时间对比图
    const responseTimeCtx = document.getElementById('responseTimeChart').getContext('2d');
    new Chart(responseTimeCtx, {
      type: 'bar',
      data: {
        labels: Object.keys(results),
        datasets: [
          {
            label: '平均响应时间 (ms)',
            data: Object.values(results).map(r => r.avg || 0),
            backgroundColor: 'rgba(54, 162, 235, 0.5)',
          },
          {
            label: '95%响应时间 (ms)',
            data: Object.values(results).map(r => r.p95 || 0),
            backgroundColor: 'rgba(255, 99, 132, 0.5)',
          }
        ]
      },
      options: {
        plugins: {
          title: {
            display: true,
            text: 'API端点响应时间对比'
          }
        }
      }
    });
    
    // 成功率图表
    const successRateCtx = document.getElementById('successRateChart').getContext('2d');
    new Chart(successRateCtx, {
      type: 'bar',
      data: {
        labels: Object.keys(results),
        datasets: [{
          label: '请求成功率',
          data: Object.values(results).map(r => {
            if (r.successRate) {
              return parseFloat(r.successRate);
            }
            return 0;
          }),
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
        }]
      },
      options: {
        plugins: {
          title: {
            display: true,
            text: 'API端点请求成功率'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 100
          }
        }
      }
    });
  </script>
</body>
</html>
  `;

  fs.writeFileSync('performance-results.html', html);
  console.log('可视化结果已保存到 performance-results.html');
}

// 运行测试
runTest();
