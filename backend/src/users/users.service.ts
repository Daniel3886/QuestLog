import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { User } from '@prisma/client';
import { DatabaseService } from 'src/database/database.service';
import { CreateUserInput } from 'src/auth/types/create-user-input.type';

@Injectable()
export class UserService {
  constructor(private readonly database: DatabaseService) {}

  async createUser({ email, password }: CreateUserInput) {
    const hashed = await bcrypt.hash(password, 10);
    return this.database.user.create({
      data: { email, password: hashed },
    });
  }

  findByEmail(email: User['email']) {
    return this.database.user.findUnique({ where: { email } });
  }

  findById(id: User['id']) {
    return this.database.user.findUnique({ where: { id } });
  }

  async comparePassword(
    inputPassword: string,
    hashedPassword: User['password'],
  ): Promise<boolean> {
    return bcrypt.compare(inputPassword, hashedPassword);
  }
}
