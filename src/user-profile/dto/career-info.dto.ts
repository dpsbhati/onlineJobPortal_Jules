import { ApiProperty } from '@nestjs/swagger';

export class CareerInfoDto {
  id: string;

  user_id?: string;

  @ApiProperty()
  work_experience_from?: number;

  @ApiProperty()
  work_experience_to?: number;

  @ApiProperty()
  work_experience_title?: string;

  @ApiProperty()
  work_experience_employer?: string;

  @ApiProperty()
  highest_education_level?: string;

  @ApiProperty()
  education_from?: number;

  @ApiProperty()
  education_to?: number;

  @ApiProperty()
  education_title?: string;

  @ApiProperty()
  education_institute?: string;

  @ApiProperty()
  course_from?: number;

  @ApiProperty()
  course_to?: number;

  @ApiProperty()
  course_title?: string;

  @ApiProperty()
  course_provider?: string;

  @ApiProperty()
  certification_from?: number;

  @ApiProperty()
  certification_to?: number;

  @ApiProperty()
  certification_title?: string;

  @ApiProperty()
  certification_issuer?: string;

  @ApiProperty()
  cv_path?: string;

  createdBy?: string;

  updatedBy?: string;
}
