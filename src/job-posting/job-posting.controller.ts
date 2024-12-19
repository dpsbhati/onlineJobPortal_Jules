import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { JobPostingService } from './job-posting.service';
import { CreateJobPostingDto } from './dto/create-job-posting.dto';
import { UpdateJobPostingDto } from './dto/update-job-posting.dto';

@ApiTags('Job-postings') 
@Controller('job-posting')
export class JobPostingController {
  constructor(private readonly jobPostingService: JobPostingService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new job posting' })
  create(@Body() createJobPostingDto: CreateJobPostingDto) {
    return this.jobPostingService.create(createJobPostingDto);
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve all job postings' })
  findAll() {
    return this.jobPostingService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a job posting by ID' })
  @ApiParam({ name: 'id', description: 'The ID of the job posting', type: String })
  findOne(@Param('id') id: string) {
    return this.jobPostingService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a job posting by ID' })
  @ApiParam({ name: 'id', description: 'The ID of the job posting', type: String })
  update(@Param('id') id: string, @Body() updateJobPostingDto: UpdateJobPostingDto) {
    return this.jobPostingService.update(+id, updateJobPostingDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a job posting by ID' })
  @ApiParam({ name: 'id', description: 'The ID of the job posting', type: String })
  remove(@Param('id') id: string) {
    return this.jobPostingService.remove(+id);
  }
}
