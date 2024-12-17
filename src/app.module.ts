import { Module } from '@nestjs/common';
import { JobPostingModule } from './job-posting/job-posting.module';
import { ApplicationModule } from './application/application.module';

@Module({
  imports: [JobPostingModule,ApplicationModule],
})
export class AppModule {}
