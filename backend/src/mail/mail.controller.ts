import { Controller, Post, Body } from '@nestjs/common';
import { MailService } from './mail.service';

@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  // Test endpoint - nur für Entwicklung
  @Post('test')
  async sendTestEmail(@Body() body: { email: string }) {
    if (process.env.NODE_ENV !== 'development') {
      throw new Error('Test endpoint only available in development');
    }

    await this.mailService.sendWelcomeEmail(
      body.email || 'test@aurora-app.local',
      'Test User'
    );

    return { 
      message: 'Test email sent successfully',
      checkMailhog: 'http://localhost:8025'
    };
  }

  // Test password reset email
  @Post('test-reset')
  async sendTestResetEmail(@Body() body: { email: string }) {
    if (process.env.NODE_ENV !== 'development') {
      throw new Error('Test endpoint only available in development');
    }

    await this.mailService.sendPasswordResetEmail(
      body.email || 'test@aurora-app.local',
      'test-reset-token-123456'
    );

    return { 
      message: 'Test password reset email sent successfully',
      checkMailhog: 'http://localhost:8025'
    };
  }
}