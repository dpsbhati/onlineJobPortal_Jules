import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength, Min, MinLength } from 'class-validator';
import { UUID } from 'crypto';

export class CreateJobPostingDto {
  @ApiProperty()
  id: UUID;

  @ApiProperty({ description: 'The job type', example: 'Full-time' })
  @IsString()
  @IsOptional()
  @MaxLength(50, { message: 'Job type cannot exceed 50 characters' })
  job_type: string;

  @ApiProperty({ description: 'The qualifications required', example: 'Bachelor\'s Degree in Computer Science' })
  @IsString()
  @IsOptional()
  qualifications: string;

  @ApiProperty({ description: 'Skills required for the job', example: 'JavaScript, TypeScript' })
  @IsString()
  @IsOptional()
  skills_required: string;

  @ApiProperty({ description: 'The title of the job posting', example: 'Software Engineer' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150, { message: 'Title cannot exceed 150 characters' })
  title: string;

  @ApiProperty({ description: 'The featured image URL', example: 'https://example.com/image.jpg' })
  @IsString()
  @IsOptional()
  @MaxLength(255, { message: 'Featured image URL cannot exceed 255 characters' })
  featured_image: string;

  @ApiProperty({ description: 'The date the job was published', example: '2024-12-17T00:00:00.000Z' })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  date_published: Date;

  @ApiProperty({ description: 'The deadline for the job application', example: '2025-01-01T00:00:00.000Z' })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  deadline: Date;

  @ApiProperty({ description: 'A short description of the job', example: 'Exciting opportunity in software development.' })
  @IsString()
  @IsOptional()
  short_description: string;

  @ApiProperty({ description: 'A detailed description of the job', example: 'You will work on full-stack development projects...' })
  @IsString()
  @IsOptional()
  full_description: string;

  @ApiProperty({ description: 'The duration of the assignment', example: '6 months' })
  @IsString()
  @IsOptional()
  @MaxLength(50, { message: 'Assignment duration cannot exceed 50 characters' })
  assignment_duration: string;

  @ApiProperty({ description: 'The name of the employer', example: 'TechTop' })
  @IsString()
  @IsOptional()
  @MaxLength(100, { message: 'Employer name cannot exceed 100 characters' })
  employer: string;

  @ApiProperty({ description: 'The rank for the job', example: 'Senior' })
  @IsString()
  @IsOptional()
  @MaxLength(50, { message: 'Rank cannot exceed 50 characters' })
  rank: string;

  @ApiProperty({ description: 'Required experience', example: '3-5 years' })
  @IsString()
  @IsOptional()
  @MaxLength(50, { message: 'Required experience cannot exceed 50 characters' })
  required_experience: string;

  @ApiProperty({ description: 'The starting salary', example: 50000 })
  @IsNumber()
  @Min(0, { message: 'Starting salary must be at least 0' })
  @IsOptional()
  start_salary: number;

  @ApiProperty({ description: 'The ending salary', example: 100000 })
  @IsNumber()
  @Min(0, { message: 'Ending salary must be at least 0' })
  @IsOptional()
  end_salary: number;

  @ApiProperty({ description: 'The exact salary', example: 75000 })
  @IsNumber()
  @Min(0, { message: 'Salary must be at least 0' })
  @IsOptional()
  salary: number;

  @ApiProperty({ description: 'The country code of the job location', example: 91 })
  @IsNumber()
  @IsOptional()
  country_code: number;

  @ApiProperty({ description: 'The state code of the job location', example: 27 })
  @IsNumber()
  @IsOptional()
  state_code: number;

  @ApiProperty({ description: 'The city code of the job location', example: 110001 })
  @IsNumber()
  @IsOptional()
  city: number;

  @ApiProperty({ description: 'The job location address', example: '123 Main Street, City Name' })
  @IsString()
  @IsOptional()
  @MaxLength(255, { message: 'Address cannot exceed 255 characters' })
  address: string;

  // @ApiProperty({ description: 'Whether the job posting is deleted', default: false })
  is_deleted: boolean = false;

  @ApiProperty({ description: 'The ID of the user who created the posting', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsString()
  @IsOptional()
  created_by: string;

  @ApiProperty({ description: 'The ID of the user who last updated the posting', example: '123e4567-e89b-12d3-a456-426614174001' })
  @IsString()
  @IsOptional()
  updated_by: string;

  @ApiProperty({ description: 'The type of work', example: 'Remote, On-site' })
  @IsString()
  @IsOptional()
  work_type: string;

}
