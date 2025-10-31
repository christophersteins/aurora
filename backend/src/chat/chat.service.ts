import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Not } from "typeorm";
import { Conversation } from "./entities/conversation.entity";
import { Message } from "./entities/message.entity";
import { UsersService } from "../users/users.service";

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Conversation)
    private conversationRepository: Repository<Conversation>,
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    private usersService: UsersService,
  ) {}

  // Helper function to standardize participant order
  private standardizeParticipants(participants: string[]): string[] {
    return [...participants].sort();
  }

  // ===== IMPROVED METHODS =====
  
  async createConversation(userId: string, otherUserId: string): Promise<any> {
    // Don't allow creating conversation with oneself
    if (userId === otherUserId) {
      throw new Error("Cannot create conversation with yourself");
    }

    // Standardize participant order to ensure uniqueness
    const standardizedParticipants = this.standardizeParticipants([userId, otherUserId]);
    
    // Check if conversation already exists with EXACTLY these two participants
    const existingConversation = await this.conversationRepository
      .createQueryBuilder("conversation")
      .where("conversation.participants @> :participants", { 
        participants: standardizedParticipants 
      })
      .andWhere("conversation.participants <@ :participants", { 
        participants: standardizedParticipants 
      })
      .andWhere("array_length(conversation.participants, 1) = 2")
      .getOne();

    let conversation: Conversation;
    if (existingConversation) {
      conversation = existingConversation;
    } else {
      // Create new conversation with standardized participants
      conversation = this.conversationRepository.create({
        participants: standardizedParticipants,
        pinnedBy: [],
      });
      conversation = await this.conversationRepository.save(conversation);
    }

    // Get other user information
    let otherUserName = "User " + otherUserId;
    let otherUserProfilePicture: string | undefined;
    let otherUserRole: string | undefined;
    let otherUserIsOnline = false;
    let otherUserLastSeen: Date | undefined;

    try {
      const otherUser = await this.usersService.findById(otherUserId);
      if (otherUser) {
        otherUserName = otherUser.username || otherUser.email || "User " + otherUserId;
        otherUserProfilePicture = otherUser.profilePicture;
        otherUserRole = otherUser.role;
        otherUserIsOnline = otherUser.isOnline || false;
        otherUserLastSeen = otherUser.lastSeen;
      }
    } catch (error) {
      console.error("Error fetching user info:", error);
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
      .createQueryBuilder("conversation")
      .where(":userId = ANY(conversation.participants)", { userId })
      .getMany();
  }

  async getConversationMessages(conversationId: string): Promise<Message[]> {
    return await this.messageRepository.find({
      where: { conversationId },
      order: { createdAt: "ASC" },
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
      order: { createdAt: "ASC" },
    });
  }

  async markAsRead(messageId: string): Promise<void> {
    await this.messageRepository.update(messageId, { isRead: true });
  }

  async markConversationAsRead(conversationId: string, userId: string): Promise<void> {
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
    // Get all conversations where user is a participant
    const conversations = await this.conversationRepository
      .createQueryBuilder("conversation")
      .where(":userId = ANY(conversation.participants)", { userId })
      .orderBy("conversation.updatedAt", "DESC")
      .getMany();

    // Create a map to deduplicate conversations by the OTHER participant
    const conversationMap = new Map<string, any>();
    
    for (const conv of conversations) {
      // Ensure we have exactly 2 participants
      if (conv.participants.length !== 2) {
        console.warn(`Conversation ${conv.id} has ${conv.participants.length} participants, expected 2`);
        continue;
      }

      // Find the other participant
      const otherUserId = conv.participants.find(p => p !== userId);
      
      if (!otherUserId) {
        console.warn(`Could not find other participant in conversation ${conv.id}`);
        continue;
      }

      // Check if we already have a conversation with this user
      if (conversationMap.has(otherUserId)) {
        const existingConv = conversationMap.get(otherUserId);
        
        // Keep the conversation with the most recent activity
        const existingLastMessage = await this.messageRepository.findOne({
          where: { conversationId: existingConv.id },
          order: { createdAt: "DESC" },
        });
        
        const currentLastMessage = await this.messageRepository.findOne({
          where: { conversationId: conv.id },
          order: { createdAt: "DESC" },
        });
        
        const existingLastTime = existingLastMessage?.createdAt || existingConv.updatedAt;
        const currentLastTime = currentLastMessage?.createdAt || conv.updatedAt;
        
        // Skip this conversation if the existing one is more recent
        if (existingLastTime >= currentLastTime) {
          continue;
        }
      }

      // Get the last message for this conversation
      const lastMessage = await this.messageRepository.findOne({
        where: { conversationId: conv.id },
        order: { createdAt: "DESC" },
      });

      // Count unread messages
      const unreadCount = await this.messageRepository.count({
        where: {
          conversationId: conv.id,
          isRead: false,
          senderId: Not(userId),
        },
      });

      // Get the other user information
      let otherUserName = "User " + otherUserId;
      let otherUserProfilePicture: string | undefined;
      let otherUserRole: string | undefined;
      let otherUserIsOnline = false;
      let otherUserLastSeen: Date | undefined;

      try {
        const otherUser = await this.usersService.findById(otherUserId);
        if (otherUser) {
          otherUserName = otherUser.username || otherUser.email || "User " + otherUserId;
          otherUserProfilePicture = otherUser.profilePicture;
          otherUserRole = otherUser.role;
          otherUserIsOnline = otherUser.isOnline || false;
          otherUserLastSeen = otherUser.lastSeen;
        }
      } catch (error) {
        console.error("Error fetching user info:", error);
      }

      const isPinned = (conv.pinnedBy || []).includes(userId);

      const conversationData = {
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

      // Store in map with otherUserId as key to ensure uniqueness
      conversationMap.set(otherUserId, conversationData);
    }

    // Convert map to array and sort
    return Array.from(conversationMap.values()).sort((a, b) => {
      // Sort pinned conversations first, then by last message time
      if (a.isPinned !== b.isPinned) {
        return a.isPinned ? -1 : 1;
      }
      return new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime();
    });
  }

  async getTotalUnreadCount(userId: string): Promise<{ count: number }> {
    // Get all unique conversation partners
    const conversations = await this.conversationRepository
      .createQueryBuilder("conversation")
      .where(":userId = ANY(conversation.participants)", { userId })
      .getMany();

    // Track unique users with unread messages
    const usersWithUnread = new Set<string>();

    for (const conv of conversations) {
      const otherUserId = conv.participants.find(p => p !== userId);
      
      if (otherUserId && !usersWithUnread.has(otherUserId)) {
        const unreadCount = await this.messageRepository.count({
          where: {
            conversationId: conv.id,
            isRead: false,
            senderId: Not(userId),
          },
        });
        
        if (unreadCount > 0) {
          usersWithUnread.add(otherUserId);
        }
      }
    }

    return { count: usersWithUnread.size };
  }

  async markConversationAsUnread(conversationId: string, userId: string): Promise<void> {
    // Mark the most recent message from the other user as unread
    const lastMessageFromOther = await this.messageRepository.findOne({
      where: {
        conversationId,
        senderId: Not(userId),
      },
      order: { createdAt: "DESC" },
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
      throw new Error("Conversation not found");
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
      throw new Error("Conversation not found");
    }

    // Verify user is a participant
    if (!conversation.participants.includes(userId)) {
      throw new Error("User is not a participant in this conversation");
    }

    // Delete all messages in the conversation
    await this.messageRepository.delete({ conversationId });
    
    // Delete the conversation
    await this.conversationRepository.delete(conversationId);
  }

  // Helper method to clean up duplicate conversations (can be run as maintenance)
  async cleanupDuplicateConversations(userId?: string): Promise<number> {
    const query = this.conversationRepository
      .createQueryBuilder("conversation");
    
    if (userId) {
      query.where(":userId = ANY(conversation.participants)", { userId });
    }
    
    const conversations = await query.getMany();
    
    // Group conversations by participant pairs
    const participantPairsMap = new Map<string, Conversation[]>();
    
    for (const conv of conversations) {
      if (conv.participants.length === 2) {
        const key = this.standardizeParticipants(conv.participants).join("-");
        const existing = participantPairsMap.get(key) || [];
        existing.push(conv);
        participantPairsMap.set(key, existing);
      }
    }
    
    let deletedCount = 0;
    
    // For each pair, keep only the most recent conversation
    for (const [key, convs] of participantPairsMap) {
      if (convs.length > 1) {
        // Sort by updatedAt descending, keep the most recent
        convs.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
        
        // Delete all but the first (most recent) conversation
        for (let i = 1; i < convs.length; i++) {
          await this.conversationRepository.delete(convs[i].id);
          deletedCount++;
          console.log(`Deleted duplicate conversation: ${convs[i].id}`);
        }
      }
    }
    
    return deletedCount;
  }
}
