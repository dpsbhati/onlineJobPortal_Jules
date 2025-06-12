import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class UserMedicalQuestionDto {
id: string;

  @ApiProperty() 
  user_id: string;

  @ApiProperty({default: false}) 
  disease_unfit_service: boolean;

  @ApiProperty({default: false}) 
  accident_disability: boolean;

  @ApiProperty({default: false}) 
  psychiatric_treatment: boolean;

  @ApiProperty({default: false}) 
  alcohol_drug_addiction: boolean;

  @ApiProperty({default: false}) 
  blacklisted_illegal_activities: boolean;

  @ApiProperty() 
  reason: string;


  created_by: string;
  updated_by: string;
}
