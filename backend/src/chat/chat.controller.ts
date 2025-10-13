import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('send')
  async sendMessage(
    @Request() req,
    @Body('recipientId') recipientId: string,
    @Body('content') content: string,
  ) {
    return await this.chatService.sendMessage(req.user.id, recipientId, content);
  }

  @Get('conversations')
  async getConversations(@Request() req) {
    return await this.chatService.getConversations(req.user.id);
  }

  @Get('conversation/:userId')
  async getConversation(@Request() req, @Param('userId') userId: string) {
    const messages = await this.chatService.getConversation(req.user.id, userId);
    return { messages }; // Returniere als Objekt mit messages-Array
  }
}