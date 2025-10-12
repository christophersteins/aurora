import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conversation } from './entities/conversation.entity';
import { Message } from './entities/message.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Conversation)
    private conversationRepository: Repository<Conversation>,
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
  ) {}

  // Conversation zwischen 2 Usern finden oder erstellen
  async findOrCreateConversation(
    user1Id: string,
    user2Id: string,
  ): Promise<Conversation> {
    // Sortiere IDs, um doppelte Conversations zu vermeiden
    const [sortedUser1, sortedUser2] =
      user1Id < user2Id ? [user1Id, user2Id] : [user2Id, user1Id];

    // Versuche existierende Conversation zu finden
    let conversation = await this.conversationRepository
      .createQueryBuilder('conversation')
      .where(
        '(conversation.user1_id = :user1 AND conversation.user2_id = :user2)',
        {
          user1: sortedUser1,
          user2: sortedUser2,
        },
      )
      .getOne();

    // Falls keine existiert, erstelle neue
    if (!conversation) {
      conversation = this.conversationRepository.create({
        user1: { id: sortedUser1 } as User,
        user2: { id: sortedUser2 } as User,
      });
      await this.conversationRepository.save(conversation);
    }

    return conversation;
  }

  // Nachricht erstellen und speichern
  async createMessage(
    conversationId: string,
    senderId: string,
    content: string,
  ): Promise<Message> {
    const message = this.messageRepository.create({
      conversation: { id: conversationId } as Conversation,
      sender: { id: senderId } as User,
      content,
      isRead: false,
    });

    return await this.messageRepository.save(message);
  }

  // Alle Nachrichten einer Conversation abrufen
  async getMessages(conversationId: string): Promise<Message[]> {
    return await this.messageRepository.find({
      where: { conversation: { id: conversationId } },
      order: { createdAt: 'ASC' },
      relations: ['sender'],
    });
  }

  // Alle Conversations eines Users abrufen
  async getUserConversations(userId: string): Promise<Conversation[]> {
    return await this.conversationRepository
      .createQueryBuilder('conversation')
      .leftJoinAndSelect('conversation.user1', 'user1')
      .leftJoinAndSelect('conversation.user2', 'user2')
      .where('conversation.user1_id = :userId OR conversation.user2_id = :userId', {
        userId,
      })
      .orderBy('conversation.updated_at', 'DESC')
      .getMany();
  }

  // Nachrichten als gelesen markieren
  async markMessagesAsRead(conversationId: string, userId: string): Promise<void> {
    await this.messageRepository
      .createQueryBuilder()
      .update(Message)
      .set({ isRead: true })
      .where('conversation_id = :conversationId', { conversationId })
      .andWhere('sender_id != :userId', { userId })
      .andWhere('is_read = :isRead', { isRead: false })
      .execute();
  }
}