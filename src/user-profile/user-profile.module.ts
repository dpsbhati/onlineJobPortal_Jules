import { Module } from '@nestjs/common';
import { UserProfileService } from './user-profile.service';
import { UserProfileController } from './user-profile.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserProfile } from './entities/user-profile.entity';
import { TravelDocument } from './entities/travel-documents.entity';
import { TrainingCertificate } from './entities/training-certificate.entity';
import { UserMedicalQuestion } from './entities/user_medical_questionnaire.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserProfile,TravelDocument,TrainingCertificate,UserMedicalQuestion])],
  controllers: [UserProfileController],
  providers: [UserProfileService],
})
export class UserProfileModule { }
