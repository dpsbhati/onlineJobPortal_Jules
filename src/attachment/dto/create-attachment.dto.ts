import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsUUID } from 'class-validator';

export class CreateAttachmentDto {
  @ApiProperty({
    description: 'The ID of the user associated with the attachment',
    example: 'user-123',
  })
  @IsUUID()
  @IsNotEmpty()
  user_id: string;

  @ApiProperty({
    description: 'Details about the attachment',
    example: 'Resume document for job application',
  })
  @IsString()
  @IsNotEmpty()
  attachment_details: string;

  @ApiProperty({
    description: 'The file path of the attachment',
    example: '/files/resume.pdf',
  })
  @IsString()
  @IsNotEmpty()
  file_path: string;

 
}
