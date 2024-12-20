import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { users } from './entities/user.entity';
import { MailService } from 'src/utils/mail.service';

@Module({
  imports: [TypeOrmModule.forFeature([users])],
  controllers: [UserController],
  providers: [UserService,MailService],
})
export class UserModule {}
