import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from 'src/users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthTokens } from './types/auth-tokens.type';
import { AuthTokenService } from './service/auth-token.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly tokens: AuthTokenService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthTokens> {
    if (dto.password !== dto.confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    const existingUser = await this.userService.findByEmail(dto.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const user = await this.userService.createUser({
      email: dto.email,
      password: dto.password,
    });

    return {
      accessToken: this.tokens.signAccessToken(user.id, user.email),
      refreshToken: this.tokens.signRefreshToken(user.id, user.email),
    };
  }

  async login(dto: LoginDto): Promise<AuthTokens> {
    const user = await this.userService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await this.userService.comparePassword(
      dto.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return {
      accessToken: this.tokens.signAccessToken(user.id, user.email),
      refreshToken: this.tokens.signRefreshToken(user.id, user.email),
    };
  }
}
