import { Module, Global } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailController } from './mail.controller';
import { ConfigModule } from '@nestjs/config';
import mailConfig from '../config/mail.config';

@Global()
@Module({
  imports: [ConfigModule.forFeature(mailConfig)],
  controllers: [MailController],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}