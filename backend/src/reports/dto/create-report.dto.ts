import { IsEnum, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ReportCategory } from '../entities/report.entity';

export class CreateReportDto {
  @IsString()
  @IsNotEmpty()
  reportedUserId: string;

  @IsEnum(ReportCategory)
  @IsNotEmpty()
  category: ReportCategory;

  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  description: string;
}
