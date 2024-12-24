import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from './entities/user.entity';
import { MailModule } from 'src/utils/mail.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [MailModule, TypeOrmModule.forFeature([Users]), PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: 'jobportal', // Replace with your own secret key
      signOptions: { expiresIn: '1d' }, // Set your desired expiration time
    }),],
  controllers: [UserController],
  providers: [UserService, JwtStrategy],
})
export class UserModule { }
