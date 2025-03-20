/**
 * 消息服务
 * 处理消息的业务逻辑，分离控制器和数据操作
 */

const Message = require('../../models/Message');
const Conversation = require('../../models/Conversation');
const User = require('../../models/User');

class MessageService {
  /**
   * 获取用户的所有对话
   * @param {string} userId - 用户ID
   * @returns {Promise<Array>} - 对话列表
   */
  static async getUserConversations(userId) {
    try {
      // 获取用户的所有对话
      const conversations = await Conversation.getUserConversations(userId);

      // 获取每个对话的未读消息数
      const conversationsWithUnreadCount = await Promise.all(
        conversations.map(async (conversation) => {
          const unreadCount = await Message.countDocuments({
            conversationId: conversation._id,
            receiverId: userId,
            isRead: false,
          });

          return {
            ...conversation.toObject(),
            unreadCount,
          };
        })
      );

      return {
        success: true,
        data: conversationsWithUnreadCount,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * 获取或创建与特定用户的对话
   * @param {string} userId - 当前用户ID
   * @param {string} otherUserId - 对方用户ID
   * @param {string} type - 对话类型
   * @param {string} title - 对话标题
   * @returns {Promise<Object>} - 对话信息
   */
  static async getOrCreateConversation(
    userId,
    otherUserId,
    type = 'general',
    title = ''
  ) {
    try {
      // 验证对方用户是否存在
      const otherUser = await User.findById(otherUserId);
      if (!otherUser) {
        return {
          success: false,
          error: '用户不存在',
        };
      }

      // 验证用户角色是否合适（家长只能与老师交流，老师只能与家长交流）
      const currentUser = await User.findById(userId);
      if (
        (currentUser.role === 'parent' && otherUser.role !== 'teacher') ||
        (currentUser.role === 'teacher' && otherUser.role !== 'parent')
      ) {
        return {
          success: false,
          error: '无法与该角色用户创建对话',
        };
      }

      // 获取或创建对话
      const conversation = await Conversation.getOrCreateConversation(
        userId,
        otherUserId,
        type,
        title
      );

      // 填充参与者信息
      await conversation.populate('participants', 'username avatar role');

      return {
        success: true,
        data: conversation,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * 获取对话消息
   * @param {string} userId - 用户ID
   * @param {string} conversationId - 对话ID
   * @param {number} page - 页码
   * @param {number} limit - 每页数量
   * @returns {Promise<Object>} - 消息列表和分页信息
   */
  static async getMessages(userId, conversationId, page = 1, limit = 20) {
    try {
      // 验证对话是否存在且用户是参与者
      const conversation = await Conversation.findOne({
        _id: conversationId,
        participants: userId,
      });

      if (!conversation) {
        return {
          success: false,
          error: '对话不存在或您无权访问',
        };
      }

      // 获取分页消息
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const messages = await Message.find({ conversationId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('senderId', 'username avatar role')
        .exec();

      // 获取消息总数
      const total = await Message.countDocuments({ conversationId });

      // 将用户的未读消息标记为已读
      await Message.updateMany(
        {
          conversationId,
          receiverId: userId,
          isRead: false,
        },
        { $set: { isRead: true } }
      );

      return {
        success: true,
        data: {
          messages: messages.reverse(), // 返回时按时间正序排列
          pagination: {
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            pages: Math.ceil(total / parseInt(limit)),
          },
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * 发送消息
   * @param {string} senderId - 发送者ID
   * @param {string} conversationId - 对话ID
   * @param {string} content - 消息内容
   * @param {string} messageType - 消息类型
   * @param {string} mediaUrl - 媒体URL
   * @param {Object} metadata - 消息元数据（教学相关消息的额外信息）
   * @returns {Promise<Object>} - 发送的消息
   */
  static async sendMessage(
    senderId,
    conversationId,
    content,
    messageType = 'text',
    mediaUrl = null,
    metadata = null
  ) {
    try {
      // 验证对话是否存在且用户是参与者
      const conversation = await Conversation.findOne({
        _id: conversationId,
        participants: senderId,
      });

      if (!conversation) {
        return {
          success: false,
          error: '对话不存在或您无权访问',
        };
      }

      // 获取接收者ID（对话中除了发送者的另一个用户）
      const receiverId = conversation.participants.find(
        (participant) => participant.toString() !== senderId.toString()
      );

      // 创建消息
      const message = await Message.create({
        conversationId,
        senderId,
        receiverId,
        content,
        messageType,
        mediaUrl,
        createdAt: Date.now(),
      });

      // 填充发送者信息
      await message.populate('senderId', 'username avatar role');

      // 更新对话的最后一条消息预览和活动时间
      const messagePreview =
        content.length > 30 ? `${content.substring(0, 30)}...` : content;
      await Conversation.updateLastMessage(conversationId, messagePreview);

      return {
        success: true,
        data: message,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * 标记消息为已读
   * @param {string} userId - 用户ID
   * @param {Array} messageIds - 消息ID数组
   * @returns {Promise<Object>} - 更新结果
   */
  static async markAsRead(userId, messageIds) {
    try {
      // 验证消息ID数组
      if (!Array.isArray(messageIds) || messageIds.length === 0) {
        return {
          success: false,
          error: '请提供有效的消息ID数组',
        };
      }

      // 标记消息为已读
      const result = await Message.markAsRead(messageIds, userId);

      return {
        success: true,
        data: {
          modifiedCount: result.modifiedCount,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * 获取未读消息数
   * @param {string} userId - 用户ID
   * @returns {Promise<Object>} - 未读消息数
   */
  static async getUnreadCount(userId) {
    try {
      // 获取总未读消息数
      const totalUnread = await Message.getUnreadCount(userId);

      // 获取每个对话的未读消息数
      const conversations = await Conversation.getUserConversations(userId);
      const unreadByConversation = await Promise.all(
        conversations.map(async (conversation) => {
          const count = await Message.countDocuments({
            conversationId: conversation._id,
            receiverId: userId,
            isRead: false,
          });

          return {
            conversationId: conversation._id,
            unreadCount: count,
          };
        })
      );

      return {
        success: true,
        data: {
          totalUnread,
          unreadByConversation,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * 删除消息
   * @param {string} userId - 用户ID
   * @param {string} messageId - 消息ID
   * @returns {Promise<Object>} - 删除结果
   */
  static async deleteMessage(userId, messageId) {
    try {
      // 验证消息是否存在且用户是发送者
      const message = await Message.findOne({
        _id: messageId,
        senderId: userId,
      });

      if (!message) {
        return {
          success: false,
          error: '消息不存在或您无权删除',
        };
      }

      // 删除消息
      await Message.findByIdAndDelete(messageId);

      // 更新对话的最后一条消息预览
      const lastMessage = await Message.getLastMessage(message.conversationId);
      if (lastMessage) {
        const messagePreview =
          lastMessage.content.length > 30
            ? `${lastMessage.content.substring(0, 30)}...`
            : lastMessage.content;

        await Conversation.updateLastMessage(
          message.conversationId,
          messagePreview
        );
      } else {
        // 如果没有消息了，清空预览
        await Conversation.updateLastMessage(message.conversationId, '');
      }

      return {
        success: true,
        message: '消息已删除',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * 归档对话
   * @param {string} userId - 用户ID
   * @param {string} conversationId - 对话ID
   * @returns {Promise<Object>} - 归档结果
   */
  static async archiveConversation(userId, conversationId) {
    try {
      // 验证对话是否存在且用户是参与者
      const conversation = await Conversation.findOne({
        _id: conversationId,
        participants: userId,
      });

      if (!conversation) {
        return {
          success: false,
          error: '对话不存在或您无权访问',
        };
      }

      // 归档对话
      conversation.status = 'archived';
      await conversation.save();

      return {
        success: true,
        message: '对话已归档',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * 恢复已归档的对话
   * @param {string} userId - 用户ID
   * @param {string} conversationId - 对话ID
   * @returns {Promise<Object>} - 恢复结果
   */
  static async restoreConversation(userId, conversationId) {
    try {
      // 验证对话是否存在且用户是参与者
      const conversation = await Conversation.findOne({
        _id: conversationId,
        participants: userId,
        status: 'archived',
      });

      if (!conversation) {
        return {
          success: false,
          error: '对话不存在、未归档或您无权访问',
        };
      }

      // 恢复对话
      conversation.status = 'active';
      await conversation.save();

      return {
        success: true,
        message: '对话已恢复',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
  /**
   * 发送课程请求消息
   * @param {string} senderId - 发送者ID
   * @param {string} conversationId - 对话ID
   * @param {string} content - 消息内容
   * @param {Object} lessonData - 课程数据
   * @returns {Promise<Object>} - 发送的消息
   */
  static async sendLessonRequest(
    senderId,
    conversationId,
    content,
    lessonData
  ) {
    try {
      const metadata = {
        lesson: {
          ...lessonData,
          status: 'pending',
        },
      };

      return await this.sendMessage(
        senderId,
        conversationId,
        content,
        'lesson_request',
        null,
        metadata
      );
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * 发送课程确认消息
   * @param {string} senderId - 发送者ID
   * @param {string} conversationId - 对话ID
   * @param {string} content - 消息内容
   * @param {string} lessonRequestMessageId - 课程请求消息ID
   * @returns {Promise<Object>} - 发送的消息
   */
  static async sendLessonConfirmation(
    senderId,
    conversationId,
    content,
    lessonRequestMessageId
  ) {
    try {
      // 获取原始课程请求消息
      const lessonRequestMessage = await Message.findById(
        lessonRequestMessageId
      );
      if (
        !lessonRequestMessage ||
        lessonRequestMessage.messageType !== 'lesson_request'
      ) {
        return {
          success: false,
          error: '课程请求消息不存在',
        };
      }

      // 更新原始课程请求消息的状态
      lessonRequestMessage.metadata.lesson.status = 'confirmed';
      await lessonRequestMessage.save();

      // 创建新的确认消息
      const metadata = {
        lesson: {
          ...lessonRequestMessage.metadata.lesson,
          status: 'confirmed',
        },
      };

      return await this.sendMessage(
        senderId,
        conversationId,
        content,
        'lesson_confirmation',
        null,
        metadata
      );
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * 发送课程变更消息
   * @param {string} senderId - 发送者ID
   * @param {string} conversationId - 对话ID
   * @param {string} content - 消息内容
   * @param {string} lessonMessageId - 原课程消息ID
   * @param {Object} updatedLessonData - 更新的课程数据
   * @returns {Promise<Object>} - 发送的消息
   */
  static async sendLessonReschedule(
    senderId,
    conversationId,
    content,
    lessonMessageId,
    updatedLessonData
  ) {
    try {
      // 获取原始课程消息
      const lessonMessage = await Message.findById(lessonMessageId);
      if (
        !lessonMessage ||
        ![
          'lesson_request',
          'lesson_confirmation',
          'lesson_reschedule',
        ].includes(lessonMessage.messageType)
      ) {
        return {
          success: false,
          error: '课程消息不存在或类型不正确',
        };
      }

      // 创建新的变更消息
      const metadata = {
        lesson: {
          ...lessonMessage.metadata.lesson,
          ...updatedLessonData,
          status: 'pending', // 重新设置为待确认状态
        },
      };

      return await this.sendMessage(
        senderId,
        conversationId,
        content,
        'lesson_reschedule',
        null,
        metadata
      );
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * 发送课程取消消息
   * @param {string} senderId - 发送者ID
   * @param {string} conversationId - 对话ID
   * @param {string} content - 消息内容
   * @param {string} lessonMessageId - 原课程消息ID
   * @returns {Promise<Object>} - 发送的消息
   */
  static async sendLessonCancellation(
    senderId,
    conversationId,
    content,
    lessonMessageId
  ) {
    try {
      // 获取原始课程消息
      const lessonMessage = await Message.findById(lessonMessageId);
      if (
        !lessonMessage ||
        ![
          'lesson_request',
          'lesson_confirmation',
          'lesson_reschedule',
        ].includes(lessonMessage.messageType)
      ) {
        return {
          success: false,
          error: '课程消息不存在或类型不正确',
        };
      }

      // 更新原始课程消息的状态
      lessonMessage.metadata.lesson.status = 'cancelled';
      await lessonMessage.save();

      // 创建新的取消消息
      const metadata = {
        lesson: {
          ...lessonMessage.metadata.lesson,
          status: 'cancelled',
        },
      };

      return await this.sendMessage(
        senderId,
        conversationId,
        content,
        'lesson_cancellation',
        null,
        metadata
      );
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * 发送作业布置消息
   * @param {string} senderId - 发送者ID
   * @param {string} conversationId - 对话ID
   * @param {string} content - 消息内容
   * @param {Object} homeworkData - 作业数据
   * @returns {Promise<Object>} - 发送的消息
   */
  static async sendHomeworkAssignment(
    senderId,
    conversationId,
    content,
    homeworkData
  ) {
    try {
      const metadata = {
        homework: {
          ...homeworkData,
          status: 'assigned',
        },
      };

      return await this.sendMessage(
        senderId,
        conversationId,
        content,
        'homework_assignment',
        null,
        metadata
      );
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * 发送作业提交消息
   * @param {string} senderId - 发送者ID
   * @param {string} conversationId - 对话ID
   * @param {string} content - 消息内容
   * @param {string} homeworkAssignmentMessageId - 作业布置消息ID
   * @param {Array} attachments - 提交的作业附件
   * @returns {Promise<Object>} - 发送的消息
   */
  static async sendHomeworkSubmission(
    senderId,
    conversationId,
    content,
    homeworkAssignmentMessageId,
    attachments = []
  ) {
    try {
      // 获取原始作业布置消息
      const homeworkAssignmentMessage = await Message.findById(
        homeworkAssignmentMessageId
      );
      if (
        !homeworkAssignmentMessage ||
        homeworkAssignmentMessage.messageType !== 'homework_assignment'
      ) {
        return {
          success: false,
          error: '作业布置消息不存在',
        };
      }

      // 更新原始作业布置消息的状态
      homeworkAssignmentMessage.metadata.homework.status = 'submitted';
      await homeworkAssignmentMessage.save();

      // 创建新的作业提交消息
      const metadata = {
        homework: {
          ...homeworkAssignmentMessage.metadata.homework,
          attachments,
          status: 'submitted',
        },
      };

      return await this.sendMessage(
        senderId,
        conversationId,
        content,
        'homework_submission',
        null,
        metadata
      );
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * 发送进度报告消息
   * @param {string} senderId - 发送者ID
   * @param {string} conversationId - 对话ID
   * @param {string} content - 消息内容
   * @param {Object} progressData - 进度报告数据
   * @returns {Promise<Object>} - 发送的消息
   */
  static async sendProgressReport(
    senderId,
    conversationId,
    content,
    progressData
  ) {
    try {
      const metadata = {
        progress: progressData,
      };

      return await this.sendMessage(
        senderId,
        conversationId,
        content,
        'progress_report',
        null,
        metadata
      );
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

module.exports = new MessageService();
