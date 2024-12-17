import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobPosting } from './entities/job-posting.entity';
import { JobPostingService } from './job-posting.service';

@Module({
  imports: [TypeOrmModule.forFeature([JobPosting])],
  providers: [JobPostingService],
  exports: [JobPostingService],
})
export class JobPostingModule {}
