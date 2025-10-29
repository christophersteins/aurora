import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ChatService } from './chat.service';
import { UsersService } from '../users/users.service';

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:3000',
    credentials: true,
  },
})
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  // Map to track user ID to socket ID
  private userSocketMap = new Map<string, string>();

  constructor(
    private readonly chatService: ChatService,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async handleConnection(client: Socket) {
    console.log(`✅ Client connected: ${client.id}`);

    try {
      // Extract JWT token from handshake auth or query
      const token = client.handshake.auth?.token || client.handshake.query?.token;

      if (!token) {
        console.log('⚠️ No token provided, skipping online status update');
        return;
      }

      // Verify token and extract user ID
      const payload = await this.jwtService.verifyAsync(token);
      const userId = payload.sub;

      if (userId) {
        // Store the user-socket mapping
        this.userSocketMap.set(userId, client.id);

        // Set user as online
        await this.usersService.setUserOnline(userId);
        console.log(`🟢 User ${userId} is now online`);
      }
    } catch (error) {
      console.error('❌ Error handling connection:', error.message);
    }
  }

  async handleDisconnect(client: Socket) {
    console.log(`❌ Client disconnected: ${client.id}`);

    try {
      // Find the user ID for this socket
      let userId: string | undefined;
      for (const [uid, socketId] of this.userSocketMap.entries()) {
        if (socketId === client.id) {
          userId = uid;
          break;
        }
      }

      if (userId) {
        // Remove from map
        this.userSocketMap.delete(userId);

        // Set user as offline
        await this.usersService.setUserOffline(userId);
        console.log(`🔴 User ${userId} is now offline`);
      }
    } catch (error) {
      console.error('❌ Error handling disconnect:', error.message);
    }
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @MessageBody() data: { conversationId: string; senderId: string; content: string },
    @ConnectedSocket() client: Socket,
  ) {
    console.log('📨 Message received:', data);

    // Nachricht in DB speichern
    const savedMessage = await this.chatService.createMessage(data);
    console.log('💾 Message saved to DB:', savedMessage.id);

    const messagePayload = {
      id: savedMessage.id,
      conversationId: savedMessage.conversationId,
      senderId: savedMessage.senderId,
      content: savedMessage.content,
      mediaUrl: savedMessage.mediaUrl,
      mediaType: savedMessage.mediaType,
      timestamp: savedMessage.createdAt,
    };

    // Broadcast an alle Clients
    this.server.emit(`message:${data.conversationId}`, messagePayload);
    
    console.log('📤 Message broadcast to conversation:', data.conversationId);
    
    return { success: true, message: messagePayload };
  }

  @SubscribeMessage('loadMessages')
  async handleLoadMessages(
    @MessageBody() data: { conversationId: string },
    @ConnectedSocket() client: Socket,
  ) {
    console.log('📂 Loading messages for conversation:', data.conversationId);
    
    const messages = await this.chatService.getMessagesByConversation(data.conversationId);
    
    return { success: true, messages };
  }
}