import { PartialType } from '@nestjs/mapped-types';
import { CreateApplicationDto } from './create-application.dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateApplicationDto extends PartialType(CreateApplicationDto) {
  @ApiPropertyOptional({
    description: 'The status of the application.',
    example: 'Shortlisted',
  })
  status?: string;

  @ApiPropertyOptional({
    description: 'Any additional comments or remarks (optional).',
    example: 'Updated comments for the application.',
  })
  comments?: string;

  @ApiPropertyOptional({
    description: 'The file path for certifications.',
    example: '/path/to/certification.pdf',
  })
  certification_path?: string;

  @ApiPropertyOptional({
    description: 'Updated description of the application.',
    example: 'Updated description.',
  })
  description?: string;
}
