import { Controller, Post, Get, Body, Req, Param, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('conversations')
  async createConversation(
    @Req() req,
    @Body('otherUserId') otherUserId: string,
  ) {
    return await this.chatService.createConversation(req.user.id, otherUserId);
  }

  @Get('conversations')
  async getConversations(@Req() req) {
    return await this.chatService.getUserConversations(req.user.id);
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
    return await this.chatService.sendMessage(
      conversationId,
      req.user.id,
      content,
    );
  }
}