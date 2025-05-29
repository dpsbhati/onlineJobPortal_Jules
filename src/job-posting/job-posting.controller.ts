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
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { IPagination, IPaginationSwagger } from 'src/shared/paginationEum';
import {
  Changejobstatus,
  CreateJobPostingDto,
  UpdateDeadlineDto,
} from './dto/create-job-posting.dto';
import { JobPostingService } from './job-posting.service';

@ApiTags('Job-postings')
@Controller('job-posting')
@ApiTags('Job-postings')
export class JobPostingController {
  constructor(private readonly jobPostingService: JobPostingService) {}

  @Post('create-update')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async createOrUpdateJobPosting(
    @Body() jobDto: CreateJobPostingDto,
    @Req() req,
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
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all job postings' })
  async findAll() {
    return await this.jobPostingService.findAll();
  }

  @Post('delete/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a job posting by ID' })
  async remove(@Param('id') id: string) {
    return this.jobPostingService.remove(id);
  }

  @Get('find-one')
  @ApiOperation({ summary: 'Find a job posting by a key-value pair' })
  @ApiQuery({
    name: 'key',
    type: String,
    description: 'The key to search for in the job posting',
  })
  @ApiQuery({
    name: 'value',
    type: String,
    description: 'The value to search for in the job posting',
  })
  async findOne(@Query() query: { key: string; value: string }) {
    return this.jobPostingService.findOne(query.key, query.value);
  }

  @Get('toggle-job-status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiQuery({ name: 'id', required: true })
  @ApiQuery({ name: 'isActive', required: true })
  async toggleJobStatus(@Query() query) {
    return this.jobPostingService.toggleJobStatus(query);
  }

  @Put('publish/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Publish a scheduled job posting' })
  @ApiParam({
    name: 'id',
    description: 'The ID of the job to be published',
    required: true,
  })
  async publishJob(@Param('id') jobId: string, @Req() req: Request) {
    const userId = req['user_id'];
    return this.jobPostingService.postScheduledJob(jobId, userId);
  }

  @Post('update-deadline')
  async updateDeadline(@Body() updateDeadlineDto: UpdateDeadlineDto) {
    return this.jobPostingService.updateDeadline(updateDeadlineDto);
  }
  @Post('changestatus-to-archived')
  async Changestatus(@Body() changejobstatus: Changejobstatus) {
    return this.jobPostingService.Changestatus(changejobstatus);
  }
}
