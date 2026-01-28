import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Get,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { User } from './decorators/user.decorator';
import type { AuthUser } from './types/auth-user.type';
import type { AuthenticatedRequest } from './types/auth-request.type';
import { AuthTokenService } from './service/auth-token.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private readonly refreshService: AuthTokenService,
  ) {}

  @HttpCode(HttpStatus.OK)
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('refresh')
  refreshToken(@Req() req: AuthenticatedRequest) {
    return this.refreshService.refresh(req.userId, req.email);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMe(@User() user: AuthUser) {
    return user;
  }
}
