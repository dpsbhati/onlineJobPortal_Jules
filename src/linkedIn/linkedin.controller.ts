import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { LinkedinService } from './linkedin.service';
import { CreateLinkedinDto } from './dto/create-linkedin.dto';
import { UpdateLinkedinDto } from './dto/update-linkedin.dto';

@Controller('linkedin')
export class LinkedinController {
  constructor(private readonly linkedinService: LinkedinService) {}

  @Post()
  create(@Body() createLinkedinDto: CreateLinkedinDto) {
    return this.linkedinService.create(createLinkedinDto);
  }

  @Get()
  findAll() {
    return this.linkedinService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.linkedinService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLinkedinDto: UpdateLinkedinDto) {
    return this.linkedinService.update(+id, updateLinkedinDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.linkedinService.remove(+id);
  }
}
