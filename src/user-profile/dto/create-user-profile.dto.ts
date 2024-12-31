import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from "class-validator";
import { PrimaryGeneratedColumn } from "typeorm";
import { Gender } from "../entities/user-profile.entity";


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

  @ApiProperty({ description: 'Date of Birth of user' })
  @IsNotEmpty({ message: 'dob cannot be empty' })
  @IsString({ message: 'dob must be a valid ISO 8601 date string' }) // Add explicit validation for date
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
  @IsEmail({}, { message: 'email must be a valid email address' })
  email: string;

  @ApiProperty({ description: 'Mobile number of the user' })
  @IsNotEmpty({ message: 'Mobile number cannot be empty' })
  @IsString({ message: 'mobile must be a valid string' })
  mobile: string;

  @ApiProperty({
    description: 'The file path for related documents or images',
    example: '/uploads/jobs/job-id-1/file.pdf',
  })
  @IsOptional()
  @IsString({ message: 'file_path must be a valid string' })
  file_path: string;
}

