import { Module } from '@nestjs/common';
import { UserProfileService } from './user-profile.service';
import { UserProfileController } from './user-profile.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserProfile } from './entities/user-profile.entity';
import { TravelDocument } from './entities/travel-documents.entity';
import { TrainingCertificate } from './entities/training-certificate.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserProfile,TravelDocument,TrainingCertificate])],
  controllers: [UserProfileController],
  providers: [UserProfileService],
})
export class UserProfileModule { }
