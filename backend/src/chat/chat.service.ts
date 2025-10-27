import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { Conversation } from './entities/conversation.entity';
import { Message } from './entities/message.entity';
import { UsersService } from '../users/users.service';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Conversation)
    private conversationRepository: Repository<Conversation>,
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    private usersService: UsersService,
  ) {}

  // ===== OLD METHODS (retained) =====
  async createConversation(userId: string, otherUserId: string): Promise<any> {
    // Check if conversation already exists
    const existingConversation = await this.conversationRepository
      .createQueryBuilder('conversation')
      .where(':userId = ANY(conversation.participants)', { userId })
      .andWhere(':otherUserId = ANY(conversation.participants)', { otherUserId })
      .getOne();

    let conversation: Conversation;

    if (existingConversation) {
      conversation = existingConversation;
    } else {
      conversation = this.conversationRepository.create({
        participants: [userId, otherUserId],
      });
      conversation = await this.conversationRepository.save(conversation);
    }

    // Get other user's information
    let otherUserName = `User ${otherUserId}`;
    let otherUserProfilePicture: string | undefined;
    let otherUserRole: string | undefined;
    let otherUserIsOnline = false;
    let otherUserLastSeen: Date | undefined;

    try {
      const otherUser = await this.usersService.findById(otherUserId);
      if (otherUser) {
        otherUserName = otherUser.username || otherUser.email || `User ${otherUserId}`;
        otherUserProfilePicture = otherUser.profilePicture;
        otherUserRole = otherUser.role;
        otherUserIsOnline = otherUser.isOnline || false;
        otherUserLastSeen = otherUser.lastSeen;
      }
    } catch (error) {
      console.error('Error fetching user info:', error);
    }

    return {
      id: conversation.id,
      otherUserId,
      otherUserName,
      otherUserProfilePicture,
      otherUserRole,
      otherUserIsOnline,
      otherUserLastSeen,
      participants: conversation.participants,
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
    };
  }

  async getUserConversations(userId: string): Promise<Conversation[]> {
    return await this.conversationRepository
      .createQueryBuilder('conversation')
      .where(':userId = ANY(conversation.participants)', { userId })
      .getMany();
  }

  async getConversationMessages(conversationId: string): Promise<Message[]> {
    return await this.messageRepository.find({
      where: { conversationId },
      order: { createdAt: 'ASC' },
    });
  }

  async sendMessage(
    conversationId: string,
    senderId: string,
    content?: string,
    mediaUrl?: string,
    mediaType?: string,
    voiceUrl?: string,
    duration?: number,
  ): Promise<Message> {
    const message = new Message();
    message.conversationId = conversationId;
    message.senderId = senderId;
    if (content) message.content = content;
    if (mediaUrl) message.mediaUrl = mediaUrl;
    if (mediaType) message.mediaType = mediaType;
    if (voiceUrl) message.voiceUrl = voiceUrl;
    if (duration) message.duration = duration;

    return await this.messageRepository.save(message);
  }

  // ===== NEW METHODS (added) =====
  async createMessage(data: {
    conversationId: string;
    senderId: string;
    content: string;
  }): Promise<Message> {
    const message = this.messageRepository.create(data);
    return await this.messageRepository.save(message);
  }

  async getMessagesByConversation(conversationId: string): Promise<Message[]> {
    return await this.messageRepository.find({
      where: { conversationId },
      order: { createdAt: 'ASC' },
    });
  }

  async markAsRead(messageId: string): Promise<void> {
    await this.messageRepository.update(messageId, { isRead: true });
  }

  async markConversationAsRead(conversationId: string, userId: string): Promise<void> {
    // Mark all unread messages in the conversation that were sent by others as read
    await this.messageRepository.update(
      {
        conversationId,
        senderId: Not(userId),
        isRead: false,
      },
      { isRead: true }
    );
  }

  async getUserConversationsWithLastMessage(userId: string): Promise<any[]> {
    const conversations = await this.conversationRepository
      .createQueryBuilder('conversation')
      .where(':userId = ANY(conversation.participants)', { userId })
      .orderBy('conversation.updatedAt', 'DESC')
      .getMany();

    // Load the last message for each conversation
    const conversationsWithMessages = await Promise.all(
      conversations.map(async (conv) => {
        const lastMessage = await this.messageRepository.findOne({
          where: { conversationId: conv.id },
          order: { createdAt: 'DESC' },
        });

        const unreadCount = await this.messageRepository.count({
          where: {
            conversationId: conv.id,
            isRead: false,
            senderId: Not(userId),
          },
        });

        // Determine other participants
        const otherUserId = conv.participants.find(p => p !== userId);

        // Get the other user's information
        let otherUserName = `User ${otherUserId}`;
        let otherUserProfilePicture: string | undefined;
        let otherUserRole: string | undefined;
        let otherUserIsOnline = false;
        let otherUserLastSeen: Date | undefined;

        if (otherUserId) {
          try {
            const otherUser = await this.usersService.findById(otherUserId);
            if (otherUser) {
              otherUserName = otherUser.username || otherUser.email || `User ${otherUserId}`;
              otherUserProfilePicture = otherUser.profilePicture;
              otherUserRole = otherUser.role;
              otherUserIsOnline = otherUser.isOnline || false;
              otherUserLastSeen = otherUser.lastSeen;
            }
          } catch (error) {
            console.error('Error fetching user info:', error);
          }
        }

        const isPinned = (conv.pinnedBy || []).includes(userId);

        return {
          id: conv.id,
          otherUserId,
          otherUserName,
          otherUserProfilePicture,
          otherUserRole,
          otherUserIsOnline,
          otherUserLastSeen,
          lastMessage: lastMessage?.content || null,
          lastMessageTime: lastMessage?.createdAt || conv.updatedAt,
          unreadCount,
          isPinned,
          updatedAt: conv.updatedAt,
        };
      })
    );

    return conversationsWithMessages;
  }

  async getTotalUnreadCount(userId: string): Promise<{ count: number }> {
    const conversations = await this.conversationRepository
      .createQueryBuilder('conversation')
      .where(':userId = ANY(conversation.participants)', { userId })
      .getMany();

    let conversationsWithUnread = 0;
    for (const conv of conversations) {
      const unreadCount = await this.messageRepository.count({
        where: {
          conversationId: conv.id,
          isRead: false,
          senderId: Not(userId),
        },
      });
      // Count conversations with at least one unread message
      if (unreadCount > 0) {
        conversationsWithUnread++;
      }
    }

    return { count: conversationsWithUnread };
  }

  async markConversationAsUnread(conversationId: string, userId: string): Promise<void> {
    // Mark the most recent message from the other user as unread
    const lastMessageFromOther = await this.messageRepository.findOne({
      where: {
        conversationId,
        senderId: Not(userId),
      },
      order: { createdAt: 'DESC' },
    });

    if (lastMessageFromOther) {
      await this.messageRepository.update(lastMessageFromOther.id, { isRead: false });
    }
  }

  async togglePinConversation(conversationId: string, userId: string): Promise<{ isPinned: boolean }> {
    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId },
    });

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    const pinnedBy = conversation.pinnedBy || [];
    const isPinned = pinnedBy.includes(userId);

    if (isPinned) {
      // Unpin: remove userId from pinnedBy array
      conversation.pinnedBy = pinnedBy.filter(id => id !== userId);
    } else {
      // Pin: add userId to pinnedBy array
      conversation.pinnedBy = [...pinnedBy, userId];
    }

    await this.conversationRepository.save(conversation);

    return { isPinned: !isPinned };
  }

  async deleteConversation(conversationId: string, userId: string): Promise<void> {
    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId },
    });

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    // Verify user is a participant
    if (!conversation.participants.includes(userId)) {
      throw new Error('User is not a participant in this conversation');
    }

    // Delete all messages in the conversation
    await this.messageRepository.delete({ conversationId });

    // Delete the conversation
    await this.conversationRepository.delete(conversationId);
  }
}