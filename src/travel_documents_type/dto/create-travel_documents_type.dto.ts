import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsDate, IsOptional, IsString } from "class-validator";

export class CreateTravelDocumentsTypeDto {
    @ApiProperty()
      id: string; // Optional for updates
  
      @ApiProperty()
      name?: string;
    
      created_at?: Date;
    
      updated_at?: Date;
   
      created_by?: string;
 
      updated_by?: string;
    
      is_deleted?: boolean;
}
