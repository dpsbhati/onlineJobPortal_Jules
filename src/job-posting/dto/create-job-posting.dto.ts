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
  IsDateString,
} from 'class-validator';
import {
  JobOpeningStatus,
  JobPostStatus,
  JobTypePost,
} from '../entities/job-posting.entity';

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

job_opening: JobOpeningStatus;
isActive: boolean;

  job_type: string;

  @ApiProperty({
    description: 'Job type post method',
    example: JobTypePost.POST_NOW,
    enum: JobTypePost,
  })
  @IsOptional()
  @IsEnum(JobTypePost, {
    message: `job_type_post must be one of: ${Object.values(JobTypePost).join(', ')}`,
  })
  job_type_post?: JobTypePost;

  @ApiProperty({
    description: 'The featured image URL',
    example: 'https://example.com/image.jpg',
  })
  @Transform(({ value }) => value?.trim())
  featured_image: string;

  title: string;

  // @ApiProperty({
  //   description: 'The date the job was published',
  //   example: '2024-12-17T00:00:00.000Z',
  // })
  // @IsNotEmpty({ message: 'date_published is required.' })
  // @IsDate({ message: 'date_published must be a valid date.' })
  // @Type(() => Date)
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
  short_description: string;

  full_description: string;

  @ApiProperty({
    description: 'The starting salary',
    example: 50000,
  })
  start_salary: string;

  applicant_number: number;

  @ApiProperty()
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

  // @ApiProperty({
  //   description: 'The skills required for the job',
  //   example: 'Java, Python, SQL',
  // })
  skills_required: string;

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
    message:
      'Employee experience details cannot exceed 1000employee_experience characters.',
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
    default: JobPostStatus.DRAFT,
    description: 'Job post status',
    enum: JobPostStatus,
  })
  @IsOptional()
  @IsEnum(JobPostStatus)
  jobpost_status?: JobPostStatus;

  @ApiProperty({
    description: 'The date and time when the job is scheduled to be posted.',
    example: '10:30',
  })
  @IsOptional()
  posted_at?: string;

  @ApiProperty({
    description: 'The date when the job is scheduled to be posted.',
    example: '2025-01-15',
  })
  posted_date: string;

  @ApiProperty({
    description: 'The social media platforms where the job will be posted.',
    example: ['facebook', 'linkedin'],
    isArray: true,
  })
  @IsOptional()
  social_media_type?: any;
}
export class UpdateDeadlineDto {
  @ApiProperty()
  job_id: string;

  @ApiProperty()
  deadline: Date;

  isActive: true;
  job_opening: JobOpeningStatus.OPEN;
}

export class Changejobstatus {
  @ApiProperty()
  job_id: string;

  @ApiProperty()
  job_opening: JobOpeningStatus;

  isActive: boolean;

  deadline: Date;
}
