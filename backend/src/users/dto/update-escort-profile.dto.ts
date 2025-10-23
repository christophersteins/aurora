import { IsOptional, IsDateString, IsArray, IsInt, IsString, IsBoolean, IsNumber, Min, Max } from 'class-validator';

export class UpdateEscortProfileDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsBoolean()
  showNameInProfile?: boolean;

  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @IsOptional()
  @IsString()
  gender?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  nationalities?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  languages?: string[];

  @IsOptional()
  @IsString()
  type?: string; // Typ

  @IsOptional()
  @IsInt()
  @Min(140)
  @Max(200)
  height?: number; // in cm

  @IsOptional()
  @IsInt()
  @Min(40)
  @Max(200)
  weight?: number; // in kg

  @IsOptional()
  @IsString()
  clothingSize?: string; // Konfektionsgröße

  @IsOptional()
  @IsString()
  bodyType?: string; // Figur

  @IsOptional()
  @IsString()
  cupSize?: string; // Oberweite

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
  @IsString()
  intimateHair?: string; // Intimbereich

  @IsOptional()
  @IsBoolean()
  hasTattoos?: boolean;

  @IsOptional()
  @IsBoolean()
  hasPiercings?: boolean;

  @IsOptional()
  @IsBoolean()
  isSmoker?: boolean;

  @IsOptional()
  @IsString()
  description?: string;

  // === PREISE ===

  @IsOptional()
  @IsNumber()
  @Min(0)
  price30Min?: number; // 30 Minuten

  @IsOptional()
  @IsNumber()
  @Min(0)
  price1Hour?: number; // 1 Stunde

  @IsOptional()
  @IsNumber()
  @Min(0)
  price2Hours?: number; // 2 Stunden

  @IsOptional()
  @IsNumber()
  @Min(0)
  price3Hours?: number; // 3 Stunden

  @IsOptional()
  @IsNumber()
  @Min(0)
  price6Hours?: number; // 6 Stunden

  @IsOptional()
  @IsNumber()
  @Min(0)
  price12Hours?: number; // 12 Stunden

  @IsOptional()
  @IsNumber()
  @Min(0)
  price24Hours?: number; // 24 Stunden

  @IsOptional()
  @IsNumber()
  @Min(0)
  priceOvernight?: number; // Übernachtung

  @IsOptional()
  @IsNumber()
  @Min(0)
  priceWeekend?: number; // Wochenende
}