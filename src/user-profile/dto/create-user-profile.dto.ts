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
} from 'class-validator';
import { Gender, PreferredJobShift } from '../entities/user-profile.entity';
import { Type } from 'class-transformer';

export class CreateUserProfileDto {

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
  dob: Date;

  @ApiProperty({ description: 'Gender of the user' })
  @IsNotEmpty({ message: 'gender cannot be empty or null' })
  @IsEnum(Gender, {
    message: `gender must be one of the following: ${Object.values(Gender).join(
      ', ',
    )}`,
  })
  gender: Gender;


  @ApiProperty({ description: 'Mobile number of the user' })
  @IsNotEmpty({ message: 'Mobile number cannot be empty' })
  @IsNumber()
  mobile: number;


  // Optional fields
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

  @ApiProperty({ description: 'Expected salary of the user' })
  @IsOptional()
  @IsString({ message: 'expected_salary must be a valid string' })
  expected_salary?: string;
}
