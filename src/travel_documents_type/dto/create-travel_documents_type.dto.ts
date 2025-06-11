import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsDate, IsOptional, IsString } from "class-validator";

export class CreateTravelDocumentsTypeDto {
    @ApiProperty()
      id: string; // Optional for updates
    
      @IsString()
      @ApiProperty()
      name?: string;
    
      @IsDate()
      @IsOptional()
      created_at?: Date;
    
      @IsDate()
      @IsOptional()
      updated_at?: Date;
    
      @IsString()
      @IsOptional()
      created_by?: string;
    
      @IsString()
      @IsOptional()
      updated_by?: string;
    
      @IsBoolean()
      @IsOptional()
      is_deleted?: boolean;
}
