import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Req,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ApplicationService } from './application.service';
import {
  CreateApplicationDto,
  UpdateApplicationStatusDto,
} from './dto/create-application.dto';
import { ChangeApplicationDto, UpdateApplicationDto } from './dto/update-application.dto';
import { IPagination, IPaginationSwagger } from 'src/shared/paginationEum';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@ApiTags('Applications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('applications')
export class ApplicationController {
  constructor(private readonly applicationService: ApplicationService) {}

  @Post('apply')
  @ApiOperation({ summary: 'Apply for a job' })
  apply(@Body() createApplicationDto: CreateApplicationDto, @Req() req: any) {
    return this.applicationService.applyForJob(createApplicationDto,req);
  }

  @Get('get-all')
  @ApiOperation({ summary: 'Retrieve all applications' })
  findAll() {
    return this.applicationService.findAll();
  }

  @Get('getOne/:id')
  @ApiOperation({ summary: 'Retrieve a specific application by ID' })
  @ApiParam({
    name: 'id',
    description: 'The ID of the application to retrieve',
    example: 'uuid',
  })
  async findOne(@Param('id') id: string) {
    return this.applicationService.findOne(id);
  }

  @Post('getApplicationsByJobId')
  @ApiBody({
    schema: {
      type: 'object',
      properties: IPaginationSwagger, // Use the Swagger definition for pagination schema
    },
  })
  async paginateApplicationsByJobId(
    @Request() req: any,
    @Body() pagination: IPagination,
    @Body('job_id') job_id: string, // Receiving job_id separately from pagination
  ) {
    return this.applicationService.paginateApplicationsByJobId(
      req,
      pagination,
      job_id,
    );
  }

  @Post('jobs-with-applications')
  @ApiBody({
    schema: {
      type: 'object',
      properties: IPaginationSwagger,
    },
  })
  async paginateJobsWithApplications(
    @Request() req: any,
    @Body() pagination: IPagination,
  ) {
    return this.applicationService.paginateJobsWithApplications(
      req,
      pagination,
    );
  }

  @Post('update/:id')
  @ApiOperation({ summary: 'Update a specific application by ID' })
  @ApiParam({
    name: 'id',
    description: 'The ID of the application to update',
    example: 'uuid',
  })
  update(
    @Param('id') id: string,
    @Body() updateApplicationDto: UpdateApplicationDto,
    @Req() req: any,
  ) {
    return this.applicationService.update(id, updateApplicationDto, req.user);
  }

  @Post('changeApplicationStatus/:id')
  @ApiOperation({ summary: 'Change the status of a specific application by ID' })
  @ApiParam({
    name: 'id',
    description: 'The ID of the application to update',
    example: 'uuid',
  })
  changeApplicationStatus(
    @Param('id') id: string,
    @Body() changeApplicationDto: ChangeApplicationDto,
    @Req() req: any,
  ) {
    return this.applicationService.changeApplicationStatus(id, changeApplicationDto, req.user);
  }

  @Post('delete')
  @ApiOperation({ summary: 'Soft delete a specific application by ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: 'uuid' },
      },
    },
  })
  remove(@Body('id') id: string) {
    return this.applicationService.remove(id);
  }

  @Post('updateApplicationStatus')
  updateApplicationStatus(
    @Body() updateApplicationStatusDto: UpdateApplicationStatusDto,
    @Req() req: any
  ) {
    return this.applicationService.updateApplicationStatus(
      updateApplicationStatusDto,
      req
    );
  }

  @Post('pagination')
  @ApiBody({
    schema: {
      type: 'object',
      properties: IPaginationSwagger,
    },
  })
  async pagination(@Request() req: any, @Body() pagination: IPagination) {
    return this.applicationService.paginateApplications(req, pagination);
  }

  @Post('overview')
   @ApiBody({
    schema: {
      type: 'object',
      properties: IPaginationSwagger,
    },
  })
async getSummary(@Req() req: any, @Body() pagination: IPagination) {
  return this.applicationService.getStatusSummary(req, pagination);
}


  @Post('paginations')
  @ApiOperation({ summary: 'Paginate Applications with filtered keys' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: IPaginationSwagger,
    },
  })
  async paginateApplications(
    @Req() req: any,
    @Body() pagination: IPagination, // Change @Query to @Body
  ) {
    return this.applicationService.pagination(req, pagination);
  }
}
