import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobPostingModule } from 'src/job-posting/job-posting.module'; // Import the JobPostingModule
import { JobPosting } from 'src/job-posting/entities/job-posting.entity'; // Import the JobPosting entity
import { Application } from 'src/application/entities/application.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql', // Or your preferred database type
      host: '127.0.0.1',
      port: 3307,
      username: 'root',
      password: 'roost',
      database: 'jobportal', // Replace with your actual database name
      entities: [JobPosting,Application], // Include your entities here
      synchronize: true, // Set to false in production
    }),
    JobPostingModule, // Import the JobPostingModule here
  ],
})
export class AppModule {}
