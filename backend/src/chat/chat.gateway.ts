import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:3000',
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private userSockets: Map<string, string> = new Map(); // userId -> socketId

  constructor(private readonly chatService: ChatService) {}

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    // Entferne User aus Online-Map
    for (const [userId, socketId] of this.userSockets.entries()) {
      if (socketId === client.id) {
        this.userSockets.delete(userId);
        console.log(`User ${userId} disconnected`);
        break;
      }
    }
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('register')
  handleRegister(
    @MessageBody() data: { userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    this.userSockets.set(data.userId, client.id);
    console.log(`User ${data.userId} registered with socket ${client.id}`);
    return { event: 'registered', data: { success: true } };
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @MessageBody()
    data: {
      conversationId: string;
      senderId: string;
      receiverId: string;
      content: string;
    },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      // Nachricht in DB speichern
      const message = await this.chatService.createMessage(
        data.conversationId,
        data.senderId,
        data.content,
      );

      // An Sender zurück (Bestätigung)
      client.emit('messageReceived', {
        ...message,
        conversationId: data.conversationId,
      });

      // An Empfänger weiterleiten (falls online)
      const receiverSocketId = this.userSockets.get(data.receiverId);
      if (receiverSocketId) {
        this.server.to(receiverSocketId).emit('newMessage', {
          ...message,
          conversationId: data.conversationId,
        });
      }

      return { event: 'messageSent', data: { success: true, message } };
    } catch (error) {
      console.error('Error sending message:', error);
      return { event: 'error', data: { message: 'Failed to send message' } };
    }
  }

  @SubscribeMessage('getMessages')
  async handleGetMessages(
    @MessageBody() data: { conversationId: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const messages = await this.chatService.getMessages(client.data.userId, data.conversationId);
      return { event: 'messages', data: messages };
    } catch (error) {
      console.error('Error getting messages:', error);
      return { event: 'error', data: { message: 'Failed to get messages' } };
    }
  }

  @SubscribeMessage('markAsRead')
  async handleMarkAsRead(
    @MessageBody() data: { conversationId: string; userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      await this.chatService.markMessagesAsRead(
        data.conversationId,
        data.userId,
      );
      return { event: 'markedAsRead', data: { success: true } };
    } catch (error) {
      console.error('Error marking messages as read:', error);
      return {
        event: 'error',
        data: { message: 'Failed to mark as read' },
      };
    }
  }

  @SubscribeMessage('typing')
  handleTyping(
    @MessageBody() data: { conversationId: string; userId: string; receiverId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const receiverSocketId = this.userSockets.get(data.receiverId);
    if (receiverSocketId) {
      this.server.to(receiverSocketId).emit('userTyping', {
        conversationId: data.conversationId,
        userId: data.userId,
      });
    }
  }
}