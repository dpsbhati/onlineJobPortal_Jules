import { IsNotEmpty, IsString, IsEmail, MinLength, IsOptional, IsEnum, IsBoolean } from 'class-validator';
import { UserRole } from '../enums/user-role.enums';  // Adjust the import path as necessary

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(6)
  @IsNotEmpty()
  password: string;

  @IsEnum(UserRole)
  @IsOptional()
  role_id: UserRole = UserRole.APPLICANT; // Default role is APPLICANT

  @IsBoolean()
  @IsOptional()
  isEmailVerified?: boolean = false;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean = true;
}
