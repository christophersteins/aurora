import { Injectable, UnauthorizedException, ConflictException, BadRequestException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { MailService } from '../mail/mail.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  async register(registerDto: RegisterDto) {
    // Check if email already exists
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date();
    verificationExpires.setHours(verificationExpires.getHours() + 24); // 24 hours expiry

    // Create new user with only email (password and username will be set during verification)
    const user = await this.usersService.create({
      email: registerDto.email,
      username: `user_${Date.now()}`, // Temporary username
      password: crypto.randomBytes(32).toString('hex'), // Temporary password
      emailVerificationToken: verificationToken,
      emailVerificationExpires: verificationExpires,
      emailVerified: false,
    });

    // Send verification email
    try {
      await this.mailService.sendVerificationEmail(user.email, verificationToken);
    } catch (error) {
      console.error('Failed to send verification email:', error);
      // We don't throw here - user is still created even if email fails
    }

    return {
      message: 'Registration successful. Please check your email to verify your account.',
      user: {
        id: user.id,
        email: user.email,
        emailVerified: user.emailVerified,
      },
    };
  }

  async login(loginDto: LoginDto) {
    // Determine if input is email or username (simple check: contains @)
    const isEmail = loginDto.emailOrUsername.includes('@');

    // Find user by email or username
    let user;
    if (isEmail) {
      user = await this.usersService.findByEmail(loginDto.emailOrUsername);
    } else {
      user = await this.usersService.findByUsername(loginDto.emailOrUsername);
    }

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if email is verified
    if (!user.emailVerified) {
      throw new UnauthorizedException('Please verify your email address before logging in');
    }

    // Validate password
    const isPasswordValid = await this.usersService.validatePassword(
      loginDto.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate JWT token
    const payload = { sub: user.id, email: user.email, role: user.role };
    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        emailVerified: user.emailVerified,
        profilePicture: user.profilePicture,
      },
    };
  }

  async verifyEmail(token: string, username: string, password: string, role: string) {
    // Find user with this verification token
    const user = await this.usersService.findByVerificationToken(token);

    if (!user) {
      throw new NotFoundException('Invalid verification token');
    }

    // Check if token has expired
    if (user.emailVerificationExpires && new Date() > user.emailVerificationExpires) {
      throw new BadRequestException('Verification token has expired');
    }

    // Check if already verified
    if (user.emailVerified) {
      throw new BadRequestException('Email already verified');
    }

    // Check if username is already taken (by another user)
    const existingUser = await this.usersService.findByUsername(username);
    if (existingUser && existingUser.id !== user.id) {
      throw new ConflictException('Username already taken');
    }

    // Update user with username, password, and role
    await this.usersService.completeRegistration(user.id, username, password, role);

    // Reload user to get updated data
    const updatedUser = await this.usersService.findById(user.id);

    if (!updatedUser) {
      throw new NotFoundException('User not found after update');
    }

    // Generate JWT token for automatic login
    const payload = { sub: updatedUser.id, email: updatedUser.email, role: updatedUser.role };
    const access_token = this.jwtService.sign(payload);

    return {
      message: 'Email verified successfully',
      access_token,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        username: updatedUser.username,
        role: updatedUser.role,
        emailVerified: true,
      },
    };
  }

  async resendVerificationEmail(email: string) {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.emailVerified) {
      throw new BadRequestException('Email already verified');
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date();
    verificationExpires.setHours(verificationExpires.getHours() + 24);

    // Update user with new token
    await this.usersService.updateVerificationToken(
      user.id,
      verificationToken,
      verificationExpires,
    );

    // Send verification email
    await this.mailService.sendVerificationEmail(user.email, verificationToken);

    return {
      message: 'Verification email sent successfully',
    };
  }
}