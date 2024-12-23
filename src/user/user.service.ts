import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Users } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { paginateResponse, WriteResponse } from 'src/shared/response';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';



@Injectable()
export class UserService {
  constructor(
    @InjectRepository(Users)
    private userRepository: Repository<Users>,
  ) {}

  async createUpdate(
    id: string | null,userDto: CreateUserDto | UpdateUserDto, ) {
    try {
      if (id) {
        const user = await this.userRepository.findOne({ where: { id } });
        if (!user) {
          return WriteResponse(
            HttpStatus.NOT_FOUND,
            {},
            `User with ID ${id} not found.`,
          );
        }
        Object.assign(user, userDto);
        const updatedUser = await this.userRepository.save(user);
        return WriteResponse(
          HttpStatus.OK,
          updatedUser,
          'User updated successfully.',
        );
      } else {
        const existingUser = await this.userRepository.findOne({
          where: { email: userDto.email },
        });

        if (existingUser) {
          return WriteResponse(
            HttpStatus.CONFLICT,
            {},
            `User with email ${userDto.email} already exists.`,
          );
        }

        const newUser = this.userRepository.create(userDto as CreateUserDto);
        const savedUser = await this.userRepository.save(newUser);
        return WriteResponse(
          HttpStatus.CREATED,
          savedUser,
          'User created successfully.',
        );
      }
    } catch (error) {
      return WriteResponse(
        HttpStatus.INTERNAL_SERVER_ERROR,
        {},
        error.message || 'An unexpected error occurred.',
      );
    }
  }
  
  async findAll() {
    try {
      const users = await this.userRepository.find();
      if (users.length === 0) {
        return WriteResponse(HttpStatus.NOT_FOUND, [], 'No users found.');
      }
      return WriteResponse(
        HttpStatus.OK,
        users,
        'Users retrieved successfully.',
      );
    } catch (error) {
      return WriteResponse(
        HttpStatus.INTERNAL_SERVER_ERROR,
        [],
        error.message || 'An unexpected error occurred.',
      );
    }
  }
  
  async delete(id: string) {
    try {
      const user = await this.userRepository.findOne({ where: { id } });
      if (!user) {
        return WriteResponse(HttpStatus.NOT_FOUND, {}, `User with ID ${id} not found.`);
      }
      
      await this.userRepository.delete(id);
      return WriteResponse(HttpStatus.OK, {}, `User with ID ${id} deleted successfully.`);
    } catch (error) {
      return WriteResponse(
        HttpStatus.INTERNAL_SERVER_ERROR,
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
      });
      
      if (list.length === 0) {
        return paginateResponse([], 0, count); 
      }
      
      return paginateResponse(list, count, count);
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || 'An unexpected error occurred.',
      };
    }
  }


  async forgotPassword(email: string) {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      return WriteResponse(
        HttpStatus.NOT_FOUND,
        {},
        `User with email ${email} not found.`,
      );
    }

    const resetToken = this.generateResetToken();
    user.resetPasswordToken = resetToken;
    await this.userRepository.save(user);

    return WriteResponse(
      HttpStatus.OK,
      { resetToken },
      'Reset token generated successfully.',
    );
  }

  private generateResetToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  async login(email: string, password: string) {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      return WriteResponse(
        HttpStatus.NOT_FOUND,
        {},
        `Invalid email or password.`,
      );
    }

    const isPasswordValid = await crypto.(password, user.password);
    if (!isPasswordValid) {
      return WriteResponse(
        HttpStatus.UNAUTHORIZED,
        {},
        `Invalid email or password.`,
      );
    }

    const token = this.generateJwtToken(user);
    return WriteResponse(
      HttpStatus.OK,
      { token, user },
      'Login successful.',
    );
  }

  private generateJwtToken(user: Users): string {
    const payload = { id: user.id, email: user.email };
    const secret = process.env.JWT_SECRET || 'your-secret-key';
    const expiresIn = '1h'; // Token expiration time

    return jwt.sign(payload, secret, { expiresIn });
  }
  
}