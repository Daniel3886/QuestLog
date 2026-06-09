import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private database: DatabaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user; // from JwtAuthGuard
    if (!user || !user.email) return false;

    const admin = await this.database.prisma.admin.findUnique({
      where: { email: user.email },
    });
    if (!admin) throw new ForbiddenException('Admin access required');
    return true;
  }
}