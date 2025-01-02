import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Matches,
} from 'class-validator';

export class CreateApplicationDto {
  @ApiProperty({
    description: 'The unique identifier of the job posting.',
    example: 'b3f5f1e7-5030-4b9f-baa2-510d195c7607',
  })
  @IsUUID()
  @IsNotEmpty()
  job_id: string;

  @ApiProperty({
    description: 'The unique identifier of the user applying for the job.',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  user_id: string;

  @ApiPropertyOptional({
    description: 'A brief description of the application (optional).',
    example: 'Motivated candidate with strong skills in software development.',
  })
  @IsString()
  @IsOptional()
  @MaxLength(250, { message: 'Description cannot exceed 500 characters' })
  description?: string;

  @ApiPropertyOptional({
    description: 'Any additional comments or remarks (optional).',
    example: 'Applicant is open to relocation.',
  })
  @IsString()
  @IsOptional()
  @MaxLength(255, { message: 'Comments cannot exceed 255 characters' })
  comments?: string;

  @ApiPropertyOptional({
    description: "The file path to the candidate's CV (optional).",
    example: '/uploads/cv/johndoe_cv.pdf',
  })
  @IsString()
  @IsOptional()
  @Matches(/^\/uploads\/cv\/.+\.pdf$/, {
    message: 'CV path must be a valid file path ending with .pdf',
  })
  cv_path?: string;

  @ApiPropertyOptional({
    description: 'Additional information provided by the applicant (optional).',
    example: 'Looking for a flexible work schedule.',
  })
  @IsString()
  @IsOptional()
  @MaxLength(500, {
    message: 'Additional information cannot exceed 500 characters',
  })
  additional_info?: string;

  @ApiPropertyOptional({
    description:
      'Previous work experiences shared by the applicant (optional).',
    example: 'Worked as a senior software developer at XYZ Corp.',
  })
  @IsString()
  @IsOptional()
  @MaxLength(1000, {
    message: 'Work experiences cannot exceed 1000 characters',
  })
  work_experiences?: string;
}
