import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Users } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRole } from 'src/user/enums/user-role.enums';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { LoginDto } from 'src/auth/dto/login.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(Users)
    private userRepository: Repository<Users>,
  ) {}

  // Create a new user
  async create(createUserDto: CreateUserDto) {
    return this.userRepository.save(createUserDto);
  }


  // Generate password reset token (this can be a JWT or a custom token)
  private generateResetToken(): string {
    // Implement logic for generating a token (for example, JWT or UUID)
    return 'generated-reset-token';  // Replace with actual token generation logic
  }
  // Fetch all users
  async findAll() {
    return this.userRepository.find();
  }

}
