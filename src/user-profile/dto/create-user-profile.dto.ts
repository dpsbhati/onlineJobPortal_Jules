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
} from 'class-validator';
import { Gender, PreferredJobShift } from '../entities/user-profile.entity';
import { Type } from 'class-transformer';

export class CreateUserProfileDto {
  @ApiProperty({ description: 'Unique identifier for the user profile' })
  @IsOptional()
  @IsUUID(4, { message: 'id of the user should be a valid UUID' })
  id: string;

  @ApiProperty({ description: 'Id of the user' })
  @IsNotEmpty({ message: 'user_id cannot be empty or null' })
  @IsUUID(4, { message: 'user_id must be a valid UUID' })
  user_id: string;

  @ApiProperty({ description: 'First name of the user' })
  @IsNotEmpty({ message: 'first_name cannot be empty' })
  @IsString({ message: 'first_name must be a valid string' })
  first_name: string;

  @ApiProperty({ description: 'Last name of the user' })
  @IsNotEmpty({ message: 'last_name cannot be empty' })
  @IsString({ message: 'last_name must be a valid string' })
  last_name: string;

  @ApiProperty({ description: 'Date of Birth of user in ISO 8601 format' })
  @IsNotEmpty({ message: 'dob cannot be empty' })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  dob: Date;

  @ApiProperty({ description: 'Gender of the user' })
  @IsNotEmpty({ message: 'gender cannot be empty or null' })
  @IsEnum(Gender, {
    message: `gender must be one of the following: ${Object.values(Gender).join(
      ', ',
    )}`,
  })
  gender: Gender;

  @ApiProperty({ description: 'Email of the user' })
  @IsNotEmpty({ message: 'email of the user cannot be empty' })
  @IsEmail({}, { message: 'Please enter a valid email address.' })
  email: string;

  @ApiProperty({ description: 'Mobile number of the user' })
  @IsNotEmpty({ message: 'Mobile number cannot be empty' })
  @IsString({ message: 'mobile must be a valid string' })
  mobile: string;

  @ApiProperty({ description: 'Key skills of the user' })
  @IsOptional()
  @IsString({ message: 'key_skills must be a valid string' })
  key_skills?: string;

  @ApiProperty({ description: 'Work experiences of the user' })
  @IsOptional()
  @IsString({ message: 'work_experiences must be a valid string' })
  work_experiences?: string;

  @ApiProperty({ description: 'Current company of the user' })
  @IsOptional()
  @IsString({ message: 'current_company must be a valid string' })
  current_company?: string;

  @ApiProperty({ description: 'Current salary of the user' })
  @IsOptional()
  @IsString({ message: 'current_salary must be a valid string' })
  current_salary?: string;

  @ApiProperty({ description: 'Expected salary of the user' })
  @IsOptional()
  @IsString({ message: 'expected_salary must be a valid string' })
  expected_salary?: string;

  @ApiProperty({ description: 'Preferred job location of the user' })
  @IsOptional()
  @IsString({ message: 'preferred_location must be a valid string' })
  preferred_location?: string;

  @ApiProperty({ description: 'Preferred job role of the user' })
  @IsOptional()
  @IsString({ message: 'preferred_job_role must be a valid string' })
  preferred_job_role?: string;

  @ApiProperty({ description: 'Preferred job shift of the user' })
  @IsOptional()
  @IsEnum(PreferredJobShift, {
    message: `preferred_shift must be one of the following: ${Object.values(
      PreferredJobShift,
    ).join(', ')}`,
  })
  preferred_shift?: PreferredJobShift;

  @ApiProperty({ description: 'Languages known by the user' })
  @IsOptional()
  @IsString({ message: 'languages_known must be a valid string' })
  languages_known?: string;

  @ApiProperty({ description: 'File path for related documents or images' })
  @IsOptional()
  @IsString({ message: 'file must be a valid string' })
  file?: string;

  @ApiProperty({ description: 'Created by user ID' })
  @IsNotEmpty({ message: 'created_by cannot be empty' })
  @IsString({ message: 'created_by must be a valid string' })
  created_by: string;

  @ApiProperty({ description: 'Updated by user ID' })
  @IsNotEmpty({ message: 'updated_by cannot be empty' })
  @IsString({ message: 'updated_by must be a valid string' })
  updated_by: string;

  @ApiProperty({ description: 'Whether the user profile is deleted' })
  @IsOptional()
  @IsBoolean({ message: 'is_deleted must be a boolean value' })
  is_deleted?: boolean;
}
