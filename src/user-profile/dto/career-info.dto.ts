import { ApiProperty } from '@nestjs/swagger';

export class WorkExperienceDto {
  @ApiProperty()
  work_experience_from?: Date;

  @ApiProperty()
  work_experience_to?: Date;

  @ApiProperty()
  work_experience_title?: string;

  @ApiProperty()
  work_experience_employer?: string;
}
export class EducationDto {
  @ApiProperty()
  education_from?: Date;

  @ApiProperty()
  education_to?: Date;

  @ApiProperty()
  education_title?: string;

  @ApiProperty()
  education_institute?: string;

  @ApiProperty()
  issue_place?: string;
}
export class CourseDto {
  @ApiProperty()
  course_from?: Date;

  @ApiProperty()
  course_to?: Date;

  @ApiProperty()
  course_title?: string;

  @ApiProperty()
  course_provider?: string;
}
export class CertificationDto {
  @ApiProperty()
  certification_from?: Date;

  @ApiProperty()
  certification_to?: Date;

  @ApiProperty()
  certification_title?: string;

  @ApiProperty()
  certification_issuer?: string;
}
