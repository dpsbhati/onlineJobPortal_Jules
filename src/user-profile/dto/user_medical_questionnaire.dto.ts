import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class UserMedicalQuestionDto {
id: string;

  @ApiProperty() 
  user_id: string;

  @ApiProperty() 
  disease_unfit_service: string;

  @ApiProperty() 
  accident_disability: string;

  @ApiProperty() 
  psychiatric_treatment: string;

  @ApiProperty() 
  alcohol_drug_addiction: string;

  @ApiProperty() 
  blacklisted_illegal_activities: string;

  @ApiProperty() 
  reason: string;


  created_by: string;
  updated_by: string;
}
