import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';

export interface EmailOptions {
  to: string;
  subject: string;
  template?: string;
  context?: any;
  html?: string;
  text?: string;
}

@Injectable()
export class MailService {
  private transporter: Transporter;
  private readonly logger = new Logger(MailService.name);

  constructor(private configService: ConfigService) {
    this.createTransporter();
  }

  private createTransporter() {
    const mailConfig = this.configService.get('mail');
    
    this.transporter = nodemailer.createTransport({
      host: mailConfig.host,
      port: mailConfig.port,
      secure: mailConfig.secure,
      auth: mailConfig.auth.user ? {
        user: mailConfig.auth.user,
        pass: mailConfig.auth.pass,
      } : undefined,
      ignoreTLS: mailConfig.ignoreTLS,
      requireTLS: mailConfig.requireTLS,
    });

    // Verify connection configuration
    this.transporter.verify((error, success) => {
      if (error) {
        this.logger.error('Mail server connection failed:', error);
      } else {
        this.logger.log('Mail server is ready to send messages');
      }
    });
  }

  async sendMail(options: EmailOptions): Promise<void> {
    const mailConfig = this.configService.get('mail');
    
    const mailOptions: Mail.Options = {
      from: mailConfig.defaults.from,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Email sent successfully: ${info.messageId}`);
      
      if (process.env.NODE_ENV === 'development') {
        this.logger.debug(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
      }
    } catch (error) {
      this.logger.error(`Failed to send email: ${error.message}`);
      throw error;
    }
  }

  // Email templates
  async sendWelcomeEmail(email: string, name: string): Promise<void> {
    await this.sendMail({
      to: email,
      subject: 'Welcome to Aurora!',
      html: `
        <h1>Welcome ${name}!</h1>
        <p>Thank you for joining Aurora. We're excited to have you on board!</p>
        <p>Get started by completing your profile and exploring the app.</p>
        <br>
        <p>Best regards,<br>The Aurora Team</p>
      `,
      text: `Welcome ${name}! Thank you for joining Aurora. We're excited to have you on board!`,
    });
  }

  async sendPasswordResetEmail(email: string, resetToken: string): Promise<void> {
    const resetUrl = `http://localhost:3000/reset-password?token=${resetToken}`;
    
    await this.sendMail({
      to: email,
      subject: 'Reset Your Password',
      html: `
        <h1>Password Reset Request</h1>
        <p>You requested to reset your password. Click the link below to proceed:</p>
        <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
        <p>Or copy this link: ${resetUrl}</p>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
        <br>
        <p>Best regards,<br>The Aurora Team</p>
      `,
      text: `Password Reset Request. Click this link to reset your password: ${resetUrl}. This link will expire in 1 hour.`,
    });
  }
}