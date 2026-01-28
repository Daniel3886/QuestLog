import { User } from '@prisma/client';

export interface CreateUserInput {
  email: User['email'];
  password: User['password'];
}
