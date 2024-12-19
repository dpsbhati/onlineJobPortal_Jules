import { IsNotEmpty, IsOptional, IsString, IsEnum, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

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

  @ApiProperty({
    description: 'The status of the application. Defaults to "Pending" if not provided.',
    enum: ['Pending', 'Shortlisted', 'Rejected', 'Hired'],
    example: 'Pending',
    required: false,
  })
  @IsEnum(['Pending', 'Shortlisted', 'Rejected', 'Hired'])
  @IsOptional()
  status?: string;

  @ApiProperty({
    description: 'A brief description of the application (optional).',
    required: false,
    example: 'Motivated candidate with strong skills in software development.',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Any additional comments or remarks (optional).',
    required: false,
    example: 'Applicant is open to relocation.',
  })
  @IsString()
  @IsOptional()
  comments?: string;

  @ApiProperty({
    description: 'The file path to the candidate\'s CV (optional).',
    required: false,
    example: '/uploads/cv/johndoe_cv.pdf',
  })
  @IsString()
  @IsOptional()
  cv_path?: string;

  @ApiProperty({
    description: 'Additional information provided by the applicant (optional).',
    required: false,
    example: 'Looking for a flexible work schedule.',
  })
  @IsString()
  @IsOptional()
  additional_info?: string;
  
  @ApiProperty({
    description: 'Previous work experiences shared by the applicant (optional).',
    required: false,
    example: 'Worked as a senior software developer at XYZ Corp.',
  })
  @IsString()
  @IsOptional()
  work_experiences?: string;
}
