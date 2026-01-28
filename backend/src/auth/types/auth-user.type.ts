import { User } from '@prisma/client';

export interface AuthUser {
  id: User['id'];
  email: User['email'];
}
