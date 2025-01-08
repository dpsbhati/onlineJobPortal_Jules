import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Matches,
  Validate,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';


@ValidatorConstraint({ name: 'IsNotWhitespace', async: false })
export class IsNotWhitespace implements ValidatorConstraintInterface {
  validate(value: string, args: ValidationArguments) {
    if (typeof value !== 'string') return false;
    return value.trim().length > 0; // Ensures the string is not empty or whitespace-only
  }

  defaultMessage(args: ValidationArguments) {
    return `${args.property} must not be empty or contain only whitespace.`;
  }
}


export class CreateApplicationDto {
  @ApiProperty({
    description: 'The unique identifier of the job posting.',
    example: 'b3f5f1e7-5030-4b9f-baa2-510d195c7607',
  })
  @IsUUID(undefined, { message: 'job_id must be a valid UUID.' })
  @IsNotEmpty({ message: 'job_id is required.' })
  job_id: string;

  @ApiProperty({
    description: 'The unique identifier of the user applying for the job.',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID(undefined, { message: 'user_id must be a valid UUID.' })
  @IsNotEmpty({ message: 'user_id is required.' })
  user_id: string;

  @ApiPropertyOptional({
    description: 'A brief description of the application (optional).',
    example: 'Motivated candidate with strong skills in software development.',
  })
  @IsString({ message: 'description must be a valid string.' })
  @Validate(IsNotWhitespace)
  @Transform(({ value }) => value?.trim())
  @IsOptional()
  @MaxLength(250, { message: 'Description cannot exceed 250 characters.' })
  description?: string;

  @ApiPropertyOptional({
    description: 'Any additional comments or remarks (optional).',
    example: 'Applicant is open to relocation.',
  })
  @IsString({ message: 'comments must be a valid string.' })
  @Validate(IsNotWhitespace)
  @Transform(({ value }) => value?.trim())
  @IsOptional()
  @MaxLength(255, { message: 'Comments cannot exceed 255 characters.' })
  comments?: string;

  @ApiPropertyOptional({
    description: "The file path to the candidate's CV (optional).",
    example: '/uploads/cv/johndoe_cv.pdf',
  })
  @IsString({ message: 'cv_path must be a valid string.' })
  @Matches(/^\/uploads\/cv\/.+\.pdf$/, {
    message: 'CV path must be a valid file path ending with .pdf.',
  })
  @Transform(({ value }) => value?.trim())
  @IsOptional()
  cv_path?: string;

  @ApiPropertyOptional({
    description: 'Additional information provided by the applicant (optional).',
    example: 'Looking for a flexible work schedule.',
  })
  @IsString({ message: 'additional_info must be a valid string.' })
  @Validate(IsNotWhitespace)
  @Transform(({ value }) => value?.trim())
  @IsOptional()
  @MaxLength(500, {
    message: 'Additional information cannot exceed 500 characters.',
  })
  additional_info?: string;

  @ApiPropertyOptional({
    description: 'Previous work experiences shared by the applicant (optional).',
    example: 'Worked as a senior software developer at XYZ Corp.',
  })
  @IsString({ message: 'work_experiences must be a valid string.' })
  @Validate(IsNotWhitespace)
  @Transform(({ value }) => value?.trim())
  @IsOptional()
  @MaxLength(1000, {
    message: 'Work experiences cannot exceed 1000 characters.',
  })
  work_experiences?: string;
}
