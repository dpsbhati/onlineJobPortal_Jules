import {
  IsNotEmpty,
  IsString,
  IsEmail,
  MinLength,
  IsOptional,
  IsEnum,
  IsUUID,
  Matches,
  Validate,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '../enums/user-role.enums'; // Adjust the import path as necessary
import { CareerType } from '../enums/career-type.enum';

@ValidatorConstraint({ name: 'IsNotWhitespace', async: false })
export class IsNotWhitespace implements ValidatorConstraintInterface {
  validate(value: string, args: ValidationArguments) {
    if (typeof value !== 'string') return false;
    return value.trim().length > 0; // Ensures the string is not empty or whitespace-only
  }

  defaultMessage(args: ValidationArguments) {
    return `${args.property} must not be empty or contain only whitespace.`;
  }
}

export class CreateUserDto {
  @IsOptional()
  @IsUUID(undefined, { message: 'id must be a valid UUID.' })
  id?: string; // Optional for updates

  @ApiProperty({
    example: 'John',
    description: 'The first name of the user.',
  })
  @IsString({ message: 'firstName must be a valid string.' })
  @IsNotEmpty({ message: 'firstName is required.' })
  @Validate(IsNotWhitespace)
  @Transform(({ value }) => value?.trim())
  firstName: string;

  @ApiProperty({
    example: 'Doe',
    description: 'The last name of the user.',
  })
  @IsString({ message: 'lastName must be a valid string.' })
  @IsNotEmpty({ message: 'lastName is required.' })
  @Validate(IsNotWhitespace)
  @Transform(({ value }) => value?.trim())
  lastName: string;

  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'The email address of the user.',
  })
  @IsEmail({}, { message: 'email must be a valid email address.' })
  @IsNotEmpty({ message: 'email is required.' })
  @Transform(({ value }) => value?.trim())
  email: string;

  @ApiProperty({
    example: 'securePassword123!',
    description:
      'The password of the user (minimum length of 6 characters, no spaces, must be alphanumeric and can include special characters).',
  })
  @IsString({ message: 'password must be a valid string.' })
  @IsNotEmpty({ message: 'password is required.' })
  @MinLength(6, { message: 'Password must be at least 6 characters long.' })
  @Matches(
    /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!@#$%^&*()_+={}\[\]:;"'<>,.?~`-]{6,}$/,
    {
      message:
        'Password must be at least 6 characters long, contain no spaces, and include both letters and numbers. Special characters are allowed but not required.',
    },
  )
  @Transform(({ value }) => value?.trim())
  password: string;

  @ApiPropertyOptional({
    example: UserRole.APPLICANT,
    enum: UserRole,
    description: 'The role of the user.',
  })
  @IsEnum(UserRole, {
    message: `role must be one of ${Object.values(UserRole).join(', ')}.`,
  })
  @IsOptional()
  role: string = UserRole.APPLICANT;

  @ApiProperty({
    enum: CareerType,
    example: CareerType.OFFICE,
    description:
      'Career type of the user. Must be one of: Office, At sea, Onshore',
  })
  @IsEnum(CareerType, {
    message: `career_type must be one of: ${Object.values(CareerType).join(', ')}`,
  })
  career_type: CareerType;

  @ApiProperty({ default: false })
  isJobAlerts: boolean;

  @ApiProperty({ default: false })
  isNewsLetters: boolean;

  @ApiProperty({ default: false })
  isPrivacyPolicy: boolean;
}

export class forgetPasswordDto {
  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'The email address of the user requesting password reset.',
  })
  @IsEmail({}, { message: 'email must be a valid email address.' })
  @IsNotEmpty({ message: 'email is required.' })
  @Transform(({ value }) => value?.trim())
  email: string;
}

export class LoginDTO {
  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'The email address of the user.',
  })
  @IsEmail({}, { message: 'email must be a valid email address.' })
  @IsNotEmpty({ message: 'email is required.' })
  @Transform(({ value }) => value?.trim())
  email: string;

  @ApiProperty({
    example: 'securePassword123!',
    description: 'The password of the user.',
  })
  @IsString({ message: 'password must be a valid string.' })
  @IsNotEmpty({ message: 'password is required.' })
  @Transform(({ value }) => value?.trim())
  password: string;
}

export class ResetPasswordDto {
  @ApiProperty({
    example: 'valid-reset-token',
    description: 'The reset token provided for password reset.',
  })
  @IsString({ message: 'token must be a valid string.' })
  @IsNotEmpty({ message: 'token is required.' })
  @Validate(IsNotWhitespace)
  @Transform(({ value }) => value?.trim())
  token: string;

  @ApiProperty({
    example: 'newSecurePassword123!',
    description:
      'The new password (minimum length of 6 characters, no spaces, must be alphanumeric and can include special characters).',
  })
  @IsString({ message: 'newPassword must be a valid string.' })
  @IsNotEmpty({ message: 'newPassword is required.' })
  @MinLength(6, { message: 'New password must be at least 6 characters long.' })
  @Matches(
    /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!@#$%^&*()_+={}\[\]:;"'<>,.?~`-]{6,}$/,
    {
      message:
        'New password must be at least 6 characters long, contain no spaces, and include both letters and numbers. Special characters are allowed but not required.',
    },
  )
  @Transform(({ value }) => value?.trim())
  newPassword: string;
}
export class ResendEmailDto {
  @ApiProperty({
    description: 'The email address to resend the verification email.',
    example: 'john.doe@example.com',
  })
  @IsNotEmpty({ message: 'Email address is required.' })
  @IsString({ message: 'Email must be a valid string.' })
  email: string;
}

export class ChangePasswordDto {
  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'The email address of the user.',
  })
  @IsEmail({}, { message: 'email must be a valid email address.' })
  @IsNotEmpty({ message: 'email is required.' })
  @Transform(({ value }) => value?.trim())
  email: string;

  @ApiProperty({
    example: 'securePassword123!',
    description:
      'The password of the user (minimum length of 6 characters, no spaces, must be alphanumeric and can include special characters).',
  })
  @IsString({ message: 'password must be a valid string.' })
  @IsNotEmpty({ message: 'password is required.' })
  @MinLength(6, { message: 'Password must be at least 6 characters long.' })
  @Matches(
    /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!@#$%^&*()_+={}\[\]:;"'<>,.?~`-]{6,}$/,
    {
      message:
        'Password must be at least 6 characters long, contain no spaces, and include both letters and numbers. Special characters are allowed but not required.',
    },
  )
  @Transform(({ value }) => value?.trim())
  oldPassword: string;

  @ApiProperty({
    example: 'securePassword123!',
    description:
      'The password of the user (minimum length of 6 characters, no spaces, must be alphanumeric and can include special characters).',
  })
  @IsString({ message: 'password must be a valid string.' })
  @IsNotEmpty({ message: 'password is required.' })
  @MinLength(6, { message: 'Password must be at least 6 characters long.' })
  @Matches(
    /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!@#$%^&*()_+={}\[\]:;"'<>,.?~`-]{6,}$/,
    {
      message:
        'Password must be at least 6 characters long, contain no spaces, and include both letters and numbers. Special characters are allowed but not required.',
    },
  )
  @Transform(({ value }) => value?.trim())
  newPassword: string;
}
