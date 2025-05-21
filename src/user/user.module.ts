import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from './entities/user.entity';
import { MailModule } from 'src/utils/mail.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { UserProfile } from 'src/user-profile/entities/user-profile.entity';
import * as dotenv from 'dotenv';
dotenv.config();

@Module({
  imports: [
    MailModule,
    TypeOrmModule.forFeature([Users, UserProfile]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET, // Replace with your own secret key
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN }, // Set your desired expiration time
    }),
  ],
  controllers: [UserController],
  providers: [UserService, JwtStrategy],
})
export class UserModule {}
