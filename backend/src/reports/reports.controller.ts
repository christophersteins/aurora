import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createReportDto: CreateReportDto, @Request() req) {
    return this.reportsService.create(createReportDto, req.user.id);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll() {
    return this.reportsService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string) {
    return this.reportsService.findOne(+id);
  }
}
