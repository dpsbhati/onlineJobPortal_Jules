import { ApiProperty } from '@nestjs/swagger';

export class CreateJobPostingDto {
  @ApiProperty({ description: 'The title of the job posting', example: 'Software Engineer' })
  title: string;

  @ApiProperty({ description: 'The description of the job posting', example: 'Develop and maintain web applications.' })
  description: string;

  @ApiProperty({ description: 'The name of the company offering the job', example: 'TechTop' })
  company: string;

  @ApiProperty({ description: 'The location of the job', example: 'INDIA, USA' })
  location: string;

  @ApiProperty({ description: 'The salary offered for the position', example: 85000 })
  salary: number;

  @ApiProperty({ description: 'The date the job was posted', example: '2024-12-17T00:00:00.000Z' })
  postedDate: Date;
}
