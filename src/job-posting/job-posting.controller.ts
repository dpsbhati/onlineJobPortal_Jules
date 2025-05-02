import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  Request,
  UseGuards
} from '@nestjs/common';
import {
  ApiBearerAuth, ApiBody,
  ApiOperation,
  ApiParam,
  ApiTags
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { IPagination, IPaginationSwagger } from 'src/shared/paginationEum';
import {
  CreateJobPostingDto,
} from './dto/create-job-posting.dto';
import { JobPostingService } from './job-posting.service';

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
  pagination(@Request() req: any, @Body() pagination: IPagination) {
    return this.jobPostingService.paginateJobPostings(req, pagination);
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

  @Post('getOne/:id')
  findOne(@Param('id') id: string) {
    return this.jobPostingService.findOne(id);
  }

  // @Get('find-one')
  // @ApiOperation({ summary: 'Find a job posting by a key-value pair' })
  // async findOne(@Query() query: { key: string; value: string }) {
  //   return this.jobPostingService.findOne(query.key, query.value);
  // }

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

  @Put('publish/:id')
  @ApiOperation({ summary: 'Publish a scheduled job posting' })
  @ApiParam({
    name: 'id',
    description: 'The ID of the job to be published',
    required: true,
  })
  async publishJob(
    @Param('id') jobId: string,
    @Req() req: Request, 
  ) {
    const userId = req['user_id'];
    return this.jobPostingService.postScheduledJob(jobId, userId);
  }
}
