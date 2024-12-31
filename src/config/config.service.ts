import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobPostingModule } from 'src/job-posting/job-posting.module'; // Import the JobPostingModule
import { JobPosting } from 'src/job-posting/entities/job-posting.entity'; // Import the JobPosting entity
import { applications } from 'src/application/entities/application.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: '103.195.4.8',
      port: 3306,
      username: 'admin_onlinejobportal',
      password: 'esh@len$1',
      database: 'admin_onlinejobportal',
      entities: [JobPosting, applications],
      synchronize: true,
    }),
    JobPostingModule,
  ],
})
export class AppModule { }
