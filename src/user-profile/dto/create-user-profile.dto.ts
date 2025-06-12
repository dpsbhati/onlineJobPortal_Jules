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
  SeaServiceDto,
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
import { ContactPersonDTO } from './contact-person-in-case-of-emergency.dto';
import { LegalDependentDTO } from './legal-dependent.dto';
import { TravelDocumentsDTO } from './travel-documents.dto';
import { TrainingCertificateDTO } from './training-certificate.dto';
import { UserMedicalQuestionDto } from './user_medical_questionnaire.dto';

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

export enum MaritalStatus {
  Single = 'Single',
  Married = 'Married',
  Divorced = 'Divorced',
  Widowed = 'Widowed',
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

  @ApiProperty()
  home_address: string;

 
  @ApiProperty({ description: 'Residence number of the user' })
  residence_number: number;

  
  @ApiProperty({ description: 'Birth place of the user' })
  birth_place: string;

  
  @ApiProperty({ description: 'Father full name' })
  father_full_name: string;

  
  @ApiProperty({ description: 'Father date of birth' })
  father_dob: string;

  
  @ApiProperty({ description: 'Mother full name' })
  mother_full_name: string;

  
  @ApiProperty({ description: 'Mother date of birth' })
  mother_dob: string;

  
  @ApiProperty({ description: 'Height of the user (in cm)' })
  height: number;

  
  @ApiProperty({ description: 'Weight of the user (in kg)' })
  weight: number;

  
  @ApiProperty({ description: 'SSS number' })
  sss_number: string;

 
  @ApiProperty({ description: 'PhilHealth number' })
  phil_health_number: string;

  
  @ApiProperty({ description: 'Pag-IBIG number' })
  pagibig_number: string;


  @ApiProperty({ type: [AdditionalContactInfo] })
  additional_contact_info: AdditionalContactInfo[];

  @ApiProperty()
  profile_image_path: string;

  // @ApiProperty({ type: [WorkExperienceDto] })
  // work_experience_info: WorkExperienceDto[];

  @ApiProperty()
  highest_education_level?: string;

  @ApiProperty({ type: [EducationDto] })
  education_info: EducationDto[];

  @ApiProperty({ type: [SeaServiceDto] })
  carrier_info: SeaServiceDto[];

  @ApiProperty({ type: [LegalDependentDTO] })
  legal_dependent: LegalDependentDTO[];

  @ApiProperty({ type: [TravelDocumentsDTO] })
  travel_documents: TravelDocumentsDTO[];

  @ApiProperty({ type: [TrainingCertificateDTO] })
  training_certificate: TrainingCertificateDTO[];

  @ApiProperty({ type: UserMedicalQuestionDto })
  user_medical_questionnaire: UserMedicalQuestionDto;

  // @ApiProperty({ type: [CourseDto] })
  // course_info: CourseDto[];

  // @ApiProperty({ type: [CertificationDto] })
  // certification_info: CertificationDto[];

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

  @ApiProperty({ type: [ContactPersonDTO] })
  contact_person_in_emergency: ContactPersonDTO[];

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

  @ApiProperty({ description: 'Middle  name of the user' })
  @IsNotEmpty({ message: 'middle_name cannot be empty' })
  @IsString({ message: 'middle_name must be a valid string' })
  @Validate(IsNotWhitespace, {
    message: 'first_name cannot contain only whitespace',
  })
  @MaxLength(50, { message: 'first_name cannot exceed 50 characters' })
  @Transform(({ value }) => value?.trim()) // Trim whitespace
  middle_name: string;

  @ApiProperty({ enum: MaritalStatus })
@IsEnum(MaritalStatus)
marital_status: MaritalStatus;

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
