import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { RanksService } from './ranks.service';
import { CreateRankDto } from './dto/create-rank.dto';
import { UpdateRankDto } from './dto/update-rank.dto';
import { ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { IPaginationSwagger } from 'src/shared/paginationEum';

@Controller('ranks')
export class RanksController {
  manualsService: any;
  constructor(private readonly ranksService: RanksService) {}

  @Post('create-or-update')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiBody({ type: [CreateRankDto] })
  create(@Body() createRankDto: CreateRankDto[]) {
    return this.ranksService.create(createRankDto);
  }

  @Get('getAll')
  findAll() {
    return this.ranksService.findAll();
  }

  @Get('getOne/:id')
  findOne(@Param('id') id: string) {
    return this.ranksService.findOne(id);
  }

  @Post('delete/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  remove(@Param('id') id: string) {
    return this.ranksService.remove(id);
  }

  @Post('/pagination')
  @ApiBody({ schema: { properties: IPaginationSwagger } })
  pagination(@Body() IPagination: any, @Req() req) {
    return this.ranksService.pagination(IPagination, req.user);
  }
}
