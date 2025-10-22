import { Controller, Post, Body, Get, UseGuards, Request, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('verify-email')
  async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto) {
    return this.authService.verifyEmail(
      verifyEmailDto.token,
      verifyEmailDto.username,
      verifyEmailDto.password,
      verifyEmailDto.role,
    );
  }

  @Post('resend-verification')
  async resendVerification(@Body('email') email: string) {
    return this.authService.resendVerificationEmail(email);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return {
      user: {
        id: req.user.id,
        email: req.user.email,
        username: req.user.username,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        role: req.user.role,
      },
    };
  }
}