import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { LinkedInService } from './linkedin.service';
import { CreateLinkedinDto } from './dto/create-linkedin.dto';
import { UpdateLinkedinDto } from './dto/update-linkedin.dto';

@Controller('linkedin')
export class LinkedinController {
  constructor(private readonly linkedinService: LinkedInService) {}

  // @Post()
  // create(@Body() createLinkedinDto: CreateLinkedinDto) {
  //   return this.linkedinService.postScheduledJobs(createLinkedinDto);
  // }

}
