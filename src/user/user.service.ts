import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import { Users } from './entities/user.entity';
import { CreateUserDto, LoginDTO } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { paginateResponse, WriteResponse } from 'src/shared/response';
import {forgetPasswordDto} from 'src/user/dto/create-user.dto'
import { MailerService } from '@nestjs-modules/mailer';
import { MailService } from 'src/utils/mail.service';
import * as bcrypt from 'bcrypt';



@Injectable()
export class UserService {
  constructor(
    @InjectRepository(Users)
    private userRepository: Repository<Users>,
    private readonly mailerService: MailService,
    
  ) {}

  async validateUserById(userId: any) {
    console.log(userId)
    return this.userRepository.findOne({
      where: { id: userId },
    });
  }
  
  async createUpdate(userDto: CreateUserDto) {
    try {
      const user = userDto.id
      ? await this.userRepository.findOne({
        where: { id: userDto.id, is_deleted: false },
      })
      : null;
      if (userDto.id && !user) {
        return WriteResponse(404, {}, `User with ID ${userDto.id} not found.`);
      }
      if (!userDto.id) {
        const existingUser = await this.userRepository.findOne({
          where: { email: userDto.email, is_deleted: false },
        });
        if (existingUser) {
          return WriteResponse(
            409,
            {},
            `User with email ${userDto.email} already exists.`,
          );
        }
      }
      
      const savedUser = await this.userRepository.save(
        user || this.userRepository.create(userDto as CreateUserDto),
      );
      return WriteResponse(
        200,
        savedUser,
        user ? 'User updated successfully.' : 'User created successfully.',
      );
    } catch (error) {
      return WriteResponse(
        500,
        {},
        error.message || 'An unexpected error occurred.',
      );
    }
  }
  
  async LogIn(email: string, password: string): Promise<any> {
    const User = await this.userRepository.findOne({
      where: { email, is_deleted: false },
    });
    if (!User) return null;
    const passwordValid = await bcrypt.compare(password, User.password);
    if (!passwordValid) {
      return passwordValid;
    }
    if (!User) {
      return false;
    }

    if (User && passwordValid && User?.isEmailVerified == true) {
      // return User;
      // await this.logsService.create({
      //   users_id: User.id,
      //   log_detail: GenericActions['Logged-in'],
      //   createdBy: User.id,
      // });
      return User;
    }
    return { User };
  }

  async findOne(key: string, value: any) {
    try {
      const user = await this.userRepository.findOne({
        where: { [key]: value, is_deleted: false },
      });
      if (!user) {
        return WriteResponse(404, {}, `User with ${key} ${value} not found.`);
      }
      return WriteResponse(200, user, 'User retrieved successfully.');
    } catch (error) {
      return WriteResponse(
        500,
        {},
        error.message || 'An unexpected error occurred.',
      );
    }
  }

  async findAll() {
    try {
      const users = await this.userRepository.find();
      if (users.length === 0) {
        return WriteResponse(404, [], 'No users found.');
      }
      return WriteResponse(200, users, 'Users retrieved successfully.');
    } catch (error) {
      return WriteResponse(
        500,
        [],
        error.message || 'An unexpected error occurred.',
      );
    }
  }

  async delete(id: string) {
    try {
      const user = await this.userRepository.findOne({ where: { id } });
      if (!user) {
        return WriteResponse(404, {}, `User with ID ${id} not found.`);
      }

      await this.userRepository.delete(id);
      return WriteResponse(200, {}, `User with ID ${id} deleted successfully.`);
    } catch (error) {
      return WriteResponse(
        500,
        {},
        error.message || 'An unexpected error occurred.',
      );
    }
  }

  async Pagination(page: number, limit: number) {
    try {
      const offset = (page - 1) * limit;
      const [list, count] = await this.userRepository.findAndCount({
        skip: offset,
        take: limit,
        select: ['id', 'email', 'firstName', 'lastName', 'isEmailVerified', ], 
      });
  
      if (list.length === 0) {
        return paginateResponse([], 0, count);
      }
  
      return paginateResponse(list, count, count);
    } catch (error) {
      return {
        statusCode: 500,
        message: error.message || 'An unexpected error occurred.',
      };
    }
  }

  async forgetPassword(forgetPasswordDto: forgetPasswordDto) {
    try {
      const user = await this.userRepository.findOne({
        where: [{ email: forgetPasswordDto.email, is_deleted: false }],
      });
  
      if (!user) {
        return WriteResponse(404, false, 'User not exists with this email');
      }
  
  
      const resetLink = `${process.env.FRONTEND_URL}/reset-password?token`;
      const message = `
        You are receiving this email because a request to reset your password was received for your account.
        
        Click the link below to reset your password:
        ${resetLink}
        
        If you did not request a password reset, please ignore this email or contact our support team immediately.
      `;
  
     await this.mailerService.sendEmail(
      forgetPasswordDto.email,
      'Welcome to Our Platform',
      { name: user.firstName, verificationUrl: resetLink } as Record<string, any>,
      'welcome',
    );
      await this.userRepository.save(user);
      return WriteResponse(
        200,
        true,
        'Password reset link sent to your email successfully.',
      );
    } catch (error) {
      return WriteResponse(
        500,
        false,
        error.message || 'Internal Server Error',
      );
    }
  }
  
  async resetPassword(email: string, newPassword: string) {
    try {
      const user = await this.userRepository.findOne({
        where: { email, is_deleted: false }, 
      });
  
      if (!user) {
        return WriteResponse(400, false, 'User not found with the provided email.');
      }
  
      user.password = await bcrypt.hash(newPassword, 10);
      await this.userRepository.save(user);
  
      return WriteResponse(200, {
        message: 'Password reset successfully.',
      });
    } catch (error) {
      return WriteResponse(
        500,
        false,
        error.message || 'Internal Server Error',
      );
    }
  }
  
  

}

