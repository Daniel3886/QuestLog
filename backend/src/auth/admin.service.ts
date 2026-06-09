import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class AdminService {
  constructor(private readonly database: DatabaseService) {}

  async isAdmin(email: string): Promise<boolean> {
    if (!email) return false;
    const admin = await this.database.prisma.admin.findUnique({
      where: { email },
    });
    return !!admin;
  }
}
