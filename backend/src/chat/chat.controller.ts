import { Controller, Post, Get, Body, Req, Param, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('chat')
// @UseGuards(JwtAuthGuard)  // TODO: Wieder aktivieren nach Auth-Implementierung
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('conversations')
  async createConversation(
    @Req() req,
    @Body('otherUserId') otherUserId: string,
  ) {
    // Temporär: Nutze test-user-123 wenn kein Auth
    const userId = req.user?.id || 'test-user-123';
    return await this.chatService.createConversation(userId, otherUserId);
  }

  @Get('conversations')
  async getConversations(@Req() req) {
    // Temporär: Nutze test-user-123 wenn kein Auth
    const userId = req.user?.id || 'test-user-123';
    return await this.chatService.getUserConversationsWithLastMessage(userId);
  }

  @Get('conversations/:conversationId/messages')
  async getConversationMessages(
    @Param('conversationId') conversationId: string,
  ) {
    return await this.chatService.getConversationMessages(conversationId);
  }

  @Post('conversations/:conversationId/messages')
  async sendMessage(
    @Req() req,
    @Param('conversationId') conversationId: string,
    @Body('content') content: string,
  ) {
    // Temporär: Nutze test-user-123 wenn kein Auth
    const userId = req.user?.id || 'test-user-123';
    return await this.chatService.sendMessage(conversationId, userId, content);
  }
}