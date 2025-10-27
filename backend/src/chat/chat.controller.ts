import { Controller, Post, Get, Body, Req, Param, UseGuards, Delete, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly chatGateway: ChatGateway,
  ) {}

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

  @Post('conversations/:conversationId/media')
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: diskStorage({
        destination: './uploads/chat',
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|mp4|mov|avi|webm)$/)) {
          return cb(new Error('Only image and video files are allowed!'), false);
        }
        cb(null, true);
      },
      limits: {
        fileSize: 50 * 1024 * 1024, // 50MB limit
      },
    }),
  )
  async uploadMedia(
    @Req() req,
    @Param('conversationId') conversationId: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const userId = req.user.id;
    const messages: any[] = [];

    for (const file of files) {
      const mediaUrl = `/uploads/chat/${file.filename}`;
      const mediaType = file.mimetype.startsWith('image/') ? 'image' : 'video';

      const message = await this.chatService.sendMessage(
        conversationId,
        userId,
        undefined,
        mediaUrl,
        mediaType,
      );

      messages.push(message);

      // Broadcast message via WebSocket
      const messagePayload = {
        id: message.id,
        conversationId: message.conversationId,
        senderId: message.senderId,
        content: message.content,
        mediaUrl: message.mediaUrl,
        mediaType: message.mediaType,
        timestamp: message.createdAt,
      };

      this.chatGateway.server.emit(`message:${conversationId}`, messagePayload);
    }

    return { success: true, messages };
  }

  @Post('conversations/:conversationId/voice')
  @UseInterceptors(
    FilesInterceptor('file', 1, {
      storage: diskStorage({
        destination: './uploads/voice',
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(webm|ogg|mpeg|mp3|wav|m4a)$/)) {
          return cb(new Error('Only audio files are allowed!'), false);
        }
        cb(null, true);
      },
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
      },
    }),
  )
  async uploadVoice(
    @Req() req,
    @Param('conversationId') conversationId: string,
    @UploadedFiles() files: Express.Multer.File[],
    @Body('duration') duration: string,
  ) {
    const userId = req.user.id;

    if (!files || files.length === 0) {
      return { success: false, message: 'No file uploaded' };
    }

    const file = files[0];
    const voiceUrl = `/uploads/voice/${file.filename}`;
    const durationInSeconds = parseInt(duration) || 0;

    const message = await this.chatService.sendMessage(
      conversationId,
      userId,
      undefined,
      undefined,
      undefined,
      voiceUrl,
      durationInSeconds,
    );

    // Broadcast message via WebSocket
    const messagePayload = {
      id: message.id,
      conversationId: message.conversationId,
      senderId: message.senderId,
      content: message.content || '',
      voiceUrl: message.voiceUrl,
      duration: message.duration,
      timestamp: message.createdAt,
    };

    this.chatGateway.server.emit(`message:${conversationId}`, messagePayload);

    return { success: true, message };
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