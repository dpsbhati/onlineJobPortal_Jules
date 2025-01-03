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
import { IPagination } from 'src/shared/paginationEum';
import { UserProfile } from '../user-profile/entities/user-profile.entity';



@Injectable()
export class UserService {
  constructor(
    @InjectRepository(Users)
    private userRepository: Repository<Users>,
    @InjectRepository(UserProfile)
    private userProfileRepository: Repository<UserProfile>,
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
        userDto.email = user.email;

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

      function isTemporaryEmail(email: string): boolean {
        const domain = email.split('@')[1];
        return TEMP_EMAIL_DOMAINS.includes(domain);
      }

      if (!userDto.id && isTemporaryEmail(userDto.email)) {
        return WriteResponse(400, {}, 'Temporary email addresses are not allowed.');
      }

      // Create a new object excluding role
      const { role, ...userData } = userDto; // Exclude password here
      const savedUser = await this.userRepository.save({ ...user, ...userData });

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
        const verificationUrl = `${process.env.FRONTEND_URL}/auth/email-activation?token=${verificationToken}`;

        await this.mailerService.sendEmail(
          savedUser.email,
          'Verify Your Email Address',
          { name: userDto.firstName, verificationUrl } as Record<string, any>,
          'verify', // Assuming this is the template name
        );
      }

      return WriteResponse(
        200,
        {
          email: savedUser.email,
          firstName: userDto.firstName,
          lastName: userDto.lastName,
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
    if (!User) {
      return WriteResponse(403, {}, 'Invalid Credentials.');
    }
    const passwordValid = await bcrypt.compare(password, User.password);
    if (!passwordValid) {
      console.log(`Invalid password for user: ${email}`);
      return WriteResponse(403, {}, 'Invalid password.');
    }
    const payload = { id: User.id };
    const token = await this.jwtService.signAsync(payload);
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
      const fieldsToSearch = [
        'email',
        'isActive',
        'role'
      ];

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

      const verificationToken = this.generateVerificationToken(user.id);
      const resetLink = `${process.env.FRONTEND_URL}/auth/reset-password?token=${verificationToken}`;

      // const message = `
      //   You are receiving this email because a request to reset your password was received for your account.

      //   Click the link below to reset your password:
      //   ${resetLink}

      //   If you did not request a password reset, please ignore this email or contact our support team immediately.
      // `;

      await this.mailerService.sendEmail(
        forgetPasswordDto.email,
        'Welcome to Our Platform',
        { name: user.email, resetLink: resetLink } as Record<string, any>,
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

      // Update the user's password using update instead of save
      await this.userRepository.update(userId, { password: await bcrypt.hash(newPassword, 10) });

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
      await this.userRepository.update(userId, { isEmailVerified: true });

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