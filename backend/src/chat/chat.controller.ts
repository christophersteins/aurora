import { Controller, Post, Get, Body, Req, Param, UseGuards, Delete } from '@nestjs/common';
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
    const userId = req.user.id;
    return await this.chatService.createConversation(userId, otherUserId);
  }

  @Get('conversations')
  async getConversations(@Req() req) {
    const userId = req.user.id;
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
    const userId = req.user.id;
    return await this.chatService.sendMessage(conversationId, userId, content);
  }

  @Get('unread-count')
  async getUnreadCount(@Req() req) {
    const userId = req.user.id;
    return await this.chatService.getTotalUnreadCount(userId);
  }

  @Post('conversations/:conversationId/read')
  async markConversationAsRead(
    @Req() req,
    @Param('conversationId') conversationId: string,
  ) {
    const userId = req.user.id;
    await this.chatService.markConversationAsRead(conversationId, userId);
    return { success: true };
  }

  @Post('conversations/:conversationId/unread')
  async markConversationAsUnread(
    @Req() req,
    @Param('conversationId') conversationId: string,
  ) {
    const userId = req.user.id;
    await this.chatService.markConversationAsUnread(conversationId, userId);
    return { success: true };
  }

  @Post('conversations/:conversationId/pin')
  async togglePinConversation(
    @Req() req,
    @Param('conversationId') conversationId: string,
  ) {
    const userId = req.user.id;
    return await this.chatService.togglePinConversation(conversationId, userId);
  }

  @Delete('conversations/:conversationId')
  async deleteConversation(
    @Req() req,
    @Param('conversationId') conversationId: string,
  ) {
    const userId = req.user.id;
    await this.chatService.deleteConversation(conversationId, userId);
    return { success: true };
  }
}