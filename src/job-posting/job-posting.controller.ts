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
  Req,
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
  // FindAllJobPostingsQueryDto,
  // FindOneJobPostingQueryDto,
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
  async createOrUpdateJobPosting(@Body() jobDto: CreateJobPostingDto,@Req() req
  ) {
    const user_id = req.user.id;
    if (!user_id) {
      throw new Error('User ID is missing from the request.');
    }    
    return this.jobPostingService.createOrUpdate(jobDto, user_id);
  }
  @Post('pagination')
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

  @Post('delete/:id')
  @ApiOperation({ summary: 'Delete a job posting by ID' })
  async remove(@Param('id') id: string) {
    return this.jobPostingService.remove(id);
  }

  @Get('find-one')
  @ApiOperation({ summary: 'Find a job posting by a key-value pair' })
  async findOne(@Query() query: { key: string; value: string }) {
    return this.jobPostingService.findOne(query.key, query.value);
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
