import { IsString, IsOptional, IsDate, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCoursesAndCertificationDto {
  @ApiProperty({ description: 'The ID of the job associated with the certification' })
  @IsString()
  job_id: string;

  @ApiProperty({ description: 'Name of the organization', required: false })
  @IsOptional()
  @IsString()
  organization_name?: string;

  @ApiProperty({ description: 'Description of the certification', required: false })
  @IsOptional()
  @IsString()
  certification_description?: string;

  @ApiProperty({ description: 'Start date of the certification', required: false })
  @IsOptional()
  @IsDate()
  start_date?: Date;

  @ApiProperty({ description: 'End date of the certification', required: false })
  @IsOptional()
  @IsDate()
  end_date?: Date;


  @ApiProperty({ description: 'ID of the user who created the record', required: false })
  @IsOptional()
  @IsString()
  created_by?: string;

  @ApiProperty({ description: 'ID of the user who updated the record', required: false })
  @IsOptional()
  @IsString()
  updated_by?: string;

  @ApiProperty({ description: 'File associated with the certification', required: false })
  @IsOptional()
  @IsString()
  certification_file?: string;

  @ApiProperty({ description: 'Indicates if the certification is active', default: true, required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
