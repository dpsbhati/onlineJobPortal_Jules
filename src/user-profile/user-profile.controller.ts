import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { UserProfileService } from './user-profile.service';
import { CreateUserProfileDto } from './dto/create-user-profile.dto';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('user-profile')
@UseGuards(AuthGuard('jwt')) // Ensure requests are authenticated
export class UserProfileController {
  constructor(private readonly userProfileService: UserProfileService) {}

  @Post()
  create(@Body() createUserProfileDto: CreateUserProfileDto, @Req() req) {
    const user_id = req.user.user_id; // Extract user_id from token
    return this.userProfileService.create({ ...createUserProfileDto, user_id });
  }

  @Get()
  findAll(@Req() req) {
    const user_id = req.user.user_id;
    return this.userProfileService.findAll(user_id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req) {
    const user_id = req.user.user_id;
    return this.userProfileService.findOne(id, user_id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserProfileDto: UpdateUserProfileDto, @Req() req) {
    const user_id = req.user.user_id;
    return this.userProfileService.update(id, { ...updateUserProfileDto, user_id });
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req) {
    const user_id = req.user.user_id;
    return this.userProfileService.remove(id, user_id);
  }
}
