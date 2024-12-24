import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Users } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { paginateResponse, WriteResponse } from 'src/shared/response';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(Users)
    private userRepository: Repository<Users>,
  ) {}

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

  async login(email: string, password: string) {
    try {
      const user = await this.userRepository.findOne({
        where: { email, is_deleted: false },
      });
  
      if (!user) {
        return WriteResponse(
          404,
          {},
          'Invalid email or password.'
        );
      }

    } catch (error) {
      return WriteResponse(
        500,
        {},
        error.message || 'An unexpected error occurred.'
      );
    }
  }
}
