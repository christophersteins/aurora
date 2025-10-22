import { registerAs } from '@nestjs/config';

export default registerAs('mail', () => ({
  host: process.env.MAIL_HOST || 'localhost',
  port: parseInt(process.env.MAIL_PORT || '1025', 10),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.MAIL_USER || '',
    pass: process.env.MAIL_PASSWORD || '',
  },
  defaults: {
    from: `"${process.env.MAIL_FROM_NAME || 'Aurora App'}" <${process.env.MAIL_FROM || 'noreply@aurora-app.local'}>`,
  },
  // Disable auth for Mailhog in development
  ignoreTLS: process.env.NODE_ENV === 'development',
  requireTLS: false,
}));