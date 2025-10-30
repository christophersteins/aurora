import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Report, ReportStatus } from './entities/report.entity';
import { CreateReportDto } from './dto/create-report.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Report)
    private reportsRepository: Repository<Report>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createReportDto: CreateReportDto, reporterId: string): Promise<Report> {
    // Check if reported user exists
    const reportedUser = await this.usersRepository.findOne({
      where: { id: createReportDto.reportedUserId },
    });

    if (!reportedUser) {
      throw new NotFoundException('Reported user not found');
    }

    // Prevent users from reporting themselves
    if (reporterId === createReportDto.reportedUserId) {
      throw new BadRequestException('You cannot report yourself');
    }

    // Check if user has already reported this user for the same category
    const existingReport = await this.reportsRepository.findOne({
      where: {
        reporterId,
        reportedUserId: createReportDto.reportedUserId,
        category: createReportDto.category,
        status: ReportStatus.PENDING,
      },
    });

    if (existingReport) {
      throw new BadRequestException('You have already reported this user for this reason');
    }

    const report = this.reportsRepository.create({
      ...createReportDto,
      reporterId,
      status: ReportStatus.PENDING,
    });

    return this.reportsRepository.save(report);
  }

  async findAll(): Promise<Report[]> {
    return this.reportsRepository.find({
      relations: ['reporter', 'reportedUser'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByStatus(status: ReportStatus): Promise<Report[]> {
    return this.reportsRepository.find({
      where: { status },
      relations: ['reporter', 'reportedUser'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Report> {
    const report = await this.reportsRepository.findOne({
      where: { id },
      relations: ['reporter', 'reportedUser'],
    });

    if (!report) {
      throw new NotFoundException('Report not found');
    }

    return report;
  }
}
