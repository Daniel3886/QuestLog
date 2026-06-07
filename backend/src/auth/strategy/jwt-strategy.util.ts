import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserService } from 'src/users/users.service';
import { AdminService } from '../admin.service';
import { JwtPayload } from '../types/jwt-payload.type';
import { Config } from 'config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly userService: UserService,
    private readonly adminService: AdminService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: Config.jwtSecret,
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.userService.findById(payload.userId);
    if (!user || user.isBanned) {
      throw new UnauthorizedException();
    }
    const isAdmin = await this.adminService.isAdmin(user.email);
    return { id: user.id, email: user.email, isAdmin };
  }
}
