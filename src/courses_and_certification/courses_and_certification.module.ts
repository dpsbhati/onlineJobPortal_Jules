import { Module } from '@nestjs/common';
import { CoursesAndCertificationService } from './courses_and_certification.service';
import { CoursesAndCertificationController } from './courses_and_certification.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoursesAndCertification } from './entities/courses_and_certification.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CoursesAndCertification])], // Remove LinkedInService
  controllers: [CoursesAndCertificationController],
  providers: [CoursesAndCertificationService],
  exports: [CoursesAndCertificationService]
})
export class CoursesAndCertificationModule {}


