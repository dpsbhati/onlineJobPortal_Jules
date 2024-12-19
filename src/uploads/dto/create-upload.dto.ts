import { IsString, IsOptional } from 'class-validator';

export class CreateUploadDto {
  @IsString()
  @IsOptional()
  userId: string;

  @IsString()
  @IsOptional()
  folderName: string;
}
    