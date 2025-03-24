const axios = require('axios');
const io = require('socket.io-client');

// 配置
const API_URL = 'http://localhost:3000/api';
let parentToken = '';
let teacherToken = '';
let conversationId = '';

// 家长和教师的测试账号
const parentUser = {
  username: 'parent-user1',
  password: 'password123',

  role: 'parent',
  name: '测试家长',
};

const teacherUser = {
  username: 'teacher-user2',
  password: 'password123',

  role: 'teacher',
  name: '测试教师',
};

// 注册函数
async function register(user) {
  try {
    console.log(`正在注册用户: ${user.username}`);
    const response = await axios.post(`${API_URL}/auth/register`, user);
    console.log(`用户 ${user.username} 注册成功!`);
    return response.data.token;
  } catch (error) {
    // 如果用户已存在，尝试直接登录
    if (error.response && error.response.status === 409) {
      console.log(`用户 ${user.username} 已存在，尝试直接登录`);
      return null;
    }
    console.error('注册失败:', error.response?.data || error.message);
    throw error;
  }
}

// 登录函数
async function login(user) {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      username: user.username,
      password: user.password,
    });
    console.log(`用户 ${user.username} 登录成功!`);
    return response.data.token;
  } catch (error) {
    console.error('登录失败:', error.response?.data || error.message);
    throw error;
  }

  // 创建对话
  async function createConversation(token, otherUserId) {
    try {
      const response = await axios.post(
        `${API_URL}/messages/conversations`,
        { otherUserId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data.data._id;
    } catch (error) {
      console.error('创建对话失败:', error.response?.data || error.message);
      throw error;
    }
  }

  // 发送消息
  async function sendMessage(token, conversationId, content, type = 'text') {
    try {
      const response = await axios.post(
        `${API_URL}/messages`,
        { conversationId, content, messageType: type },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data.data;
    } catch (error) {
      console.error('发送消息失败:', error.response?.data || error.message);
      throw error;
    }
  }

  // 发送课程请求
  async function sendLessonRequest(token, conversationId, content, lessonData) {
    try {
      const response = await axios.post(
        `${API_URL}/messages/lesson-request`,
        { conversationId, content, lessonData },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data.data;
    } catch (error) {
      console.error('发送课程请求失败:', error.response?.data || error.message);
      throw error;
    }
  }

  // 确认课程请求
  async function confirmLessonRequest(
    token,
    conversationId,
    content,
    lessonRequestMessageId
  ) {
    try {
      const response = await axios.post(
        `${API_URL}/messages/lesson-confirmation`,
        { conversationId, content, lessonRequestMessageId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data.data;
    } catch (error) {
      console.error('确认课程请求失败:', error.response?.data || error.message);
      throw error;
    }
  }

  // 连接Socket
  function connectSocket(token, userId) {
    const socket = io('http://localhost:3000', {
      auth: { token },
    });

    socket.on('connect', () => {
      console.log(`用户 ${userId} 已连接到Socket`);
      socket.emit('join', userId);
    });

    socket.on('new_message', (data) => {
      console.log(`收到新消息: ${JSON.stringify(data)}`);
    });

    socket.on('message_notification', (data) => {
      console.log(`收到消息通知: ${JSON.stringify(data)}`);
    });

    socket.on('lesson_request_notification', (data) => {
      console.log(`收到课程请求通知: ${JSON.stringify(data)}`);
    });

    socket.on('lesson_confirmation_notification', (data) => {
      console.log(`收到课程确认通知: ${JSON.stringify(data)}`);
    });

    socket.on('disconnect', () => {
      console.log(`用户 ${userId} 已断开连接`);
    });

    return socket;
  }

  // 主测试流程
  async function runTest() {
    try {
      console.log('开始测试家长和教师的消息交互...');

      // 1. 注册或登录家长和教师账号
      console.log('正在处理家长账号...');
      parentToken = await register(parentUser);
      if (!parentToken) {
        parentToken = await login(parentUser);
      }

      console.log('正在处理教师账号...');
      teacherToken = await register(teacherUser);
      if (!teacherToken) {
        teacherToken = await login(teacherUser);
      }

      // 2. 获取用户信息
      console.log('获取家长信息...');
      const parentInfo = await getUserInfo(parentToken);
      const parentId = parentInfo.id || parentInfo._id;
      console.log(`家长ID: ${parentId}`);

      console.log('获取教师信息...');
      const teacherInfo = await getUserInfo(teacherToken);
      const teacherId = teacherInfo.id || teacherInfo._id;
      console.log(`教师ID: ${teacherId}`);

      // 3. 连接Socket
      console.log('连接Socket...');
      const parentSocket = connectSocket(parentToken, parentId);
      const teacherSocket = connectSocket(teacherToken, teacherId);

      // 4. 家长创建与教师的对话
      console.log('家长正在创建与教师的对话...');
      conversationId = await createConversation(parentToken, teacherId);
      console.log(`对话创建成功! ID: ${conversationId}`);

      // 5. 家长发送普通消息
      console.log('家长正在发送普通消息...');
      const parentMessage = await sendMessage(
        parentToken,
        conversationId,
        '您好，我想为孩子找一位数学家教，请问您有空吗？'
      );
      console.log('家长消息发送成功!');

      // 等待2秒，模拟教师查看消息
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // 6. 教师回复消息
      console.log('教师正在回复消息...');
      const teacherMessage = await sendMessage(
        teacherToken,
        conversationId,
        '您好！我很乐意帮助您的孩子。我可以提供数学辅导，请问您希望什么时间上课？'
      );
      console.log('教师消息发送成功!');

      // 等待2秒
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // 7. 家长发送课程请求
      console.log('家长正在发送课程请求...');
      const lessonRequest = await sendLessonRequest(
        parentToken,
        conversationId,
        '我希望本周六下午2点开始上课，每次2小时，可以吗？',
        {
          subject: '数学',
          grade: '初二',
          date: '2023-11-18',
          startTime: '14:00',
          endTime: '16:00',
          location: '线上',
          fee: 200,
        }
      );
      console.log('课程请求发送成功!');

      // 等待2秒
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // 8. 教师确认课程请求
      console.log('教师正在确认课程请求...');
      const lessonConfirmation = await confirmLessonRequest(
        teacherToken,
        conversationId,
        '没问题，我已确认这个时间。我们将在周六下午2点开始上课。',
        lessonRequest._id
      );
      console.log('课程确认发送成功!');

      // 等待5秒后关闭连接
      await new Promise((resolve) => setTimeout(resolve, 5000));

      // 9. 关闭Socket连接
      parentSocket.disconnect();
      teacherSocket.disconnect();

      console.log('测试完成!');
    } catch (error) {
      console.error('测试过程中出错:', error);
    }
  }
}
// 运行测试
runTest();
