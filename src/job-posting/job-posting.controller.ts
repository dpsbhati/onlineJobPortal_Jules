import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UseInterceptors, UploadedFile, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiBearerAuth, ApiConsumes, ApiBody, ApiQuery } from '@nestjs/swagger';
import { JobPostingService } from './job-posting.service';
import { CreateJobPostingDto, FindAllJobPostingsQueryDto, FindOneJobPostingQueryDto } from './dto/create-job-posting.dto';
import { UpdateJobPostingDto } from './dto/update-job-posting.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('Job-postings')
@Controller('job-posting')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiTags('Job-postings')
export class JobPostingController {
  constructor(private readonly jobPostingService: JobPostingService) {}

  @Post('create-or-update')
  @ApiOperation({ summary: 'Create or Update a Job Posting with optional file upload' })
  async createOrUpdate(
    @Body() jobDto: CreateJobPostingDto,) 
    {
    return this.jobPostingService.createOrUpdate(jobDto);
  }

  @Get('find-all')
  @ApiOperation({ summary: 'Find all job postings with optional filters, sorting, and pagination' })
  async findAll(@Query() query: FindAllJobPostingsQueryDto) {
    return this.jobPostingService.findAll(query);
  }

  @Delete('delete/:id')
  @ApiOperation({ summary: 'Delete a job posting by ID' })
  async remove(@Param('id') id: string) {
    return this.jobPostingService.remove(id);
  }


  @Get('find-one')
  @ApiOperation({ summary: 'Find a job posting by a key-value pair' })
  async findOne(@Query() query: FindOneJobPostingQueryDto) {
    return this.jobPostingService.findOne(query.key, query.value);
  }

  
}



