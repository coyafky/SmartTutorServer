/**
 * Socket.IO 服务
 * 处理实时消息通信
 */

const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');
const MessageService = require('./MessageService');
const User = require('../../models/User');

class SocketService {
  constructor() {
    this.io = null;
    this.userSockets = new Map(); // 用户ID到socket的映射
  }

  /**
   * 初始化Socket.IO服务
   * @param {Object} server - HTTP服务器实例
   */
  initialize(server) {
    this.io = socketIO(server, {
      cors: {
        origin: process.env.CORS_ORIGIN.split(','),
        methods: ['GET', 'POST'],
        credentials: true
      }
    });

    console.log('Socket.IO 服务已初始化');

    // 设置身份验证中间件
    this.io.use(this.authenticateSocket);

    // 处理连接事件
    this.io.on('connection', this.handleConnection.bind(this));
  }

  /**
   * Socket身份验证中间件
   * @param {Object} socket - Socket实例
   * @param {Function} next - 下一个中间件
   */
  authenticateSocket(socket, next) {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error('身份验证失败：未提供令牌'));
    }

    try {
      // 验证JWT令牌
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch (error) {
      next(new Error('身份验证失败：无效令牌'));
    }
  }

  /**
   * 处理新连接
   * @param {Object} socket - Socket实例
   */
  async handleConnection(socket) {
    const userId = socket.userId;
    console.log(`用户 ${userId} 已连接`);

    // 将用户添加到映射中
    this.userSockets.set(userId, socket);

    // 将用户加入以自己ID命名的房间
    socket.join(userId);

    // 获取用户信息
    const user = await User.findById(userId).select('username role avatar');
    if (!user) {
      socket.disconnect();
      return;
    }

    // 获取用户的所有对话
    const { success, data: conversations } = await MessageService.getUserConversations(userId);
    if (success) {
      // 将用户加入所有对话的房间
      conversations.forEach(conversation => {
        socket.join(`conversation:${conversation._id}`);
      });
    }

    // 处理发送消息事件
    socket.on('send_message', this.handleSendMessage.bind(this, socket));

    // 处理标记已读事件
    socket.on('mark_read', this.handleMarkRead.bind(this, socket));

    // 处理正在输入事件
    socket.on('typing', this.handleTyping.bind(this, socket));

    // 处理停止输入事件
    socket.on('stop_typing', this.handleStopTyping.bind(this, socket));

    // 处理断开连接事件
    socket.on('disconnect', () => {
      console.log(`用户 ${userId} 已断开连接`);
      this.userSockets.delete(userId);
    });

    // 通知用户连接成功
    socket.emit('connected', {
      message: '已连接到消息服务器',
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
        avatar: user.avatar
      }
    });
  }

  /**
   * 处理发送消息事件
   * @param {Object} socket - Socket实例
   * @param {Object} data - 消息数据
   */
  async handleSendMessage(socket, data) {
    const { conversationId, content, messageType = 'text', mediaUrl = null } = data;
    const senderId = socket.userId;

    try {
      // 使用消息服务发送消息
      const result = await MessageService.sendMessage(
        senderId,
        conversationId,
        content,
        messageType,
        mediaUrl
      );

      if (result.success) {
        const message = result.data;

        // 向对话房间广播消息
        this.io.to(`conversation:${conversationId}`).emit('new_message', message);

        // 向接收者发送通知
        const receiverId = message.receiverId.toString();
        this.io.to(receiverId).emit('message_notification', {
          message,
          conversationId
        });

        // 确认消息已发送
        socket.emit('message_sent', { messageId: message._id });
      } else {
        // 发送错误信息
        socket.emit('message_error', { error: result.error });
      }
    } catch (error) {
      console.error('发送消息错误:', error);
      socket.emit('message_error', { error: '发送消息失败' });
    }
  }

  /**
   * 处理标记已读事件
   * @param {Object} socket - Socket实例
   * @param {Object} data - 标记已读数据
   */
  async handleMarkRead(socket, data) {
    const { messageIds } = data;
    const userId = socket.userId;

    try {
      // 使用消息服务标记消息为已读
      const result = await MessageService.markAsRead(userId, messageIds);

      if (result.success) {
        // 确认消息已读
        socket.emit('messages_read', {
          messageIds,
          modifiedCount: result.data.modifiedCount
        });

        // 获取这些消息的对话ID（假设所有消息都属于同一个对话）
        if (messageIds.length > 0) {
          const message = await Message.findById(messageIds[0]);
          if (message) {
            // 通知发送者消息已读
            this.io.to(message.senderId.toString()).emit('recipient_read', {
              messageIds,
              conversationId: message.conversationId
            });
          }
        }
      } else {
        // 发送错误信息
        socket.emit('read_error', { error: result.error });
      }
    } catch (error) {
      console.error('标记已读错误:', error);
      socket.emit('read_error', { error: '标记已读失败' });
    }
  }

  /**
   * 处理正在输入事件
   * @param {Object} socket - Socket实例
   * @param {Object} data - 输入数据
   */
  handleTyping(socket, data) {
    const { conversationId } = data;
    const userId = socket.userId;

    // 向对话中的其他用户广播正在输入状态
    socket.to(`conversation:${conversationId}`).emit('user_typing', {
      userId,
      conversationId
    });
  }

  /**
   * 处理停止输入事件
   * @param {Object} socket - Socket实例
   * @param {Object} data - 输入数据
   */
  handleStopTyping(socket, data) {
    const { conversationId } = data;
    const userId = socket.userId;

    // 向对话中的其他用户广播停止输入状态
    socket.to(`conversation:${conversationId}`).emit('user_stop_typing', {
      userId,
      conversationId
    });
  }

  /**
   * 向特定用户发送通知
   * @param {string} userId - 用户ID
   * @param {string} event - 事件名称
   * @param {Object} data - 事件数据
   */
  sendToUser(userId, event, data) {
    this.io.to(userId).emit(event, data);
  }

  /**
   * 向特定对话的所有参与者发送通知
   * @param {string} conversationId - 对话ID
   * @param {string} event - 事件名称
   * @param {Object} data - 事件数据
   */
  sendToConversation(conversationId, event, data) {
    this.io.to(`conversation:${conversationId}`).emit(event, data);
  }
}

// 导出单例实例
module.exports = new SocketService();
