import { UserRole } from 'src/user/enums/user-role.enums';

export interface IUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isEmailVerified: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserResponse extends Omit<IUser, 'password'> {}
