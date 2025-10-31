import { IsString, IsInt, Min, Max, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateReviewDto {
  @IsNotEmpty()
  @IsString()
  reviewedUserId: string;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @IsOptional()
  @IsString()
  comment?: string;
}
