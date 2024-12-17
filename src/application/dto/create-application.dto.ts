import { IsNotEmpty, IsOptional, IsString, IsEnum,IsUUID  } from 'class-validator';



export class CreateApplicationDto {
  @IsUUID()
  @IsNotEmpty()
  job_id: string;

  @IsUUID()
  user_id: string;

  @IsEnum(['Pending', 'Shortlisted', 'Rejected', 'Hired'])
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  comments?: string;

  @IsString()
  @IsOptional()
  cv_path?: string;

  @IsString()
  @IsOptional()
  additional_info?: string;

  @IsString()
  @IsOptional()
  work_experiences?: string;
}
