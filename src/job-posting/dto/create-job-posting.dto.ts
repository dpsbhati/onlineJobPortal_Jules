import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, MaxLength, Min } from 'class-validator';
import { UUID } from 'crypto';

export class CreateJobPostingDto {
  @ApiProperty({ example: 'job-id-1', description: 'Unique identifier for the job posting (optional)' })
  @IsOptional()
  @IsUUID()
  id?: string; // Optional for updates

  @ApiProperty({ description: 'The job type', example: 'Full-time' })
  @IsString()
  @IsOptional()
  @MaxLength(50, { message: 'Job type cannot exceed 50 characters' })
  job_type: string;

  @ApiProperty({ description: 'The qualifications required', example: 'Bachelor\'s Degree in Computer Science' })
  @IsString()
  @IsOptional()
  @MaxLength(255, { message: 'Qualifications cannot exceed 255 characters' })
  qualifications: string;

  @ApiProperty({ description: 'Skills required for the job', example: 'JavaScript, TypeScript' })
  @IsString()
  @IsOptional()
  @MaxLength(255, { message: 'Skills required cannot exceed 255 characters' })
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
  @MaxLength(255, { message: 'Short description cannot exceed 255 characters' })
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

  @ApiProperty({ description: 'The country code of the job location', example: 91 })
  @IsNumber()
  @IsOptional()
  country_code: number;

  @ApiProperty({ description: 'The job location address', example: '123 Main Street, City Name' })
  @IsString()
  @IsOptional()
  @MaxLength(255, { message: 'Address cannot exceed 255 characters' })
  address: string;

  @ApiProperty({ description: 'The type of work', example: 'Remote, On-site' })
  @IsString()
  @IsOptional()
  @MaxLength(50, { message: 'Work type cannot exceed 50 characters' })
  work_type: string;

  @ApiProperty({ description: 'The file path for related documents or images', example: '/uploads/jobs/job-id-1/file.pdf' })
  file_path: string; 
}

export class FindAllJobPostingsQueryDto {
  @ApiPropertyOptional({ description: 'Page number for pagination', example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Page must be a valid number' })
  page: number;

  @ApiPropertyOptional({ description: 'Number of records per page', example: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Limit must be a valid number' })
  limit: number;

  @ApiPropertyOptional({ description: 'Search keyword for job title or employer', example: 'Engineer' })
  @IsOptional()
  @IsString()
  @MaxLength(255, { message: 'Search keyword cannot exceed 255 characters' })
  search: string;

  @ApiPropertyOptional({ description: 'Field to sort by', example: 'title' })
  @IsOptional()
  @IsString()
  @MaxLength(50, { message: 'Sort field cannot exceed 50 characters' })
  sortField: string;

  @ApiPropertyOptional({ description: 'Sort order (ASC or DESC)', example: 'DESC' })
  @IsOptional()
  @IsString()
  @MaxLength(4, { message: 'Sort order must be ASC or DESC' })
  sortOrder: string;
}

export class FindOneJobPostingQueryDto {
  @ApiProperty({ description: 'The key to search by (e.g., id, title)', example: 'id' })
  @IsString()
  @IsNotEmpty({ message: 'Key is required' })
  @MaxLength(50, { message: 'Key cannot exceed 50 characters' })
  key: string;

  @ApiProperty({ description: 'The value to search for', example: 'job-id-1' })
  @IsString()
  @IsNotEmpty({ message: 'Value is required' })
  @MaxLength(255, { message: 'Value cannot exceed 255 characters' })
  value: string;
}
