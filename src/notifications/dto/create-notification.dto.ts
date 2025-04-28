import { IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { ApplicationStatus } from 'src/application/enums/applications.-status';


export class CreateNotificationDto {
  @IsString()
  @IsNotEmpty()
  to: string;

  @IsString()
  @IsNotEmpty()
  subject: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsEnum(ApplicationStatus)
  @IsNotEmpty()
  status: ApplicationStatus;

  @IsString()
  @IsNotEmpty()
  jobTitle: string;
}
