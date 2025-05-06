import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { RanksService } from './ranks.service';
import { CreateRankDto } from './dto/create-rank.dto';
import { UpdateRankDto } from './dto/update-rank.dto';
import { ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('ranks')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class RanksController {
  constructor(private readonly ranksService: RanksService) {}

  @Post('create-or-update')
  @ApiBody({type:[CreateRankDto]})
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
  remove(@Param('id') id: string) {
    return this.ranksService.remove(id);
  }
}
