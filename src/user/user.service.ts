import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { users } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRole } from 'src/user/enums/user-role.enums';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { LoginDto } from 'src/auth/dto/login.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(users)
    private userRepository: Repository<users>,
  ) {}

  // Create a new user
  async create(createUserDto: CreateUserDto): Promise<users> {
    const existingUser = await this.userRepository.findOne({ where: { email: createUserDto.email } });
    
    if (existingUser) {
      throw new BadRequestException('User already exists');
    }

    const user = this.userRepository.create(createUserDto);
    await user.hashPassword(); // Automatically hashes the password before saving

    return this.userRepository.save(user);
  }

  // Login a user
  async login(loginDto: LoginDto) {
    const user = await this.userRepository.findOne({ where: { email: loginDto.email } });

    if (!user || !(await user.validatePassword(loginDto.password))) {
      throw new BadRequestException('Invalid credentials');
    }

    const payload = { email: user.email, sub: user.id };
    // Implement JWT token generation here
    // const accessToken = this.jwtService.sign(payload);
    
    return { message: 'Login successful', userId: user.id };  // Replace with JWT token when implemented
  }

  // Forgot password
  async forgotPassword(email: string) {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const resetToken = this.generateResetToken();  // Implement this token generation function
    // await this.mailService.sendPasswordResetEmail(email, resetToken);  // Send reset email

    return { message: 'Password reset email sent' };
  }

  // Generate password reset token (this can be a JWT or a custom token)
  private generateResetToken(): string {
    // Implement logic for generating a token (for example, JWT or UUID)
    return 'generated-reset-token';  // Replace with actual token generation logic
  }

  // Get user profile by ID
  async getProfile(userId: number): Promise<users> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    
    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }

    return user;
  }

  // Update user profile
  async update(userId: number, updateUserDto: UpdateUserDto): Promise<users> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    Object.assign(user, updateUserDto);
    return this.userRepository.save(user);
  }

  // Fetch all users
  async findAll(): Promise<users[]> {
    return this.userRepository.find();
  }

  // Fetch a user by ID
  async findOne(id: number): Promise<users> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    return user;
  }

  // Delete a user by ID
  async remove(id: number): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    await this.userRepository.remove(user);
    return { message: `User with id ${id} has been deleted successfully` };
  }
}
