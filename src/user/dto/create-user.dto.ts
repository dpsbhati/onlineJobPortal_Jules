import { IsNotEmpty, IsString, IsEmail, MinLength, IsOptional, IsEnum, IsBoolean, IsUUID, Matches } from 'class-validator';
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
    example: 'securePassword123!',
    description: 'The password of the user (minimum length of 6 characters, no spaces, must be alphanumeric and can include special characters).',
  })
  @IsString()
  @MinLength(6)
  @IsNotEmpty()
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!@#$%^&*()_+={}\[\]:;"'<>,.?~`-]{6,}$/, {
    message: 'Password must be at least 6 characters long, contain no spaces, and include both letters and numbers. Special characters are allowed but not required.',
  })
  password?: string; // Updated validation

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
  token: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6, {
    message: 'New password must be at least 6 characters long, contain no spaces, and include both letters and numbers.',
  })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!@#$%^&*()_+={}\[\]:;"'<>,.?~`-]{6,}$/, {
    message: 'New password must be at least 6 characters long, contain no spaces, and include both letters and numbers. Special characters are allowed but not required.',
  })
  newPassword: string;
}