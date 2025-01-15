import { Injectable } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  Validate,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  IsIn,
  IsArray,
} from 'class-validator';

@ValidatorConstraint({ name: 'IsNotWhitespace', async: false })
@Injectable()
export class IsNotWhitespace implements ValidatorConstraintInterface {
  validate(value: string, args: ValidationArguments) {
    if (typeof value !== 'string') return false;
    return value.trim().length > 0;
  }

  defaultMessage(args: ValidationArguments) {
    return `${args.property} must not be empty or contain only whitespace.`;
  }
}

@ValidatorConstraint({ name: 'IsImageFormat', async: false })
@Injectable()
export class IsImageFormat implements ValidatorConstraintInterface {
  validate(value: string, args: ValidationArguments) {
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    return allowedExtensions.some((ext) => value.toLowerCase().endsWith(ext));
  }

  defaultMessage(args: ValidationArguments) {
    return `featured_image must be a valid image file (e.g., .jpg, .jpeg, .png, .gif, .webp).`;
  }
}

export class CreateJobPostingDto {
  @ApiProperty({
    description: 'Unique identifier for the job posting (required for updates)',
    example: 'job-id-1',
  })
  @IsOptional()
  @IsUUID(undefined, { message: 'id must be a valid UUID.' })
  id?: string;

  @ApiProperty({
    description: 'The job type',
    example: 'Full-time',
    enum: ['Full-Time', 'Part-Time', 'Flexible'],
  })
  @IsNotEmpty({ message: 'job_type is required.' })
  @IsString({ message: 'job_type must be a valid string.' })
  @IsIn(['Full-Time', 'Part-Time', 'Flexible'], {
    message:
      'job_type must be one of the following: Full-Time, Part-Time, Flexible.',
  })
  @Validate(IsNotWhitespace)
  @Transform(({ value }) => value?.trim())
  @MaxLength(50, { message: 'Job type cannot exceed 50 characters.' })
  job_type: string;

  @ApiProperty({
    description: 'The featured image URL',
    example: 'https://example.com/image.jpg',
  })
  @IsNotEmpty({ message: 'featured_image is required.' })
  @IsString({ message: 'featured_image must be a valid string.' })
  @Validate(IsImageFormat)
  @Transform(({ value }) => value?.trim())
  @MaxLength(255, {
    message: 'Featured image URL cannot exceed 255 characters.',
  })
  featured_image: string;

  @ApiProperty({
    description: 'The title of the job posting',
    example: 'Software Engineer',
  })
  @IsNotEmpty({ message: 'title is required.' })
  @IsString({ message: 'title must be a valid string.' })
  @Validate(IsNotWhitespace)
  @Transform(({ value }) => value?.trim())
  @MaxLength(150, { message: 'Title cannot exceed 150 characters.' })
  title: string;

  @ApiProperty({
    description: 'The date the job was published',
    example: '2024-12-17T00:00:00.000Z',
  })
  @IsNotEmpty({ message: 'date_published is required.' })
  @IsDate({ message: 'date_published must be a valid date.' })
  @Type(() => Date)
  date_published: Date;

  @ApiProperty({
    description: 'The deadline for the job application',
    example: '2025-01-01T00:00:00.000Z',
  })
  @IsNotEmpty({ message: 'deadline is required.' })
  @IsDate({ message: 'deadline must be a valid date.' })
  @Type(() => Date)
  deadline: Date;

  @ApiProperty({
    description: 'A short description of the job',
    example: 'Exciting opportunity in software development.',
  })
  @IsNotEmpty({ message: 'short_description is required.' })
  @IsString({ message: 'short_description must be a valid string.' })
  @Validate(IsNotWhitespace)
  @Transform(({ value }) => value?.trim())
  // @MaxLength(255, {
  //   message: 'Short description cannot exceed 255 characters.',
  // })
  short_description: string;

  @ApiProperty({
    description: 'A detailed description of the job',
    example: 'You will work on full-stack development projects...',
  })
  @IsNotEmpty({ message: 'full_description is required.' })
  @IsString({ message: 'full_description must be a valid string.' })
  @Validate(IsNotWhitespace)
  @Transform(({ value }) => value?.trim())
  full_description: string;

  @ApiProperty({
    description: 'The starting salary',
    example: 50000,
  })
  @IsNotEmpty({ message: 'start_salary is required.' })
  @IsNumber({}, { message: 'start_salary must be a valid number.' })
  @Min(0, { message: 'Starting salary must be at least 0.' })
  start_salary: number;

  @ApiProperty({
    description: 'The ending salary',
    example: 100000,
  })
  @IsNotEmpty({ message: 'end_salary is required.' })
  @IsNumber({}, { message: 'end_salary must be a valid number.' })
  @Min(0, { message: 'Ending salary must be at least 0.' })
  end_salary: number;

  @ApiProperty({
    description: 'The job location address',
    example: '123 Main Street, City Name',
  })
  @IsNotEmpty({ message: 'address is required.' })
  @IsString({ message: 'address must be a valid string.' })
  @Validate(IsNotWhitespace)
  @Transform(({ value }) => value?.trim())
  @MaxLength(255, { message: 'Address cannot exceed 255 characters.' })
  address: string;

  @ApiProperty({
    description: 'The duration of the assignment',
    example: '6 months',
  })
  @IsNotEmpty({ message: 'assignment_duration is required.' })
  @IsString({ message: 'assignment_duration must be a valid string.' })
  @Validate(IsNotWhitespace)
  @Transform(({ value }) => value?.trim())
  @MaxLength(50, {
    message: 'Assignment duration cannot exceed 50 characters.',
  })
  assignment_duration: string;

  @ApiProperty({
    description: 'The name of the employer',
    example: 'TechTop',
  })
  @IsNotEmpty({ message: 'employer is required.' })
  @IsString({ message: 'employer must be a valid string.' })
  @Validate(IsNotWhitespace)
  @Transform(({ value }) => value?.trim())
  @MaxLength(100, {
    message: 'Employer name cannot exceed 100 characters.',
  })
  employer: string;

  @ApiProperty({
    description: 'Rank for the job',
    example: 'Managerial',
  })
  @IsNotEmpty({ message: 'rank is required.' })
  @IsString({ message: 'rank must be a valid string.' })
  @Validate(IsNotWhitespace)
  @Transform(({ value }) => value?.trim())
  @MaxLength(50, { message: 'Rank cannot exceed 50 characters.' })
  rank: string;

  @ApiProperty({
    description: 'Instructions for applying to the job',
    example:
      'Please submit your resume and cover letter through the application portal.',
  })
  @IsOptional()
  @IsString({ message: 'application_instruction must be a valid string.' })
  @Validate(IsNotWhitespace)
  @Transform(({ value }) => value?.trim())
  @MaxLength(1000, {
    message: 'application_instruction cannot exceed 1000 characters.',
  })
  application_instruction?: string;

  @ApiPropertyOptional({
    description: 'Employee experience details for the job',
    example: 'Previous experience in management is preferred.',
  })
  @IsString({ message: 'employee_experience must be a valid string.' })
  @Validate(IsNotWhitespace)
  @Transform(({ value }) => value?.trim())
  @IsOptional()
  @MaxLength(500, {
    message: 'Employee experience details cannot exceed 1000employee_experience characters.',
  })
  employee_experience?: string;

  @ApiProperty({
    description: 'Required experience for the job',
    example: '3-5 years',
  })
  @IsNotEmpty({ message: 'required_experience is required.' })
  @IsString({ message: 'required_experience must be a valid string.' })
  @Validate(IsNotWhitespace)
  @Transform(({ value }) => value?.trim())
  @MaxLength(50, {
    message: 'Required experience cannot exceed 50 characters.',
  })
  required_experience: string;

  @ApiProperty({
    description: 'The status of the job posting (draft or posted)',
    example: 'draft',
  })
  @IsOptional()
  @IsEnum(['draft', 'posted'], {
    message: 'jobpost_status must be either draft or posted.',
  })
  jobpost_status?: string;

  @ApiProperty({
    description: 'The date and time when the job is scheduled to be posted.',
    example: '2025-01-15T10:30:00.000Z',
  })
  @IsOptional()
  // @IsDate({ message: 'posted_at must be a valid ISO date.' })
  // @Type(() => Date)
  posted_at?: String;

  @ApiProperty({
    description: 'The social media platforms where the job will be posted.',
    example: ['facebook', 'linkedin'],
    isArray: true,
  })
  @IsOptional()
  // @IsIn(['facebook', 'linkedin'], {
  //   message: 'Invalid social_media_type. Allowed values are: facebook, linkedin, both.',
  // })
  social_media_type?: string[];

  
}
