import { IsNotEmpty, IsString, IsEmail, MinLength, IsOptional, IsEnum, IsBoolean, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '../enums/user-role.enums'; // Adjust the import path as necessary

export class CreateUserDto {
  @ApiPropertyOptional({
    example: 'unique-user-id',
    description: 'The unique identifier of the user for updates. Must be a valid UUID if provided.',
  })
  @IsOptional()
  @IsUUID()
  id?: string; // Optional for updates
  @ApiProperty({
    example: 'John',
    description: 'The first name of the user.',
  })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({
    example: 'Doe',
    description: 'The last name of the user.',
  })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'The email address of the user.',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: 'securePassword123',
    description: 'The password of the user (minimum length of 6 characters).',
  })
  @IsString()
  @MinLength(6)
  @IsNotEmpty()
  password: string;

  @ApiPropertyOptional({
    example: UserRole.APPLICANT,
    enum: UserRole,
    description: 'The role of the user. Default is APPLICANT.',
  })
  @IsEnum(UserRole)
  @IsOptional()
  role: UserRole = UserRole.APPLICANT;
 
}

export class forgetPasswordDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
export class LoginDTO {
  @ApiProperty()
  email: string;

  @ApiProperty()
  password: string;
}

export class ResetPasswordDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6, {
    message: 'New password must be at least 6 characters long.',
  })
  newPassword: string;
}