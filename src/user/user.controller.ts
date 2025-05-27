import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  UseGuards,
  BadRequestException,
  Req,
} from '@nestjs/common';
import { UserService } from './user.service';
import {
  ChangePasswordDto,
  CreateUserDto,
  LoginDTO,
  ResendEmailDto,
  ResetPasswordDto,
} from './dto/create-user.dto';
import { forgetPasswordDto } from './dto/create-user.dto';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { IPagination, IPaginationSwagger } from 'src/shared/paginationEum';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Register a new user' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.createUpdate(createUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('get-all')
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Get all users' })
  findAll() {
    return this.userService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('email')
  @ApiOperation({ summary: 'Find a user by email' })
  @ApiBody({
    description: 'Payload for finding a user by email',
    schema: {
      type: 'object',
      properties: {
        email: {
          type: 'string',
          example: 'john.doe@example.com',
          description: 'The email of the user to find.',
        },
      },
    },
  })
  async findOneByEmail(@Body('email') email: string) {
    try {
      return this.userService.findOne('email', email);
    } catch (error) {
      console.log(error);
      return error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('get-by-id/:id')
  @ApiOperation({ summary: 'Find a user by ID' })
  async findOneById(@Param('id') id: string) {
    return this.userService.findOne('id', id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('delete-by-id/:id')
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Delete a user by ID' })
  async delete(@Param('id') id: string) {
    return this.userService.delete(id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('pagination')
  @ApiBody({
    schema: {
      type: 'object',
      properties: IPaginationSwagger,
    },
  })
  pagination(@Body() pagination: IPagination) {
    return this.userService.paginate(pagination);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Authenticate a user and return access token' })
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
    return this.userService.LogIn(data.email, data.password);
  }

  @Post('reset-password')
  @ApiBody({
    description:
      'Provide the new password and token to reset the user password.',
    schema: {
      type: 'object',
      properties: {
        newPassword: {
          type: 'string',
          example: 'securePassword123',
          description: 'The new password for the user (minimum 6 characters).',
        },
        token: {
          type: 'string',
          example: 'your-reset-token',
          description: 'The token for password reset verification.',
        },
      },
    },
  })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.userService.resetPassword(
      resetPasswordDto.newPassword,
      resetPasswordDto.token,
    );
  }
  @Post('forget-password')
  @ApiBody({
    description: 'Payload for forgot password',
    schema: {
      example: {
        email: 'john.doe@example.com',
      },
    },
  })
  async forgetPassword(
    @Body() forgetPasswordDto: forgetPasswordDto,
  ) {
    return this.userService.forgetPassword(forgetPasswordDto);
  }

  @Post('verify-email')
  @ApiBody({
    description: 'Payload for verifying email using a token',
    schema: {
      type: 'object',
      properties: {
        token: {
          type: 'string',
          example: 'your-verification-token',
          description: 'The token sent to the user’s email for verification.',
        },
      },
    },
  })
  async verifyEmail(@Body('token') token: string) {
    return this.userService.verifyEmail(token);
  }

  @ApiOperation({ summary: 'Resend verification email' })
  @Post('resend-email')
  async resendEmail(@Body() body: ResendEmailDto) {
    const { email } = body;

    if (!email) {
      throw new BadRequestException('Email address is required.');
    }

    return await this.userService.resendEmailByEmail(email);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('change-password')
  changePassword(@Body() changePasswordDto: ChangePasswordDto, @Req() req) {
    return this.userService.changePassword(changePasswordDto, req);
  }
}
