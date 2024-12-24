import { UserRole } from 'src/user/enums/user-role.enums';

export interface JwtPayload {
  id: string;
  email: string;
  role: UserRole;
}
