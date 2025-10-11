import { Controller, Post, Body, Get } from '@nestjs/common';
import { WaitlistService } from './waitlist.service';
import { JoinWaitlistDto } from './dto/join-waitlist.dto';

@Controller('waitlist')
export class WaitlistController {
  constructor(private readonly waitlistService: WaitlistService) {}

  @Post('join')
  async join(@Body() joinWaitlistDto: JoinWaitlistDto) {
    const entry = await this.waitlistService.join(joinWaitlistDto);
    return {
      message: 'Erfolgreich zur Warteliste hinzugefügt!',
      email: entry.email,
    };
  }

  @Get('count')
  async getCount() {
    const count = await this.waitlistService.getCount();
    return { count };
  }
}