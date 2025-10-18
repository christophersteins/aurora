import { IsEnum } from 'class-validator';
import { UserRole } from '../../users/enums/user-role.enum';

export class UpdateUserRoleDto {
  @IsEnum(UserRole, {
    message: 'role must be one of: customer, escort, business, admin',
  })
  role: UserRole;
}