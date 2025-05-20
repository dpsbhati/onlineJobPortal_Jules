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
}
