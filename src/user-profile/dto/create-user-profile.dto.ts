import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  IsDate,
  IsBoolean,
  IsNumber,
  MaxLength,
  Matches,
  Validate,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { Gender } from '../entities/user-profile.entity';
import { Type, Transform } from 'class-transformer';

/**
 * Custom Validator: Ensures strings are not just whitespace
 */
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

export class CreateUserProfileDto {
  @ApiProperty({ description: 'User role, e.g., admin or applicant' })
  @IsNotEmpty({ message: 'role cannot be empty' })
  @IsEnum(['admin', 'applicant'], {
    message: 'role must be either admin or applicant',
  })
  role: string;

  @ApiProperty({ description: 'First name of the user' })
  @IsNotEmpty({ message: 'first_name cannot be empty' })
  @IsString({ message: 'first_name must be a valid string' })
  @Validate(IsNotWhitespace, { message: 'first_name cannot contain only whitespace' })
  @MaxLength(50, { message: 'first_name cannot exceed 50 characters' })
  @Transform(({ value }) => value?.trim()) // Trim whitespace
  first_name: string;

  @ApiProperty({ description: 'Last name of the user' })
  @IsNotEmpty({ message: 'last_name cannot be empty' })
  @IsString({ message: 'last_name must be a valid string' })
  @Validate(IsNotWhitespace, { message: 'last_name cannot contain only whitespace' })
  @MaxLength(50, { message: 'last_name cannot exceed 50 characters' })
  @Transform(({ value }) => value?.trim()) // Trim whitespace
  last_name: string;

  @ApiProperty({ description: 'Date of Birth of user in ISO 8601 format' })
  @IsOptional()
  @IsDate({ message: 'dob must be a valid ISO 8601 date' })
  @Type(() => Date)
  dob?: Date;

  @ApiProperty({ description: 'Gender of the user' })
  @IsOptional()
  @IsEnum(Gender, {
    message: `gender must be one of the following: ${Object.values(Gender).join(', ')}`,
  })
  gender?: Gender;

  @ApiProperty({ description: 'Mobile number of the user' })
  @IsOptional()
  @IsNumber({}, { message: 'mobile must be a valid number' })
  mobile?: number;

  @ApiProperty({ description: 'Key skills of the user' })
  @IsOptional()
  @IsString({ message: 'key_skills must be a valid string' })
  @Validate(IsNotWhitespace, { message: 'key_skills cannot contain only whitespace' })
  @MaxLength(255, { message: 'key_skills cannot exceed 255 characters' })
  @Transform(({ value }) => value?.trim()) // Trim whitespace
  key_skills?: string;

  @ApiProperty({ description: 'Work experiences of the user' })
  @IsOptional()
  @IsString({ message: 'work_experiences must be a valid string' })
  @Validate(IsNotWhitespace, { message: 'work_experiences cannot contain only whitespace' })
  @MaxLength(1000, { message: 'work_experiences cannot exceed 1000 characters' })
  @Transform(({ value }) => value?.trim()) // Trim whitespace
  work_experiences?: string;

  @ApiProperty({ description: 'Current company of the user' })
  @IsOptional()
  @IsString({ message: 'current_company must be a valid string' })
  @Validate(IsNotWhitespace, { message: 'current_company cannot contain only whitespace' })
  @MaxLength(100, { message: 'current_company cannot exceed 100 characters' })
  @Transform(({ value }) => value?.trim()) // Trim whitespace
  current_company?: string;

  @ApiProperty({ description: 'Expected salary of the user' })
  @IsOptional()
  @IsString({ message: 'expected_salary must be a valid string' })
  @Validate(IsNotWhitespace, { message: 'expected_salary cannot contain only whitespace' })
  @MaxLength(50, { message: 'expected_salary cannot exceed 50 characters' })
  @Transform(({ value }) => value?.trim()) // Trim whitespace
  expected_salary?: string;

}
