import { IsNumber, IsOptional, IsString, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class NearbyQueryDto {
  @Type(() => Number)
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number;

  @Type(() => Number)
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0.1)
  radius: number; // in Kilometern

  @IsOptional()
  @IsString()
  excludeUserId?: string;
}