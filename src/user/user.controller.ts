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
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import {forgetPasswordDto} from 'src/user/dto/create-user.dto'

import {
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RolesGuard } from 'src/auth/guards/roles.guard';

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('createupdate')
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Create&Update a new user' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.createUpdate(createUserDto);
  }

  @Get('get-all')
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Get all users' })
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Find a user by ID' })
  async findOneById(@Param('id') id: string) {
    return this.userService.findOne('id', id);
  }

  @Get(':email')
  @ApiOperation({ summary: 'Find a user by email' })
  async findOneByEmail(@Param('email') email: string) {
    return this.userService.findOne('email', email);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Delete a user by ID' })
  async delete(@Param('id') id: string) {
    return this.userService.delete(id);
  }

  @Post('paginate')
  @UseGuards(RolesGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retrieve paginated list of users' })
  async findAllWithPagination(
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    return this.userService.Pagination(page, limit);
  }

  @Post('login')
  @UseGuards(RolesGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBody({
    description: 'Payload for user login',
    schema: {
      example: {
        email: 'john.doe@example.com',
        password: 'securePassword123',
      },
    },
  })
  async login(
    @Body('email') email: string,
    @Body('password') password: string,
  ) {
    return this.userService.login(email, password);
  }
  @Get('find-one')
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Find a user by a key-value pair' })
  @ApiQuery({
    name: 'key',
    required: true,
    example: 'email',
    description: 'The key to search by (e.g., email, id)',
  })
  @ApiQuery({
    name: 'value',
    required: true,
    example: 'john.doe@example.com',
    description: 'The value to search for',
  })
  async findOne(@Query('key') key: string, @Query('value') value: any) {
    return this.userService.findOne(key, value);
  }

  @Post('reset-password')
  async resetPassword(
    @Body('token') token: string,
    @Body('newPassword') newPassword: string,
  ) {
    return this.userService.resetPassword(token, newPassword);
  }

  @Post('forget-password')
  async forgetPassword(
    // @Body('token') token: string,
    @Body() forgetPasswordDto: forgetPasswordDto,
  ) {
    return this.userService.forgetPassword(forgetPasswordDto);
  }
}
