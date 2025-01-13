import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobPosting } from './entities/job-posting.entity';
import { JobPostingService } from './job-posting.service';
import { JobPostingController } from './job-posting.controller';
import { LinkedInService } from 'src/linkedin/linkedin.service';
import { FacebookService } from 'src/facebook/facebook.service';
import { CoursesAndCertificationService } from 'src/courses_and_certification/courses_and_certification.service';
import { CoursesAndCertification } from 'src/courses_and_certification/entities/courses_and_certification.entity';

@Module({
  imports: [TypeOrmModule.forFeature([JobPosting,CoursesAndCertification])], // Remove LinkedInService
  controllers: [JobPostingController],
  providers: [JobPostingService, LinkedInService,FacebookService,CoursesAndCertificationService], // Keep LinkedInService here
  exports: [LinkedInService,FacebookService], // Only export if other modules need it
})
export class JobPostingModule {}
