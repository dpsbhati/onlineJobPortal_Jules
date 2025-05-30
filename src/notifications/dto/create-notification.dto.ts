import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { ApplicationStatus } from 'src/application/enums/applications.-status';

export class CreateNotificationDto {
  @ApiProperty()
  user_id: string;

  @ApiProperty()
  application_id: string;

  @ApiProperty()
  job_id: string;

  @ApiProperty()
  subject: string;

  @ApiProperty()
  content: string;

  @ApiProperty()
  type: string;
}
