import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobPosting } from './entities/job-posting.entity';
import { JobPostingService } from './job-posting.service';
import { JobPostingController } from './job-posting.controller';
import { LinkedInService } from 'src/linkedin/linkedin.service';

@Module({
  imports: [TypeOrmModule.forFeature([JobPosting])], // Remove LinkedInService
  controllers: [JobPostingController],
  providers: [JobPostingService, LinkedInService], // Keep LinkedInService here
  exports: [LinkedInService], // Only export if other modules need it
})
export class JobPostingModule {}
