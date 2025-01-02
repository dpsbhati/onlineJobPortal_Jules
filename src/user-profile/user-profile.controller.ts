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
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UserProfileService } from './user-profile.service';
import { CreateUserProfileDto } from './dto/create-user-profile.dto';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@ApiTags('User Profile')
@Controller('user-profile')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UserProfileController {
  constructor(private readonly userProfileService: UserProfileService) {}

  @Post('create-newuser-profile')
  @ApiOperation({ summary: 'Create a new user profile' })
  async create(@Body() createUserProfileDto: CreateUserProfileDto) {
    return this.userProfileService.create(createUserProfileDto);
  }

  @Get('get-all')
  @ApiOperation({ summary: 'Retrieve all user profiles' })
  async findAll() {
    return this.userProfileService.findAll();
  }

  @Get('get-one')
  @ApiOperation({ summary: 'Retrieve a user profile by ID' })
  @ApiParam({ name: 'id', description: 'The ID of the user profile' })
  async findOne(@Param('id') id: string) {
    return this.userProfileService.findOne(id);
  }

  @Post('update-userprofile')
  @ApiOperation({ summary: 'Update a user profile' })
  @ApiParam({ name: 'id', description: 'The ID of the user profile' })
  async update(
    @Param('id') id: string,
    @Body() updateUserProfileDto: UpdateUserProfileDto,
  ) {
    return this.userProfileService.update(id, updateUserProfileDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete a user profile' })
  @ApiParam({ name: 'id', description: 'The ID of the user profile' })
  async remove(@Param('id') id: string) {
    return this.userProfileService.remove(id);
  }
}
