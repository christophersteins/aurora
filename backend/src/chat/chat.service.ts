import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conversation } from './entities/conversation.entity';
import { Message } from './entities/message.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Conversation)
    private conversationRepository: Repository<Conversation>,
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
  ) {}

  // ===== ALTE METHODEN (beibehalten) =====
  async createConversation(userId: string, otherUserId: string): Promise<Conversation> {
    const conversation = this.conversationRepository.create({
      participants: [userId, otherUserId],
    });
    return await this.conversationRepository.save(conversation);
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

  // ===== NEUE METHODEN (hinzugefügt) =====
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
}