import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { JobPostingService } from './job-posting.service';
import {
  CreateJobPostingDto,
  FindAllJobPostingsQueryDto,
  FindOneJobPostingQueryDto,
} from './dto/create-job-posting.dto';
import { UpdateJobPostingDto } from './dto/update-job-posting.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { IPagination, IPaginationSwagger } from 'src/shared/paginationEum';

@ApiTags('Job-postings')
@Controller('job-posting')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiTags('Job-postings')
export class JobPostingController {
  constructor(private readonly jobPostingService: JobPostingService) {}

  @Post('create-update')
  @ApiOperation({
    summary: 'Create or Update a Job Posting with optional file upload',
  })
  async createOrUpdate(@Body() jobDto: CreateJobPostingDto) {
    return this.jobPostingService.createOrUpdate(jobDto);
  }

  @Post('paginate-JobPostings')
  @ApiBody({
    schema: {
      type: 'object',
      properties: IPaginationSwagger,
    },
  })
  pagination(@Body() pagination: IPagination) {
    return this.jobPostingService.paginateJobPostings(pagination);
  }

  @Get()
  @ApiOperation({ summary: 'Get all job postings' })
  async findAll() {
    return await this.jobPostingService.findAll();
  }

  @Delete('delete/:id')
  @ApiOperation({ summary: 'Delete a job posting by ID' })
  async remove(@Param('id') id: string) {
    return this.jobPostingService.remove(id);
  }

  @Get('find-one')
  @ApiOperation({ summary: 'Find a job posting by a key-value pair' })
  async findOne(@Query() query: FindOneJobPostingQueryDto) {
    return this.jobPostingService.findOne(query.key);
  }

  @Post(':id/status')
  @ApiOperation({
    summary: 'Toggle the active/inactive status of a job posting.',
  })
  @ApiParam({
    name: 'id',
    description: 'The ID of the job posting to update.',
    example: 'job-id-123',
  })
  async toggleJobStatus(
    @Param('id') id: string,
    @Body('isActive') isActive: boolean,
  ) {
    return this.jobPostingService.toggleJobStatus(id, isActive);
  }
}
