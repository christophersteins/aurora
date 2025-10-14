import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:3000',
    credentials: true,
  },
})
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`✅ Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`❌ Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('sendMessage')
  handleSendMessage(
    @MessageBody() data: { conversationId: string; senderId: string; content: string },
    @ConnectedSocket() client: Socket,
  ) {
    console.log('📨 Message received:', data);

    const message = {
      id: Date.now().toString(),
      conversationId: data.conversationId,
      senderId: data.senderId,
      content: data.content,
      timestamp: new Date(),
    };

    // Sende Nachricht an alle Clients in dieser Konversation
    this.server.emit(`message:${data.conversationId}`, message);
    
    console.log('📤 Message broadcast to conversation:', data.conversationId);
    
    return { success: true, message };
  }
}