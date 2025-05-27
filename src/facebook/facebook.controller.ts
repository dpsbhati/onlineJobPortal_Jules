import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { FacebookService } from './facebook.service';
import { CreateFacebookDto } from './dto/create-facebook.dto';


@Controller('facebook')
export class FacebookController {
  constructor(private readonly facebookService: FacebookService) {}

  @Post()
  create(@Body() createFacebookDto: CreateFacebookDto) {
    return this.facebookService.createJobPostFacebook(createFacebookDto);
  }
}
