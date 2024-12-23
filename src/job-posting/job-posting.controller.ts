import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { JobPostingService } from './job-posting.service';
import { CreateJobPostingDto } from './dto/create-job-posting.dto';
import { UpdateJobPostingDto } from './dto/update-job-posting.dto';

@ApiTags('Job-postings')
@Controller('job-posting')
export class JobPostingController {
  constructor(private readonly jobPostingService: JobPostingService) { }
  @Post('create-or-update')
  @ApiOperation({ summary: 'Create or update a job posting' })
  async createOrUpdate(@Body() createJobPostingDto: CreateJobPostingDto) {
    const response = await this.jobPostingService.createOrUpdate(createJobPostingDto);
    return response; // Directly return the response from the service
  }


  @Get('get-list')
  @ApiOperation({ summary: 'Retrieve all job postings' })
  findAll() {
    return this.jobPostingService.findAll();
  }

  @Get('get-by-id/:id')
  @ApiOperation({ summary: 'Retrieve a job posting by ID' })
  @ApiParam({ name: 'id', description: 'The ID of the job posting', type: String })
  findOne(@Param('id') id: string) {
    return this.jobPostingService.findOne(id);
  }

  // @Patch(':id')
  // @ApiOperation({ summary: 'Update a job posting by ID' })
  // @ApiParam({ name: 'id', description: 'The ID of the job posting', type: String })
  // update(@Param('id') id: string, @Body() updateJobPostingDto: UpdateJobPostingDto) {
  //   return this.jobPostingService.update(+id, updateJobPostingDto);
  // }

  @Delete('delete/:id')
  @ApiOperation({ summary: 'Delete a job posting by ID' })
  @ApiParam({ name: 'id', description: 'The ID of the job posting', type: String })
  remove(@Param('id') id: string) {
    return this.jobPostingService.remove(id);
  }
}
