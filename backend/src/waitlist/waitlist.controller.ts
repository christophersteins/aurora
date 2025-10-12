import { Controller, Post, Body, Get, UseGuards, Header, Patch, Param } from '@nestjs/common';
import { WaitlistService } from './waitlist.service';
import { JoinWaitlistDto } from './dto/join-waitlist.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

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

  @UseGuards(JwtAuthGuard)
  @Get()
  async getAll() {
    return this.waitlistService.getAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('export/csv')
  @Header('Content-Type', 'text/csv')
  @Header('Content-Disposition', 'attachment; filename="waitlist.csv"')
  async exportCsv(): Promise<string> {
    const entries = await this.waitlistService.getAll();
    
    let csv = 'Email,Benachrichtigt,Datum\n';
    
    entries.forEach((entry) => {
      const date = new Date(entry.createdAt).toLocaleString('de-DE');
      const notified = entry.notified ? 'Ja' : 'Nein';
      csv += `${entry.email},${notified},${date}\n`;
    });
    
    return csv;
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/notified')
  async toggleNotified(@Param('id') id: string, @Body() body: { notified: boolean }) {
    return this.waitlistService.updateNotified(id, body.notified);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('bulk/notified')
  async bulkUpdateNotified(@Body() body: { ids: string[]; notified: boolean }) {
    const affected = await this.waitlistService.bulkUpdateNotified(body.ids, body.notified);
    return {
      message: `${affected} ${affected === 1 ? 'Eintrag' : 'Einträge'} aktualisiert`,
      affected,
    };
  }
}