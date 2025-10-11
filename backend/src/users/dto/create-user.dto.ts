export class CreateUserDto {
  email: string;
  username: string;
  password: string;
  firstName?: string;
  lastName?: string;
  latitude?: number;
  longitude?: number;
}