/**
 * 消息控制器
 * 处理家长和老师之间的消息交流
 * 使用 MessageService 实现业务逻辑分离
 */

const MessageService = require('../services/MessageService');
const SocketService = require('../services/SocketService');
const { errorHandler } = require('../utils/errorHandler');

/**
 * 获取用户的所有对话
 */
exports.getConversations = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // 使用消息服务获取用户的所有对话
    const result = await MessageService.getUserConversations(userId);
    
    if (result.success) {
      return res.status(200).json({
        success: true,
        data: result.data
      });
    } else {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }
  } catch (error) {
    return errorHandler(res, error);
  }
};

/**
 * 获取或创建与特定用户的对话
 */
exports.getOrCreateConversation = async (req, res) => {
  try {
    const userId = req.user.id;
    const { otherUserId, type, title } = req.body;
    
    // 使用消息服务获取或创建对话
    const result = await MessageService.getOrCreateConversation(
      userId,
      otherUserId,
      type || 'general',
      title || ''
    );
    
    if (result.success) {
      return res.status(200).json({
        success: true,
        data: result.data
      });
    } else {
      const statusCode = result.error.includes('不存在') ? 404 : 400;
      return res.status(statusCode).json({
        success: false,
        message: result.error
      });
    }
  } catch (error) {
    return errorHandler(res, error);
  }
};

/**
 * 获取对话消息
 */
exports.getMessages = async (req, res) => {
  try {
    const userId = req.user.id;
    const { conversationId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    
    // 使用消息服务获取对话消息
    const result = await MessageService.getMessages(userId, conversationId, page, limit);
    
    if (result.success) {
      return res.status(200).json({
        success: true,
        data: result.data
      });
    } else {
      return res.status(404).json({
        success: false,
        message: result.error
      });
    }
  } catch (error) {
    return errorHandler(res, error);
  }
};

/**
 * 发送消息
 */
exports.sendMessage = async (req, res) => {
  try {
    const senderId = req.user.id;
    const { conversationId, content, messageType = 'text', mediaUrl = null } = req.body;
    
    // 使用消息服务发送消息
    const result = await MessageService.sendMessage(
      senderId, 
      conversationId, 
      content, 
      messageType, 
      mediaUrl
    );
    
    if (result.success) {
      // 如果消息发送成功，通过Socket向接收者发送实时通知
      const message = result.data;
      const receiverId = message.receiverId.toString();
      
      // 向对话发送新消息通知
      SocketService.sendToConversation(conversationId, 'new_message', message);
      
      // 向接收者发送通知
      SocketService.sendToUser(receiverId, 'message_notification', {
        message,
        conversationId
      });
      
      return res.status(201).json({
        success: true,
        data: message
      });
    } else {
      return res.status(404).json({
        success: false,
        message: result.error
      });
    }
  } catch (error) {
    return errorHandler(res, error);
  }
};

/**
 * 标记消息为已读
 */
exports.markAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const { messageIds } = req.body;
    
    // 使用消息服务标记消息为已读
    const result = await MessageService.markAsRead(userId, messageIds);
    
    if (result.success) {
      // 如果标记成功，通过Socket向发送者发送已读通知
      if (messageIds.length > 0) {
        // 获取这些消息的对话和发送者信息
        const message = await Message.findById(messageIds[0]);
        if (message) {
          // 向发送者发送消息已读通知
          SocketService.sendToUser(message.senderId.toString(), 'recipient_read', {
            messageIds,
            conversationId: message.conversationId
          });
        }
      }
      
      return res.status(200).json({
        success: true,
        data: result.data
      });
    } else {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }
  } catch (error) {
    return errorHandler(res, error);
  }
};

/**
 * 获取未读消息数
 */
exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // 使用消息服务获取未读消息数
    const result = await MessageService.getUnreadCount(userId);
    
    if (result.success) {
      return res.status(200).json({
        success: true,
        data: result.data
      });
    } else {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }
  } catch (error) {
    return errorHandler(res, error);
  }
};

/**
 * 删除消息
 */
exports.deleteMessage = async (req, res) => {
  try {
    const userId = req.user.id;
    const { messageId } = req.params;
    
    // 使用消息服务删除消息
    const result = await MessageService.deleteMessage(userId, messageId);
    
    if (result.success) {
      // 如果删除成功，通过Socket通知对话参与者
      SocketService.sendToConversation(result.data.conversationId, 'message_deleted', {
        messageId,
        conversationId: result.data.conversationId
      });
      
      return res.status(200).json({
        success: true,
        message: '消息已删除'
      });
    } else {
      return res.status(404).json({
        success: false,
        message: result.error
      });
    }
  } catch (error) {
    return errorHandler(res, error);
  }
};

/**
 * 归档对话
 */
exports.archiveConversation = async (req, res) => {
  try {
    const userId = req.user.id;
    const { conversationId } = req.params;
    
    // 使用消息服务归档对话
    const result = await MessageService.archiveConversation(userId, conversationId);
    
    if (result.success) {
      return res.status(200).json({
        success: true,
        message: '对话已归档'
      });
    } else {
      return res.status(404).json({
        success: false,
        message: result.error
      });
    }
  } catch (error) {
    return errorHandler(res, error);
  }
};

/**
 * 恢复已归档的对话
 */
exports.restoreConversation = async (req, res) => {
  try {
    const userId = req.user.id;
    const { conversationId } = req.params;
    
    // 使用消息服务恢复对话
    const result = await MessageService.restoreConversation(userId, conversationId);
    
    if (result.success) {
      return res.status(200).json({
        success: true,
        message: '对话已恢复'
      });
    } else {
      return res.status(404).json({
        success: false,
        message: result.error
      });
    }
  } catch (error) {
    return errorHandler(res, error);
  }
};

/**
 * 发送课程请求消息
 */
exports.sendLessonRequest = async (req, res) => {
  try {
    const senderId = req.user.id;
    const { conversationId, content, lessonData } = req.body;
    
    // 验证课程数据
    if (!lessonData || !lessonData.date || !lessonData.startTime || !lessonData.endTime || !lessonData.subject) {
      return res.status(400).json({
        success: false,
        message: '请提供完整的课程信息'
      });
    }
    
    // 使用消息服务发送课程请求
    const result = await MessageService.sendLessonRequest(
      senderId,
      conversationId,
      content,
      lessonData
    );
    
    if (result.success) {
      // 如果消息发送成功，通过Socket向接收者发送实时通知
      const message = result.data;
      const receiverId = message.receiverId.toString();
      
      // 向对话发送新消息通知
      SocketService.sendToConversation(conversationId, 'new_message', message);
      
      // 向接收者发送课程请求通知
      SocketService.sendToUser(receiverId, 'lesson_request_notification', {
        message,
        conversationId
      });
      
      return res.status(201).json({
        success: true,
        data: message
      });
    } else {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }
  } catch (error) {
    return errorHandler(res, error);
  }
};

/**
 * 发送课程确认消息
 */
exports.sendLessonConfirmation = async (req, res) => {
  try {
    const senderId = req.user.id;
    const { conversationId, content, lessonRequestMessageId } = req.body;
    
    // 验证课程请求消息ID
    if (!lessonRequestMessageId) {
      return res.status(400).json({
        success: false,
        message: '请提供课程请求消息ID'
      });
    }
    
    // 使用消息服务发送课程确认
    const result = await MessageService.sendLessonConfirmation(
      senderId,
      conversationId,
      content,
      lessonRequestMessageId
    );
    
    if (result.success) {
      // 如果消息发送成功，通过Socket向接收者发送实时通知
      const message = result.data;
      const receiverId = message.receiverId.toString();
      
      // 向对话发送新消息通知
      SocketService.sendToConversation(conversationId, 'new_message', message);
      
      // 向接收者发送课程确认通知
      SocketService.sendToUser(receiverId, 'lesson_confirmation_notification', {
        message,
        conversationId
      });
      
      return res.status(201).json({
        success: true,
        data: message
      });
    } else {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }
  } catch (error) {
    return errorHandler(res, error);
  }
};

/**
 * 发送课程变更消息
 */
exports.sendLessonReschedule = async (req, res) => {
  try {
    const senderId = req.user.id;
    const { conversationId, content, lessonMessageId, updatedLessonData } = req.body;
    
    // 验证课程消息ID和更新数据
    if (!lessonMessageId || !updatedLessonData) {
      return res.status(400).json({
        success: false,
        message: '请提供课程消息ID和更新的课程数据'
      });
    }
    
    // 使用消息服务发送课程变更
    const result = await MessageService.sendLessonReschedule(
      senderId,
      conversationId,
      content,
      lessonMessageId,
      updatedLessonData
    );
    
    if (result.success) {
      // 如果消息发送成功，通过Socket向接收者发送实时通知
      const message = result.data;
      const receiverId = message.receiverId.toString();
      
      // 向对话发送新消息通知
      SocketService.sendToConversation(conversationId, 'new_message', message);
      
      // 向接收者发送课程变更通知
      SocketService.sendToUser(receiverId, 'lesson_reschedule_notification', {
        message,
        conversationId
      });
      
      return res.status(201).json({
        success: true,
        data: message
      });
    } else {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }
  } catch (error) {
    return errorHandler(res, error);
  }
};

/**
 * 发送课程取消消息
 */
exports.sendLessonCancellation = async (req, res) => {
  try {
    const senderId = req.user.id;
    const { conversationId, content, lessonMessageId } = req.body;
    
    // 验证课程消息ID
    if (!lessonMessageId) {
      return res.status(400).json({
        success: false,
        message: '请提供课程消息ID'
      });
    }
    
    // 使用消息服务发送课程取消
    const result = await MessageService.sendLessonCancellation(
      senderId,
      conversationId,
      content,
      lessonMessageId
    );
    
    if (result.success) {
      // 如果消息发送成功，通过Socket向接收者发送实时通知
      const message = result.data;
      const receiverId = message.receiverId.toString();
      
      // 向对话发送新消息通知
      SocketService.sendToConversation(conversationId, 'new_message', message);
      
      // 向接收者发送课程取消通知
      SocketService.sendToUser(receiverId, 'lesson_cancellation_notification', {
        message,
        conversationId
      });
      
      return res.status(201).json({
        success: true,
        data: message
      });
    } else {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }
  } catch (error) {
    return errorHandler(res, error);
  }
};

/**
 * 发送作业布置消息
 */
exports.sendHomeworkAssignment = async (req, res) => {
  try {
    const senderId = req.user.id;
    const { conversationId, content, homeworkData } = req.body;
    
    // 验证作业数据
    if (!homeworkData || !homeworkData.title || !homeworkData.description || !homeworkData.dueDate) {
      return res.status(400).json({
        success: false,
        message: '请提供完整的作业信息'
      });
    }
    
    // 使用消息服务发送作业布置
    const result = await MessageService.sendHomeworkAssignment(
      senderId,
      conversationId,
      content,
      homeworkData
    );
    
    if (result.success) {
      // 如果消息发送成功，通过Socket向接收者发送实时通知
      const message = result.data;
      const receiverId = message.receiverId.toString();
      
      // 向对话发送新消息通知
      SocketService.sendToConversation(conversationId, 'new_message', message);
      
      // 向接收者发送作业布置通知
      SocketService.sendToUser(receiverId, 'homework_assignment_notification', {
        message,
        conversationId
      });
      
      return res.status(201).json({
        success: true,
        data: message
      });
    } else {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }
  } catch (error) {
    return errorHandler(res, error);
  }
};

/**
 * 发送作业提交消息
 */
exports.sendHomeworkSubmission = async (req, res) => {
  try {
    const senderId = req.user.id;
    const { conversationId, content, homeworkAssignmentMessageId, attachments } = req.body;
    
    // 验证作业布置消息ID
    if (!homeworkAssignmentMessageId) {
      return res.status(400).json({
        success: false,
        message: '请提供作业布置消息ID'
      });
    }
    
    // 使用消息服务发送作业提交
    const result = await MessageService.sendHomeworkSubmission(
      senderId,
      conversationId,
      content,
      homeworkAssignmentMessageId,
      attachments || []
    );
    
    if (result.success) {
      // 如果消息发送成功，通过Socket向接收者发送实时通知
      const message = result.data;
      const receiverId = message.receiverId.toString();
      
      // 向对话发送新消息通知
      SocketService.sendToConversation(conversationId, 'new_message', message);
      
      // 向接收者发送作业提交通知
      SocketService.sendToUser(receiverId, 'homework_submission_notification', {
        message,
        conversationId
      });
      
      return res.status(201).json({
        success: true,
        data: message
      });
    } else {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }
  } catch (error) {
    return errorHandler(res, error);
  }
};

/**
 * 发送进度报告消息
 */
exports.sendProgressReport = async (req, res) => {
  try {
    const senderId = req.user.id;
    const { conversationId, content, progressData } = req.body;
    
    // 验证进度报告数据
    if (!progressData || !progressData.period) {
      return res.status(400).json({
        success: false,
        message: '请提供完整的进度报告信息'
      });
    }
    
    // 使用消息服务发送进度报告
    const result = await MessageService.sendProgressReport(
      senderId,
      conversationId,
      content,
      progressData
    );
    
    if (result.success) {
      // 如果消息发送成功，通过Socket向接收者发送实时通知
      const message = result.data;
      const receiverId = message.receiverId.toString();
      
      // 向对话发送新消息通知
      SocketService.sendToConversation(conversationId, 'new_message', message);
      
      // 向接收者发送进度报告通知
      SocketService.sendToUser(receiverId, 'progress_report_notification', {
        message,
        conversationId
      });
      
      return res.status(201).json({
        success: true,
        data: message
      });
    } else {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }
  } catch (error) {
    return errorHandler(res, error);
  }
};
