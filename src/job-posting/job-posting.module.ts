import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobPosting } from './entities/job-posting.entity';
import { JobPostingService } from './job-posting.service';
import { JobPostingController } from './job-posting.controller';
import { LinkedInService } from 'src/linkedin/linkedin.service';
import { FacebookService } from 'src/facebook/facebook.service';


@Module({
  imports: [TypeOrmModule.forFeature([JobPosting])], // Remove LinkedInService
  controllers: [JobPostingController],
  providers: [JobPostingService, LinkedInService,FacebookService], // Keep LinkedInService here
  exports: [LinkedInService,FacebookService], // Only export if other modules need it
})
export class JobPostingModule {}
