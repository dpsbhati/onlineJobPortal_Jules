import { ApiProperty } from '@nestjs/swagger';

export class CareerInfoDto {
  id: string;

  user_id?: string;

  @ApiProperty()
  work_experience_from?: Date;

  @ApiProperty()
  work_experience_to?: Date;

  @ApiProperty()
  work_experience_title?: string;

  @ApiProperty()
  work_experience_employer?: string;

  @ApiProperty()
  highest_education_level?: string;

  @ApiProperty()
  education_from?: Date;

  @ApiProperty()
  education_to?: Date;

  @ApiProperty()
  education_title?: string;

  @ApiProperty()
  education_institute?: string;

  @ApiProperty()
  course_from?: Date;

  @ApiProperty()
  course_to?: Date;

  @ApiProperty()
  course_title?: string;

  @ApiProperty()
  course_provider?: string;

  @ApiProperty()
  certification_from?: Date;

  @ApiProperty()
  certification_to?: Date;

  @ApiProperty()
  certification_title?: string;

  @ApiProperty()
  certification_issuer?: string;

  @ApiProperty()
  cv_path?: string;

  createdBy?: string;

  updatedBy?: string;
}
