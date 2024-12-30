import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString, IsUUID } from "class-validator";

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
  description?: string;

  @ApiPropertyOptional({
    description: 'Any additional comments or remarks (optional).',
    example: 'Applicant is open to relocation.',
  })
  @IsString()
  @IsOptional()
  comments?: string;

  @ApiPropertyOptional({
    description: 'The file path to the candidate\'s CV (optional).',
    example: '/uploads/cv/johndoe_cv.pdf',
  })
  @IsString()
  @IsOptional()
  cv_path?: string;

  @ApiPropertyOptional({
    description: 'Additional information provided by the applicant (optional).',
    example: 'Looking for a flexible work schedule.',
  })
  @IsString()
  @IsOptional()
  additional_info?: string;

  @ApiPropertyOptional({
    description: 'Previous work experiences shared by the applicant (optional).',
    example: 'Worked as a senior software developer at XYZ Corp.',
  })
  @IsString()
  @IsOptional()
  work_experiences?: string;
}
