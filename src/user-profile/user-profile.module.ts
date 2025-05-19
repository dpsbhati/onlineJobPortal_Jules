import { Module } from '@nestjs/common';
import { UserProfileService } from './user-profile.service';
import { UserProfileController } from './user-profile.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserProfile } from './entities/user-profile.entity';
import { CareerInfo } from './entities/career-info.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserProfile,CareerInfo])],
  controllers: [UserProfileController],
  providers: [UserProfileService],
})
export class UserProfileModule { }
