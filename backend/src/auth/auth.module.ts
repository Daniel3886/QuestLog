import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from 'src/users/users.module';
import { JwtStrategy } from './strategy/jwt-strategy.util';
import { Config } from 'config';
import { AuthTokenService } from './service/auth-token.service';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.register({ secret: Config.jwtSecret }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, AuthTokenService],
  exports: [AuthService],
})
export class AuthModule {}
