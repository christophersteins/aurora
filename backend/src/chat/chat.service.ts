import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './entities/message.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
  ) {}

  async createMessage(senderId: string, recipientId: string, content: string): Promise<Message> {
    const message = this.messageRepository.create({
      content,
      sender: { id: senderId } as User,
      recipient: { id: recipientId } as User,
    });
    return await this.messageRepository.save(message);
  }

  async sendMessage(senderId: string, recipientId: string, content: string): Promise<Message> {
    return this.createMessage(senderId, recipientId, content);
  }

  async getMessages(userId: string, otherUserId: string): Promise<Message[]> {
    return await this.messageRepository.find({
      where: [
        { sender: { id: userId }, recipient: { id: otherUserId } },
        { sender: { id: otherUserId }, recipient: { id: userId } },
      ],
      order: { createdAt: 'ASC' },
      relations: ['sender', 'recipient'],
    });
  }

  async getConversation(userId: string, otherUserId: string): Promise<Message[]> {
    return this.getMessages(userId, otherUserId);
  }

  async markMessagesAsRead(userId: string, otherUserId: string): Promise<void> {
    await this.messageRepository.update(
      {
        sender: { id: otherUserId },
        recipient: { id: userId },
        isRead: false,
      },
      { isRead: true }
    );
  }

  async getConversations(userId: string): Promise<any[]> {
    const messages = await this.messageRepository
      .createQueryBuilder('message')
      .leftJoinAndSelect('message.sender', 'sender')
      .leftJoinAndSelect('message.recipient', 'recipient')
      .where('message.senderId = :userId OR message.recipientId = :userId', { userId })
      .orderBy('message.createdAt', 'DESC')
      .getMany();

    const conversationsMap = new Map();
    messages.forEach(message => {
      const otherUserId = message.sender.id === userId ? message.recipient.id : message.sender.id;
      if (!conversationsMap.has(otherUserId)) {
        conversationsMap.set(otherUserId, {
          user: message.sender.id === userId ? message.recipient : message.sender,
          lastMessage: message,
          unreadCount: 0,
        });
      }
    });

    return Array.from(conversationsMap.values());
  }
}