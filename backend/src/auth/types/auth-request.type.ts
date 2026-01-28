import { JwtPayload } from './jwt-payload.type';

export interface AuthenticatedRequest extends JwtPayload {
  user: JwtPayload;
}
