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
    try {
      const otherUser = await this.usersService.findById(otherUserId);
      if (otherUser) {
        otherUserName = otherUser.username || otherUser.email || `User ${otherUserId}`;
      }
    } catch (error) {
      console.error('Error fetching user info:', error);
    }

    return {
      id: conversation.id,
      otherUserId,
      otherUserName,
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

  async sendMessage(conversationId: string, senderId: string, content: string): Promise<Message> {
    const message = this.messageRepository.create({
      conversationId,
      senderId,
      content,
    });
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
        if (otherUserId) {
          try {
            const otherUser = await this.usersService.findById(otherUserId);
            if (otherUser) {
              otherUserName = otherUser.username || otherUser.email || `User ${otherUserId}`;
            }
          } catch (error) {
            console.error('Error fetching user info:', error);
          }
        }

        return {
          id: conv.id,
          otherUserId,
          otherUserName,
          lastMessage: lastMessage?.content || null,
          lastMessageTime: lastMessage?.createdAt || conv.updatedAt,
          unreadCount,
          updatedAt: conv.updatedAt,
        };
      })
    );

    return conversationsWithMessages;
  }
}