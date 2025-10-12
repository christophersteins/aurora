import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  // Alle Conversations des eingeloggten Users
  @Get('conversations')
  async getConversations(@Request() req) {
    return await this.chatService.getUserConversations(req.user.id);
  }

  // Conversation mit einem anderen User starten/finden
  @Post('conversations')
  async createOrGetConversation(
    @Request() req,
    @Body('otherUserId') otherUserId: string,
  ) {
    const conversation = await this.chatService.findOrCreateConversation(
      req.user.id,
      otherUserId,
    );
    return conversation;
  }

  // Alle Nachrichten einer Conversation abrufen
  @Get('conversations/:conversationId/messages')
  async getMessages(@Param('conversationId') conversationId: string) {
    return await this.chatService.getMessages(conversationId);
  }

  // Nachrichten als gelesen markieren
  @Post('conversations/:conversationId/read')
  async markAsRead(
    @Param('conversationId') conversationId: string,
    @Request() req,
  ) {
    await this.chatService.markMessagesAsRead(conversationId, req.user.id);
    return { success: true };
  }
}