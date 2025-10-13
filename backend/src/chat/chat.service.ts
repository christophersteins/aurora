import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './entities/message.entity';
import { Conversation } from './entities/conversation.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    @InjectRepository(Conversation)
    private conversationRepository: Repository<Conversation>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async sendMessage(
    conversationId: string,
    senderId: string,
    content: string,
  ): Promise<Message> {
    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId },
      relations: ['participants'],
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    // Check if sender is participant
    const isParticipant = conversation.participants.some(
      (participant) => participant.id === senderId,
    );

    if (!isParticipant) {
      throw new NotFoundException('User is not a participant in this conversation');
    }

    const message = this.messageRepository.create({
      content,
      senderId,
      conversationId,
    });

    return await this.messageRepository.save(message);
  }

  async getConversationMessages(conversationId: string): Promise<Message[]> {
    return await this.messageRepository.find({
      where: { conversationId },
      relations: ['sender'],
      order: { createdAt: 'ASC' },
    });
  }

  async getUserConversations(userId: string): Promise<Conversation[]> {
    return await this.conversationRepository
      .createQueryBuilder('conversation')
      .leftJoinAndSelect('conversation.participants', 'participant')
      .leftJoinAndSelect('conversation.messages', 'message')
      .leftJoinAndSelect('message.sender', 'sender')
      .where('participant.id = :userId', { userId })
      .orderBy('conversation.updatedAt', 'DESC')
      .getMany();
  }

  async createConversation(
    userId: string,
    otherUserId: string,
  ): Promise<Conversation> {
    // Check if conversation already exists
    const existingConversation = await this.conversationRepository
      .createQueryBuilder('conversation')
      .leftJoin('conversation.participants', 'participant')
      .where('participant.id IN (:...userIds)', { userIds: [userId, otherUserId] })
      .groupBy('conversation.id')
      .having('COUNT(DISTINCT participant.id) = 2')
      .getOne();

    if (existingConversation) {
      return existingConversation;
    }

    // Create new conversation
    const user = await this.userRepository.findOne({ where: { id: userId } });
    const otherUser = await this.userRepository.findOne({
      where: { id: otherUserId },
    });

    if (!user || !otherUser) {
      throw new NotFoundException('User not found');
    }

    const conversation = this.conversationRepository.create({
      participants: [user, otherUser],
    });

    return await this.conversationRepository.save(conversation);
  }
}