import { IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdateAttachmentDto {
  @IsString()
  @IsOptional() // Field is optional
  attachment_details?: string;

  @IsString()
  @IsOptional() // Field is optional
  file_path?: string;

}
