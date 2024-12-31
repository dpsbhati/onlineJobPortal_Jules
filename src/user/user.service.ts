import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Not, Repository } from 'typeorm';
import { Users } from './entities/user.entity';
import { CreateUserDto, LoginDTO } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { paginateResponse, WriteResponse } from 'src/shared/response';
import { forgetPasswordDto } from 'src/user/dto/create-user.dto'
import { MailerService } from '@nestjs-modules/mailer';
import { MailService } from 'src/utils/mail.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';



@Injectable()
export class UserService {
  constructor(
    @InjectRepository(Users)
    private userRepository: Repository<Users>,
    private readonly mailerService: MailService,
    private jwtService: JwtService,
  ) { }

  async validateUserById(userId: any) {
    console.log(userId)
    return this.userRepository.findOne({
      where: { id: userId },
    });
  }

  async createUpdate(userDto: CreateUserDto) {
    try {
      // Hash the password at the start if provided
      if (userDto.password) {
        userDto.password = await bcrypt.hash(userDto.password, 10);
      }

      const user = userDto.id
        ? await this.userRepository.findOne({
          where: { id: userDto.id, is_deleted: false },
        })
        : null;
      if (userDto.id && !user) {
        return WriteResponse(404, {}, `User with ID ${userDto.id} not found.`);
      }
      if (userDto.id) {
        // Check if the email already exists for another user
        const existingUser = await this.userRepository.findOne({
          where: { email: userDto.email, is_deleted: false, id: Not(userDto.id) },
        });
        if (existingUser) {
          return WriteResponse(
            409,
            {},
            `User with email ${userDto.email} already exists.`,
          );
        }
      } else {
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

      const TEMP_EMAIL_DOMAINS = [
        'tempmail.com',
        '10minutemail.com',
        'guerrillamail.com',
        'mailinator.com',
        'yopmail.com',
        'burnermail.io',
        'trashmail.com',
        'throwawaymail.com',
        'emailondeck.com',
        'getnada.com',
        'maildrop.cc',
        'anonaddy.com',
        'dispostable.com',
        'fakemailgenerator.com',
        'mohmal.com',
        'mytemp.email',
        'tempinbox.com',
        'inboxkitten.com',
        'spamgourmet.com',
        'throwawaymail.com',
      ]; // Add more as needed

      // Function to check if the email is temporary
      function isTemporaryEmail(email: string): boolean {
        const domain = email.split('@')[1];
        return TEMP_EMAIL_DOMAINS.includes(domain);
      }

      if (isTemporaryEmail(userDto.email)) {
        return WriteResponse(400, {}, 'Temporary email addresses are not allowed.');
      }

      // Create a new object excluding role
      const { role, ...userData } = userDto; // Exclude password here
      const savedUser = await this.userRepository.save({ ...user, ...userData });

      if (!userDto.id) { // Only send email if creating a new user
        // Generate verification token
        const verificationToken = this.generateVerificationToken(savedUser.id);
        const verificationUrl = `${process.env.FRONTEND_URL}/auth/email-activation?token=${verificationToken}`;

        // Send verification email
        await this.mailerService.sendEmail(
          savedUser.email,
          'Verify Your Email Address',
          { name: savedUser.firstName, verificationUrl } as Record<string, any>,
          'verify' // Assuming this is the template name
        );
      }

      return WriteResponse(
        200,
        {
          email: savedUser.email,
          firstName: savedUser.firstName,
          lastName: savedUser.lastName,
        },
        user ? 'User updated successfully.' : 'User created successfully. Please verify your email.',
      );
    } catch (error) {
      return WriteResponse(
        500,
        {},
        error.message || 'An unexpected error occurred.',
      );
    }
  }

  async LogIn(email: string, password: string) {
    console.log('LogIn function called with email:', email);
  
    // Fetch the user
    const User = await this.userRepository.findOne({
      where: { email, is_deleted: false },
    });
    if(!User){
      return WriteResponse(403, {}, 'Invalid Credentials.');
    }
    const passwordValid = await bcrypt.compare(password, User.password);
    if (!passwordValid) {
      console.log(`Invalid password for user: ${email}`);
      return WriteResponse(403, {}, 'Invalid password.');
    }
    const payload = { id: User.id };
    const token = await this.jwtService.signAsync(payload);
    console.log(User);
    if (!User.isActive) { // Assuming 'isActive' is the field that indicates if the user is active
      return WriteResponse(403, {}, 'User account is not active.');
    }
  
    // Check if email is verified
    if (!User.isEmailVerified) {
      console.log(`User email is not verified for email: ${email}`);
      return WriteResponse(403, {}, 'User email is not verified.');
    }
    delete User.password;
    return WriteResponse(200, { User, token }, 'Login successful.'); // Include token in data
  }
  
  

  async findOne(key: string, value: any) {
    try {
      const user = await this.userRepository.findOne({
        where: { [key]: value, is_deleted: false },
      });
      if (!user) {
        return WriteResponse(404, {}, `User with ${key} ${value} not found.`);
      }
      delete user.password;
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
      const users = await this.userRepository.find({ where: { is_deleted: false } });
      if (users.length === 0) {
        return WriteResponse(404, [], 'No users found.');
      }
      users.map((element) => {
        delete element.password;
      });
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

      // Set is_deleted to true instead of deleting the user
      user.is_deleted = true;
      await this.userRepository.save(user);
      return WriteResponse(200, { id }, `User with ID ${id} marked as deleted successfully.`);
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
        where: { is_deleted: false },
        skip: offset,
        take: limit,
        select: ['id', 'email', 'firstName', 'lastName', 'isEmailVerified'],
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

      const verificationToken = this.generateVerificationToken(user.id);
      const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${verificationToken}`;

      // const message = `
      //   You are receiving this email because a request to reset your password was received for your account.

      //   Click the link below to reset your password:
      //   ${resetLink}

      //   If you did not request a password reset, please ignore this email or contact our support team immediately.
      // `;

      await this.mailerService.sendEmail(
        forgetPasswordDto.email,
        'Welcome to Our Platform',
        { name: user.firstName, resetLink: resetLink } as Record<string, any>,
        'forgetpassword',
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

  async resetPassword(newPassword: string, token: string,) {
    try {
      const decoded = this.jwtService.verify(token);
      const userId = decoded.id;

      const user = await this.userRepository.findOne({
        where: { id: userId, is_deleted: false },
      });

      if (!user) {
        return WriteResponse(400, false, 'User not found with the provided token.');
      }

      // Update the user's password
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

  generateVerificationToken(userId: string): string {
    // const secretKey = process.env.JWT_SECRET; // Ensure you have a secret key in your environment variables
    const token = this.jwtService.sign({ id: userId }, { expiresIn: '10m' }); // Token expires in 10 minutes
    return token;
  }

  async verifyEmail(token: string) {
    try {
      const decoded = this.jwtService.verify(token); // Decode the token
      const userId = decoded.id; // Extract user ID from the token

      const user = await this.userRepository.findOne({
        where: { id: userId, is_deleted: false },
      });

      if (!user) {
        return WriteResponse(404, {}, 'User not found.');
      }

      // Update the user's email verification status
      user.isEmailVerified = true;
      await this.userRepository.save(user);

      return WriteResponse(200, {}, 'Email verified successfully.');
    } catch (error) {
      return WriteResponse(
        500,
        {},
        error.message || 'An unexpected error occurred.',
      );
    }
  }


}