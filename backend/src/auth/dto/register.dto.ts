import { IsEmail, IsString, MinLength, IsOptional, IsEnum } from 'class-validator';
import { UserRole } from '../../users/enums/user-role.enum';

export class RegisterDto {
  @IsEmail()
  email: string;
}