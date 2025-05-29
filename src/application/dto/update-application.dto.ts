import { PartialType } from '@nestjs/mapped-types';
import { CreateApplicationDto } from './create-application.dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateApplicationDto extends PartialType(CreateApplicationDto) {
  id: string;

  @ApiProperty()
  comments: string[];
}

export class ChangeApplicationDto extends PartialType(CreateApplicationDto) {
  id: string;

  @ApiProperty({
    description: 'The status of the application.',
    example: 'Shortlisted',
  })
  status: string;
}
