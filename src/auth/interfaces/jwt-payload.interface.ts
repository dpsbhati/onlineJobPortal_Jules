import { UserRole } from 'src/user/enums/user-role.enums';

export interface JwtPayload {
  sub: number;
  email: string;
  role: UserRole;
}
