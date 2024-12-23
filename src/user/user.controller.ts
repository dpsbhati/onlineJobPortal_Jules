import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('createupdate')
  @ApiOperation({ summary: 'Create&Update a new user' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.createUpdate(null, createUserDto);
  }

  @Get('get-all')
  @ApiOperation({ summary: 'Get all users' })
  findAll() {
    return this.userService.findAll();
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a user by ID' })
  async delete(@Param('id') id: string) {
    return this.userService.delete(id);
  }

  @Post('paginate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retrieve paginated list of users' })
  @ApiQuery({
    name: 'page',
    required: true,
    example: 1,
    description: 'Page number',
  })
  @ApiQuery({
    name: 'limit',
    required: true,
    example: 10,
    description: 'Number of records per page',
  })
  async findAllWithPagination(
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    return this.userService.Pagination(page, limit);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Generate a reset password token' })
  async forgotPassword(@Body('email') email: string) {
    return this.userService.forgotPassword(email);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body('email') email: string, @Body('password') password: string) {
    return this.userService.login(email, password);
  }

}
