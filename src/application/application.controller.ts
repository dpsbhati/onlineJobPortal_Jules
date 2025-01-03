import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { ApplicationService } from './application.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';

@ApiTags('Applications')
@Controller('applications')
export class ApplicationController {
  constructor(private readonly applicationService: ApplicationService) {}

  @Post('apply')
  @ApiOperation({ summary: 'Apply for a job' })
  apply(@Body() createApplicationDto: CreateApplicationDto) {
    return this.applicationService.applyForJob(createApplicationDto);
  }

  @Get("get-all")
  @ApiOperation({ summary: 'Retrieve all applications' })
  findAll() {
    return this.applicationService.findAll();
  }

  @Get('get-one')
  @ApiOperation({ summary: 'Retrieve a specific application by ID' })
  @ApiParam({ name: 'id', description: 'The ID of the application to retrieve', example: 'uuid' })
  findOne(@Param('id') id: string) {
    return this.applicationService.findOne(id);
  }

  @Post('update')
  @ApiOperation({ summary: 'Update a specific application by ID' })
  @ApiParam({ name: 'id', description: 'The ID of the application to update', example: 'uuid' })
  update(@Param('id') id: string, @Body() updateApplicationDto: UpdateApplicationDto) {
    return this.applicationService.update(id, updateApplicationDto);
  }

  @Post('delete')
  @ApiOperation({ summary: 'Soft delete a specific application by ID' })
  @ApiParam({ name: 'id', description: 'The ID of the application to delete', example: 'uuid' })
  remove(@Param('id') id: string) {
    return this.applicationService.remove(id);
  }
}
