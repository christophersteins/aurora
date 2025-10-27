import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:3000',
    credentials: true,
  },
})
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly chatService: ChatService) {}

  handleConnection(client: Socket) {
    console.log(`✅ Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`❌ Client disconnected: ${client.id}`);
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