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
import { Attachment } from 'src/attachment/entities/attachment.entity';

@Module({
  imports: [
    MailModule,
    TypeOrmModule.forFeature([Users, UserProfile, Attachment]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: 'jobportal', // Replace with your own secret key
      signOptions: { expiresIn: '1d' }, // Set your desired expiration time
    }),
  ],
  controllers: [UserController],
  providers: [UserService, JwtStrategy],
})
export class UserModule {}
