import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength, Min, MinLength } from 'class-validator';
import { UUID } from 'crypto';

export class CreateJobPostingDto {
  @ApiProperty()
  id: UUID;

  @ApiProperty({ description: 'The title of the job posting', example: 'Software Engineer' })
  @IsString()
  @IsNotEmpty()
  @MinLength(5, { message: 'Title must be atleast 5 characters long ' })
  @MaxLength(100, { message: 'Title cannot exceed 100 characters' })
  title: string;

  @ApiProperty({ description: 'The description of the job posting', example: 'Develop and maintain web applications.' })
  @IsString({ message: 'Description must be a string' })
  @IsNotEmpty({ message: 'Description is required' })
  @MinLength(10, { message: 'Description must be at least 10 characters long' })
  @MaxLength(1000, { message: 'Description cannot exceed 1000 characters' })
  description: string;

  @ApiProperty({ description: 'The name of the company offering the job', example: 'TechTop' })
  @IsString({ message: 'Company name must be a string' })
  @IsNotEmpty({ message: 'Company name is required' })
  @MinLength(2, { message: 'Company name must be at least 2 characters long' })
  @MaxLength(100, { message: 'Company name cannot exceed 100 characters' })
  company: string;

  @ApiProperty({ description: 'The location of the job', example: 'INDIA, USA' })
  @IsString({ message: 'Location must be a string' })
  @IsNotEmpty({ message: 'Location is required' })
  @MaxLength(200, { message: 'Location cannot exceed 200 characters' })
  location: string;

  @ApiProperty({ description: 'The salary offered for the position', example: 85000 })
  @IsNumber({}, { message: 'Salary must be a number' })
  @Min(0, { message: 'Salary must be at least 0' })
  salary: number;

  @ApiProperty({ description: 'The date the job was posted', example: '2024-12-17T00:00:00.000Z' })
  @IsDate({ message: 'Posted date must be a valid date' })
  @Type(() => Date) // Converts string to Date
  @IsOptional()
  postedDate: Date;

  // @ApiProperty({ default: false })
  is_deleted: boolean = false;

}
