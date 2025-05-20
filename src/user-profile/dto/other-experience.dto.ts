import { ApiProperty } from '@nestjs/swagger';
import exp from 'constants';

export class OtherExperienceInfoDto {
  @ApiProperty()
  other_experience_from: Date;

  @ApiProperty()
  other_experience_to: Date;

  @ApiProperty()
  other_experience_description: string;
}

export class ProjectInfoDto {
  @ApiProperty()
  project_from: Date;

  @ApiProperty()
  project_to: Date;

  @ApiProperty()
  project_name: string;

  @ApiProperty()
  project_role: string;
}
