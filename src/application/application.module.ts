import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm'; // Ensure TypeOrmModule is imported
import { ApplicationService } from './application.service';
import { ApplicationController } from './application.controller';
import { applications } from './entities/application.entity'; // Your entity
import { CoursesAndCertificationService } from 'src/courses_and_certification/courses_and_certification.service';
import { CoursesAndCertification } from 'src/courses_and_certification/entities/courses_and_certification.entity';
import { NotificationsService } from 'src/notifications/notifications.service';
import { Notification } from 'src/notifications/entities/notification.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([applications,CoursesAndCertification,Notification]), // Add your entity here
  ],
  providers: [ApplicationService,CoursesAndCertificationService,NotificationsService],
  controllers: [ApplicationController],
})
export class ApplicationModule {}
