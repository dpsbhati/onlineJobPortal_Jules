import { ApiBody, ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  IsDate,
  IsBoolean,
  IsNumber,
  MaxLength,
  Matches,
  Validate,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  ValidateIf,
} from 'class-validator';
import { Gender } from '../entities/user-profile.entity';
import { Type, Transform } from 'class-transformer';
import {
  CertificationDto,
  CourseDto,
  EducationDto,
  WorkExperienceDto,
} from './career-info.dto';
import { OtherExperienceInfoDto, ProjectInfoDto } from './other-experience.dto';
import {
  AdditionalInfoDto,
  CurrentSalaryDto,
  ExpectedSalaryDto,
  LanguageSpokenDto,
  LanguageWrittenDto,
  NoticePeriodDto,
  PreferencesDto,
  VacancySourceDto,
} from './additional-info.dto';

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

class AdditionalContactInfo {
  @ApiProperty()
  contact_type: string;
  @ApiProperty()
  value: string;
}

export class CreateUserProfileDto {
  @ApiProperty()
  rank_id: string;
  
  @ApiProperty()
  dial_code: string;

  @ApiProperty()
  nationalities: string[];

  @ApiProperty()
  country: string;

  @ApiProperty()
  location: string;

  @ApiProperty({ type: [AdditionalContactInfo] })
  additional_contact_info: AdditionalContactInfo[];

  @ApiProperty()
  profile_image_path: string;

  @ApiProperty({ type: [WorkExperienceDto] })
  work_experience_info: WorkExperienceDto[];

  @ApiProperty()
  highest_education_level?: string;

  @ApiProperty({ type: [EducationDto] })
  education_info: EducationDto[];

  @ApiProperty({ type: [CourseDto] })
  course_info: CourseDto[];

  @ApiProperty({ type: [CertificationDto] })
  certification_info: CertificationDto[];

  @ApiProperty()
  cv_path: string;

  @ApiProperty()
  cv_name: string;

  @ApiProperty({ type: [OtherExperienceInfoDto] })
  other_experience_info: OtherExperienceInfoDto[];

  @ApiProperty({ type: [ProjectInfoDto] })
  project_info: ProjectInfoDto[];

  @ApiProperty({ type: [LanguageSpokenDto] })
  language_spoken_info: LanguageSpokenDto[];

  @ApiProperty({ type: [LanguageWrittenDto] })
  language_written_info: LanguageWrittenDto[];

  @ApiProperty()
  notice_period_info: NoticePeriodDto;

  @ApiProperty()
  current_salary_info: CurrentSalaryDto;

  @ApiProperty()
  expected_salary_info: ExpectedSalaryDto;

  @ApiProperty()
  preferences_info: PreferencesDto;

  @ApiProperty()
  additional_info: AdditionalInfoDto;

  @ApiProperty()
  vacancy_source_info: VacancySourceDto;

  // @ApiProperty({ description: 'User role, e.g., admin or applicant' })
  // @IsNotEmpty({ message: 'role cannot be empty' })
  // @IsEnum(['admin', 'applicant'], {
  //   message: 'role must be either admin or applicant',
  // })
  role: string;

  @ApiProperty({ description: 'First name of the user' })
  @IsNotEmpty({ message: 'first_name cannot be empty' })
  @IsString({ message: 'first_name must be a valid string' })
  @Validate(IsNotWhitespace, {
    message: 'first_name cannot contain only whitespace',
  })
  @MaxLength(50, { message: 'first_name cannot exceed 50 characters' })
  @Transform(({ value }) => value?.trim()) // Trim whitespace
  first_name: string;

  @ApiProperty({ description: 'Last name of the user' })
  @IsNotEmpty({ message: 'last_name cannot be empty' })
  @IsString({ message: 'last_name must be a valid string' })
  @Validate(IsNotWhitespace, {
    message: 'last_name cannot contain only whitespace',
  })
  @MaxLength(50, { message: 'last_name cannot exceed 50 characters' })
  @Transform(({ value }) => value?.trim()) // Trim whitespace
  last_name: string;

  @ApiProperty({ description: 'Date of Birth of user in ISO 8601 format' })
  @ValidateIf((dto: CreateUserProfileDto) => dto.role === 'applicant')
  @IsNotEmpty({ message: 'dob cannot be empty for applicants' })
  @IsDate({ message: 'dob must be a valid ISO 8601 date' })
  @Type(() => Date)
  dob?: Date;

  @ApiProperty({ description: 'Mobile number of the user' })
  @ValidateIf((dto: CreateUserProfileDto) => dto.role === 'applicant')
  @IsNotEmpty({ message: 'mobile cannot be empty for applicants' })
  @IsNumber({}, { message: 'mobile must be a valid number' })
  mobile?: number;
}
