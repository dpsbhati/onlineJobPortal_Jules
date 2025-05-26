import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { UserProfileService } from './user-profile.service';
import { CreateUserProfileDto } from './dto/create-user-profile.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@ApiTags('User Profile')
@Controller('user-profile')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UserProfileController {
  constructor(private readonly userProfileService: UserProfileService) {}

  @Post('update-user-profile')
  @ApiOperation({ summary: 'Update user profile' })
  async create(@Body() createUserProfileDto: CreateUserProfileDto, @Req() req) {
    const user_id = req.user.id;
    return this.userProfileService.create(createUserProfileDto, user_id,req);
  }


  @Get('get-all')
  @ApiOperation({ summary: 'Retrieve all user profiles' })
  async findAll() {
    return this.userProfileService.findAll();
  }

  
  @Get('get-one')
  @ApiOperation({ summary: 'Retrieve a user profile by user ID' })
  @ApiQuery({
    name: 'id',
    required: true,
    type: String,
    description: 'The ID of the user profile',
  })
  async findOne(@Query('id') userId: string) {
    return this.userProfileService.findOne(userId);
  }


  @Post(':id')
  @ApiOperation({ summary: 'Soft delete a user profile' })
  @ApiParam({ name: 'id', description: 'The ID of the user profile' })
  async remove(@Param('id') id: string) {
    return this.userProfileService.remove(id);
  }
}
