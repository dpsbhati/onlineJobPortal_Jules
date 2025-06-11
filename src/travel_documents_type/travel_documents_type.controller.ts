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
import { TravelDocumentsTypeService } from './travel_documents_type.service';
import { CreateTravelDocumentsTypeDto } from './dto/create-travel_documents_type.dto';
import { UpdateTravelDocumentsTypeDto } from './dto/update-travel_documents_type.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@Controller('travel-documents-type')
@ApiTags('Travel-documents-type')
export class TravelDocumentsTypeController {
  constructor(
    private readonly travelDocumentsTypeService: TravelDocumentsTypeService,
  ) {}

  @Post('create-update')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  create(@Body() createTravelDocumentsTypeDto: CreateTravelDocumentsTypeDto) {
    return this.travelDocumentsTypeService.create(createTravelDocumentsTypeDto);
  }

  @Get('getall')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  findAll() {
    return this.travelDocumentsTypeService.findAll();
  }

  @Get('getone/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  findOne(@Param('id') id: string) {
    return this.travelDocumentsTypeService.findOne(id);
  }

  @Get('delete/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  remove(@Param('id') id: string) {
    return this.travelDocumentsTypeService.remove(id);
  }
}
