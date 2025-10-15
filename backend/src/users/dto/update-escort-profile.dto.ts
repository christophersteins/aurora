import { IsOptional, IsDateString, IsArray, IsInt, IsString, IsBoolean, Min, Max } from 'class-validator';

export class UpdateEscortProfileDto {
  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  nationalities?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  languages?: string[];

  @IsOptional()
  @IsInt()
  @Min(140)
  @Max(220)
  height?: number; // in cm

  @IsOptional()
  @IsInt()
  @Min(40)
  @Max(200)
  weight?: number; // in kg

  @IsOptional()
  @IsString()
  bodyType?: string;

  @IsOptional()
  @IsString()
  cupSize?: string;

  @IsOptional()
  @IsString()
  hairColor?: string;

  @IsOptional()
  @IsString()
  hairLength?: string;

  @IsOptional()
  @IsString()
  eyeColor?: string;

  @IsOptional()
  @IsBoolean()
  hasTattoos?: boolean;

  @IsOptional()
  @IsBoolean()
  hasPiercings?: boolean;

  @IsOptional()
  @IsString()
  description?: string;
}