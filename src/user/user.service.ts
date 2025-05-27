import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { IPagination } from 'src/shared/paginationEum';
import { paginateResponse, WriteResponse } from 'src/shared/response';
import {ChangePasswordDto,forgetPasswordDto} from 'src/user/dto/create-user.dto';
import { MailService } from 'src/utils/mail.service';
import { Not, Repository } from 'typeorm';
import { UserProfile } from '../user-profile/entities/user-profile.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { Users } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(Users)
    private userRepository: Repository<Users>,
    @InjectRepository(UserProfile)
    private userProfileRepository: Repository<UserProfile>,
    private readonly mailerService: MailService,
    private jwtService: JwtService,
  ) {}

  async validateUserById(userId: any) {
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
        userDto.email = user.email;

        const existingUser = await this.userRepository.findOne({
          where: {
            email: userDto.email,
            is_deleted: false,
            id: Not(userDto.id),
          },
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

    const userData = userDto.id
        ? { ...userDto }
        : { role: userDto.role, ...userDto }; // Include role on create
      const savedUser = await this.userRepository.save({
        ...user,
        ...userData,
      });

      // Insert data into user profile immediately after user creation
      if (!userDto.id) {
        await this.userProfileRepository.save({
          user_id: savedUser.id,
          first_name: userDto.firstName,
          last_name: userDto.lastName,
          // Add other profile fields as necessary
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }

      if (!userDto.id) {
        // Only send email if creating a new user
        const verificationToken = this.generateVerificationToken(savedUser.id);
        const verificationUrl = `${process.env.FRONTEND_URL}/authentication/email-activation?token=${verificationToken}`;
        const templateName = 'verify';
        await this.mailerService.sendEmail(
          savedUser.email,
          'Verify Your Email Address',
          { name: userDto.firstName, verificationUrl } as Record<string, any>,
          templateName, // Assuming this is the template name
        );
      }

      return WriteResponse(
        200,
        {
          email: savedUser.email,
          firstName: userDto.firstName,
          lastName: userDto.lastName,
        },
        user
          ? 'User updated successfully.'
          : 'User created successfully. Please verify your email to complete registration.',
      );
    } catch (error) {
      console.log(error);
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
    if (!User) {
      return WriteResponse(401, {}, 'Invalid Credentials.');
    }
    const passwordValid = await bcrypt.compare(password, User.password);
    if (!passwordValid) {
      console.log(`Invalid password for user: ${email}`);
      return WriteResponse(401, {}, 'Invalid password.');
    }
    const payload = { id: User.id };
    const token = await this.jwtService.signAsync(payload);
    if (!User.isActive) {
      // Assuming 'isActive' is the field that indicates if the user is active
      return WriteResponse(403, {}, 'User account is not active.');
    }

    // Check if email is verified
    if (!User.isEmailVerified) {
      console.log(`User email is not verified for email: ${email}`);
      const res = await this.resendEmailByEmail(email);
      if (res.statusCode == 200) {
        return WriteResponse(
          401,
          {},
          'Your email address is not verified. A new verification email has been sent to you. Please verify your email to continue.',
        );
      }
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
      const users = await this.userRepository.find({
        where: { is_deleted: false },
      });
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
      await this.userRepository.update(id, { is_deleted: true });
      return WriteResponse(200, { id }, `User deleted successfully.`);
    } catch (error) {
      return WriteResponse(
        500,
        {},
        error.message || 'An unexpected error occurred.',
      );
    }
  }

  async paginate(pagination: IPagination) {
    try {
      const { curPage, perPage, whereClause } = pagination;

      // Default whereClause to filter out deleted users
      let lwhereClause = 'is_deleted = false'; // Ensure deleted users are not fetched

      // Fields to search
      const fieldsToSearch = ['email', 'isActive', 'role'];

      // Process whereClause
      if (Array.isArray(whereClause)) {
        fieldsToSearch.forEach((field) => {
          const fieldValue = whereClause.find((p) => p.key === field)?.value;
          if (fieldValue) {
            lwhereClause += ` AND ${field} LIKE '%${fieldValue}%'`; // Removed 'job.' prefix
          }
        });

        const allValues = whereClause.find((p) => p.key === 'all')?.value;
        if (allValues) {
          const searches = fieldsToSearch
            .map((ser) => `${ser} LIKE '%${allValues}%'`) // Removed 'job.' prefix
            .join(' OR ');
          lwhereClause += ` AND (${searches})`;
        }
      }
      const skip = (curPage - 1) * perPage;
      const [list, count] = await this.userRepository
        .createQueryBuilder('user') // Changed alias to 'user'
        .where(lwhereClause)
        .orderBy('createdAt', 'DESC') // Order by created_at DESC
        .skip(skip)
        .take(perPage)
        .getManyAndCount();

      const enrichedUserList = await Promise.all(
        list.map(async (user) => {
          const { password, ...enrichedUser } = user; // Exclude password
          return enrichedUser;
        }),
      );

      return paginateResponse(enrichedUserList, count, curPage);
    } catch (error) {
      console.error('User Pagination Error --> ', error);
      return WriteResponse(500, error, `Something went wrong.`);
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
      const resetLink = `${process.env.FRONTEND_URL}/authentication/reset-password?token=${this.generateVerificationToken(user.id)}`;

      await this.mailerService.sendEmail(
        forgetPasswordDto.email,
        'Reset Password',
        { name: user.userProfile.first_name, resetLink: resetLink } as Record<
          string,
          any
        >,
        'forgetpassword',
      );
      user.isPasswordReset = false;
      user.resetToken = this.generateVerificationToken(user.id);

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

  async resetPassword(newPassword: string, token: string) {
    try {
      const userId = this.jwtService.verify(token).id;

      const user = await this.userRepository.findOne({
        where: { id: userId, is_deleted: false },
      });

      if (!user) {
        return WriteResponse(
          400,
          false,
          'User not found with the provided token.',
        );
      }

      if (user.isPasswordReset && user.resetToken === null) {
        return WriteResponse(
          400,
          false,
          'The password has already been reset using this link',
        );
      }

      if (user.resetToken !== token) {
        return WriteResponse(
          400,
          false,
          'The password has already been reset using this link',
        );
      }

      // Update the user's password using update instead of save
      await this.userRepository.update(userId, {
        password: await bcrypt.hash(newPassword, 10),
        isPasswordReset: true,
        resetToken: null,
      });

      return WriteResponse(200, {
        message: 'Password reset successfully.',
      });
    } catch (error) {
      console.log(error);
      if (error.name == 'TokenExpiredError') {
        return WriteResponse(410, false, 'The Link has been expired.');
      }
      return WriteResponse(
        500,
        false,
        error.message || 'Internal Server Error',
      );
    }
  }

  generateVerificationToken(userId: string): string {
    const token = this.jwtService.sign({ id: userId }, { expiresIn: '10m' }); // Token expires in 10 minutes
    return token;
  }

  async verifyEmail(token: string) {
    try {
      const userId = this.jwtService.verify(token).id;
      const user = await this.userRepository.findOne({
        where: { id: userId, is_deleted: false },
      });

      if (!user) {
        return WriteResponse(404, {}, 'User not found.');
      }

      if (user.isEmailVerified) {
        return WriteResponse(200, {}, 'Your email is already verified.');
      }
      // Update the user's email verification status
      await this.userRepository.update(userId, { isEmailVerified: true });

      return WriteResponse(200, {}, 'Email verified successfully.');
    } catch (error) {
      if (error.name == 'TokenExpiredError') {
        return WriteResponse(410, false, 'The Link has been expired.');
      }
      return WriteResponse(
        500,
        {},
        error.message || 'An unexpected error occurred.',
      );
    }
  }

  async resendEmailByEmail(email: string) {
    try {
      // Find user by email
      const user = await this.userRepository.findOne({
        where: { email, is_deleted: false },
      });

      if (!user) {
        return WriteResponse(404, {}, 'User not found.');
      }

      if (user.isEmailVerified) {
        return WriteResponse(400, {}, 'Email is already verified.');
      }

      // Generate verification token
      const verificationUrl = `${process.env.FRONTEND_URL}/authentication/email-activation?token=${this.generateVerificationToken(user.id)}`;

      // Resend the email
      await this.mailerService.sendEmail(
        user.email,
        'Verify Your Email Address',
        { name: user.userProfile.first_name, verificationUrl } as Record<
          string,
          any
        >,
        'verify',
      );

      return WriteResponse(200, {}, 'Verification email resent successfully.');
    } catch (error) {
      console.error('Error resending email:', error);
      return WriteResponse(
        500,
        {},
        'An unexpected error occurred while resending the email.',
      );
    }
  }

  async changePassword(changePasswordDto: ChangePasswordDto, req) {
    try {
      const user = await this.userRepository.findOne({
        where: { email: changePasswordDto.email, is_deleted: false },
      });
      if (!user) {
        return WriteResponse(404, false, 'User not found.');
      }
      const passwordValid = await bcrypt.compare(
        changePasswordDto.oldPassword,
        user.password,
      );
      if (!passwordValid) {
        return WriteResponse(401, false, 'Invalid current password.');
      }
      const hashedPassword = await bcrypt.hash(
        changePasswordDto.newPassword,
        10,
      );
      await this.userRepository.update(user.id, { password: hashedPassword });
      return WriteResponse(200, true, 'Password changed successfully.');
    } catch (error) {
      console.log(error);
      return WriteResponse(500, false, 'Something went wrong.');
    }
  }

  private async sendVerificationEmail(user: any) {
    const verificationUrl = `${process.env.FRONTEND_URL}/authentication/email-activation?token=${this.generateVerificationToken(user.id)}`;
    await this.mailerService.sendEmail(
      user.email,
      'Verify Your Email Address',
      { name: user.firstName, verificationUrl } as Record<string, any>,
      'verify',
    );
  }
}
