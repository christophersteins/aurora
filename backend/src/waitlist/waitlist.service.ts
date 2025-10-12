import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Waitlist } from './entities/waitlist.entity';
import { JoinWaitlistDto } from './dto/join-waitlist.dto';

@Injectable()
export class WaitlistService {
  constructor(
    @InjectRepository(Waitlist)
    private waitlistRepository: Repository<Waitlist>,
  ) {}

  async join(joinWaitlistDto: JoinWaitlistDto): Promise<Waitlist> {
    const existing = await this.waitlistRepository.findOne({
      where: { email: joinWaitlistDto.email },
    });

    if (existing) {
      throw new ConflictException('Diese E-Mail ist bereits auf der Warteliste');
    }

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

  async updateNotified(id: string, notified: boolean): Promise<Waitlist> {
    const entry = await this.waitlistRepository.findOne({ where: { id } });
    
    if (!entry) {
      throw new NotFoundException('Eintrag nicht gefunden');
    }

    entry.notified = notified;
    return this.waitlistRepository.save(entry);
  }

  // NEU: Bulk-Update
  async bulkUpdateNotified(ids: string[], notified: boolean): Promise<number> {
    const result = await this.waitlistRepository.update(
      { id: In(ids) },
      { notified }
    );
    
    return result.affected || 0;
  }
}