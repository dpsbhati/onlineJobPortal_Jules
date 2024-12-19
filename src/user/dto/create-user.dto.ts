import { IsNotEmpty, IsString, IsEmail, MinLength, IsOptional, IsEnum } from 'class-validator';

// UserRole enum with three roles: ADMIN, APPLICANT, EMPLOYER
export enum UserRole {
  ADMIN = 'admin',
  APPLICANT = 'applicant',
  EMPLOYER = 'employer',
}

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(6)
  @IsNotEmpty()
  password: string;

  @IsEnum(UserRole)
  @IsOptional()
  role: UserRole = UserRole.APPLICANT; // Default role is APPLICANT

  @IsString()
  @IsOptional()
  phone?: string; // Optional field for phone number

  @IsString()
  @IsOptional()
  address?: string; // Optional field for user address
}
