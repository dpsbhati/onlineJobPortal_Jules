import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { Gender, PreferredJobShift } from '../entities/user-profile.entity';
import { MaritalStatus } from './create-user-profile.dto';

export class UpdateUserProfileDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  first_name?: string;

  @ApiPropertyOptional({ enum: MaritalStatus })
@IsEnum(MaritalStatus)
marital_status: MaritalStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  middle_name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  last_name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  dob?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  mobile?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  key_skills?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  work_experiences?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  current_company?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  current_salary?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  expected_salary?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  preferred_location?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  preferred_job_role?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(PreferredJobShift)
  preferred_shift?: PreferredJobShift;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  languages_known?: string;
}
