import { IsString, MinLength, IsEnum } from 'class-validator';
import { UserRole } from '../../users/enums/user-role.enum';

export class VerifyEmailDto {
  @IsString()
  token: string;

  @IsString()
  @MinLength(3)
  username: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsEnum(UserRole, {
    message: 'role must be one of: customer, escort, business',
  })
  role: UserRole;
}
