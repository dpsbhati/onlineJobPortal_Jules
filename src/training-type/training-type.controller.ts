import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { TrainingTypeService } from './training-type.service';
import { CreateTrainingTypeDto } from './dto/create-training-type.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Training-type')
@Controller('training-type')
export class TrainingTypeController {
  constructor(private readonly trainingTypeService: TrainingTypeService) {}

  @Post('Create-update')
  create(@Body() createTrainingTypeDto: CreateTrainingTypeDto) {
    return this.trainingTypeService.create(createTrainingTypeDto);
  }
  @Get('get-list')
  findAll() {
    return this.trainingTypeService.findAll();
  }

  @Get('getone/:id')
  findOne(@Param('id') id: string) {
    return this.trainingTypeService.findOne(id);
  }

  @Get('delete/:id')
  remove(@Param('id') id: string) {
    return this.trainingTypeService.remove(id);
  }
}
