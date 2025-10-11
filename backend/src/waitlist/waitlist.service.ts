import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Waitlist } from './entities/waitlist.entity';
import { JoinWaitlistDto } from './dto/join-waitlist.dto';

@Injectable()
export class WaitlistService {
  constructor(
    @InjectRepository(Waitlist)
    private waitlistRepository: Repository<Waitlist>,
  ) {}

  async join(joinWaitlistDto: JoinWaitlistDto): Promise<Waitlist> {
    // Prüfe ob Email bereits existiert
    const existing = await this.waitlistRepository.findOne({
      where: { email: joinWaitlistDto.email },
    });

    if (existing) {
      throw new ConflictException('Diese E-Mail ist bereits auf der Warteliste');
    }

    // Erstelle neuen Waitlist-Eintrag
    const waitlistEntry = this.waitlistRepository.create(joinWaitlistDto);
    return this.waitlistRepository.save(waitlistEntry);
  }

  async getAll(): Promise<Waitlist[]> {
    return this.waitlistRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async getCount(): Promise<number> {
    return this.waitlistRepository.count();
  }
}