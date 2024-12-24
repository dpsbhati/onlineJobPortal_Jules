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
import { CreateUserDto, LoginDTO } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { forgetPasswordDto } from './dto/create-user.dto';
import {
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { WriteResponse } from 'src/shared/response';
import { JwtService } from '@nestjs/jwt';

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService,
    private jwtService: JwtService,

  ) {}

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
  async LogIn(@Body() data: LoginDTO) {
    let User = await this.userService.LogIn(
      data.email,
      data.password,
    );
    if (!User) {
      return WriteResponse(401, data, 'Invalid credentials.');
    }else if(User && !User.isEmailVerified){
      return WriteResponse(401, data, 'Your email is not verified, Please verify your email');
    }
    const payload = { id: User.id };
    const token = await this.jwtService.signAsync(payload);
    // const user = await this.userService.findByUserId(User.id);
    // const userModuleRole = await this.UserService.userPerm(user.data.id)
    delete User.password;
    return WriteResponse(
      200,
      {
        token: token,
        user: User,
      },
      'Login successfully.',
    );
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
