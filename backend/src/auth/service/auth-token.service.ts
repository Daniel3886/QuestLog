import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { Config } from 'config';

@Injectable()
export class AuthTokenService {
  constructor(private readonly jwt: JwtService) {}

  signAccessToken(userId: User['id'], email: User['email']): string {
    return this.jwt.sign(
      { userId, email, type: 'access' },
      { expiresIn: Config.accessToken.expiresIn },
    );
  }

  signRefreshToken(userId: User['id'], email: User['email']): string {
    return this.jwt.sign(
      { userId, email, type: 'refresh' },
      { expiresIn: Config.refreshToken.expiresIn },
    );
  }

  refresh(userId: string, email: string) {
    return {
      accessToken: this.signAccessToken(userId, email),
      refreshToken: this.signRefreshToken(userId, email),
    };
  }
}
