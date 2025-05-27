import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm'; // Ensure TypeOrmModule is imported
import { ApplicationService } from './application.service';
import { ApplicationController } from './application.controller';
import { applications } from './entities/application.entity'; // Your entity
import { CoursesAndCertificationService } from 'src/courses_and_certification/courses_and_certification.service';
import { CoursesAndCertification } from 'src/courses_and_certification/entities/courses_and_certification.entity';
import { NotificationsService } from 'src/notifications/notifications.service';
import { Notification } from 'src/notifications/entities/notification.entity';
import { JobPosting } from 'src/job-posting/entities/job-posting.entity';
import { NotificationGateway } from 'src/notifications/notifications.gateway';
import { Users } from 'src/user/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([applications,CoursesAndCertification,Notification,JobPosting,Users]), // Add your entity here
  ],
  providers: [ApplicationService,CoursesAndCertificationService,NotificationsService,NotificationGateway],
  controllers: [ApplicationController],

})
export class ApplicationModule {}
