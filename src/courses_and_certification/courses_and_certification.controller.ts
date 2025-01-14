import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { CoursesAndCertificationService } from './courses_and_certification.service';
import { CreateCoursesAndCertificationDto } from './dto/create-courses_and_certification.dto';
import { UpdateCoursesAndCertificationDto } from './dto/update-courses_and_certification.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('courses-and-certification')
@ApiTags('courses-and-certification')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('courses-and-certification')
export class CoursesAndCertificationController {
  constructor(
    private readonly coursesAndCertificationService: CoursesAndCertificationService,
  ) {}

  @Post()
  create(
    @Body() createCoursesAndCertificationDto: CreateCoursesAndCertificationDto,
  ) {
    return this.coursesAndCertificationService.create(
      createCoursesAndCertificationDto,
    );
  }

  @Get()
  findAll() {
    return this.coursesAndCertificationService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.coursesAndCertificationService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCoursesAndCertificationDto: UpdateCoursesAndCertificationDto,
  ) {
    return this.coursesAndCertificationService.update(
      +id,
      updateCoursesAndCertificationDto,
    );
  }

  @Post(':job_id')
  async remove(@Param('job_id') job_id: string) {
    return this.coursesAndCertificationService.remove(job_id);
  }
}
