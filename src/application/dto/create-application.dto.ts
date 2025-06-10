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
  })
  @IsUUID(undefined, { message: 'job_id must be a valid UUID.' })
  @IsNotEmpty({ message: 'job_id is required.' })
  job_id: string;

  @ApiProperty({
    description: 'The unique identifier of the user applying for the job.',
  })
  @IsUUID(undefined, { message: 'user_id must be a valid UUID.' })
  @IsNotEmpty({ message: 'user_id is required.' })
  user_id: string;

  @ApiProperty()
  source_of_job: string;

  @ApiPropertyOptional({
    description: 'Additional information provided by the applicant (optional).',
    example: 'Looking for a flexible work schedule.',
  })
  additional_info?: string;
}
export class UpdateApplicationStatusDto {
  @ApiProperty({
    description: 'The unique identifier of the application.',
  })
  @IsUUID(undefined, { message: 'application_id must be a valid UUID.' })
  @IsNotEmpty({ message: 'application_id is required.' })
  id?: string;

  @ApiProperty({
    description:
      'The status of the application (accepted, rejected, or pending).',
  })
  @IsString({ message: 'status must be a valid string.' })
  @IsNotEmpty({ message: 'status is required.' })
  status?: string;
}
