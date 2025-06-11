import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { TrainingTypeService } from './training-type.service';
import { CreateTrainingTypeDto } from './dto/create-training-type.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@ApiTags('Training-type')
@Controller('training-type')
export class TrainingTypeController {
  constructor(private readonly trainingTypeService: TrainingTypeService) {}

  @Post('Create-update')
   @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
  create(@Body() createTrainingTypeDto: CreateTrainingTypeDto) {
    return this.trainingTypeService.create(createTrainingTypeDto);
  }
  @Get('get-list')
   @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  findAll() {
    return this.trainingTypeService.findAll();
  }

  @Get('getone/:id')
   @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  findOne(@Param('id') id: string) {
    return this.trainingTypeService.findOne(id);
  }

  @Get('delete/:id')
   @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  remove(@Param('id') id: string) {
    return this.trainingTypeService.remove(id);
  }
}
