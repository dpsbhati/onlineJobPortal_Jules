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
  IsArray,
  IsIn,
} from 'class-validator';

/**
 * Custom Validator: Ensures strings are not just whitespace
 */
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
    // example: 'b3f5f1e7-5030-4b9f-baa2-510d195c7607',
  })
  @IsUUID(undefined, { message: 'job_id must be a valid UUID.' })
  @IsNotEmpty({ message: 'job_id is required.' })
  job_id: string;

  @ApiProperty({
    description: 'The unique identifier of the user applying for the job.',
    // example: '123e4567-e89b-12d3-a456-426614174000',
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
  @Matches(/^(\/uploads\/cv\/)?.+\.(pdf|doc|docx)$/i, {
    message:
      'cv_path must be a valid file path ending with .pdf, .doc, or .docx.',
  })
  cv_path?: string;

  @ApiProperty({
    description: 'The status of the application.',
    example: '',
  })
  // @IsString({ message: 'status must be a valid string.' })
  // Removed @IsIn decorator to allow any string
  status: string;

  // @ApiProperty({
  //   description: 'The status of the application.',
  //   example: '',
  // })
  // @IsString({ message: 'status must be a valid string.' })
  // @IsIn(['Pending', 'Shortlisted', 'Rejected', 'Hired'], {
  //   // message: 'status must be one of Pending, Shortlisted, Rejected, or Hired.',
  // })
  // // @IsNotEmpty({ message: 'status is required.' }) // Make status mandatory
  // status: string;

  @ApiPropertyOptional({
    description:
      'The file path for certifications (optional). Must be one of pdf, image, or doc formats.',
    example: '/uploads/certifications/certification.pdf',
  })
  @IsString({ message: 'certification_path must be a valid string.' })
  @Matches(/\.(pdf|jpg|jpeg|png|doc|docx)$/i, {
    message: '',
  })
  @Transform(({ value }) => value?.trim())
  @IsOptional()
  certification_path?: string;

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
    description:
      'Previous work experiences shared by the applicant (optional).',
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

  @ApiPropertyOptional({
    description:
      'List of courses and certifications relevant to the job, including PDF files',
    example: [
      {
        organization_name: 'Course 1',
        certification_description: 'Description of Course 1',
        start_date: '2020-01-01',
        end_date: '2020-12-31',
        certification_file: 'course1.pdf',
      },
      {
        organization_name: 'Certification 1',
        certification_description: 'Description of Certification 1',
        start_date: '2021-01-01',
        end_date: '2021-12-31',
        certification_file: 'certification1.pdf',
      },
    ],
  })
  @IsOptional()
  @IsArray()
  // @Validate(IsNotWhitespace, { each: true })
  courses_and_certification?: {
    organization_name: string;
    certification_description?: string;
    start_date?: Date;
    end_date?: Date;
    certification_file?: string;
  }[];
}
