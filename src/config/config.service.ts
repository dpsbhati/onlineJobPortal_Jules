import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobPostingModule } from 'src/job-posting/job-posting.module';  // Import the JobPostingModule
import { JobPosting } from 'src/job-posting/entities/job-posting.entity';  // Import the JobPosting entity

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',  // Or your preferred database type
      host: 'localhost',
      port: 5432,
      username: 'user',
      password: 'password',
      database: 'jobportal',  // Replace with your actual database name
      entities: [JobPosting],  // Include your entities here
      synchronize: true,  // Set to false in production
    }),
    JobPostingModule,  // Import the JobPostingModule here
  ],
})
export class AppModule {}
