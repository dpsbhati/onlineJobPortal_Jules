import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobPosting } from './entities/job-posting.entity';
import { JobPostingService } from './job-posting.service';
import { JobPostingController } from './job-posting.controller';
import { LinkedInService } from 'src/linkedin/linkedin.service';
import { FacebookService } from 'src/facebook/facebook.service';
import { Users } from 'src/user/entities/user.entity';
import { NotificationGateway } from 'src/notifications/notifications.gateway';
import { NotificationsService } from 'src/notifications/notifications.service';
import { Notification } from '../notifications/entities/notification.entity';
@Module({
  imports: [TypeOrmModule.forFeature([JobPosting,Users,Notification])], // Remove LinkedInService
  controllers: [JobPostingController],
  providers: [JobPostingService, LinkedInService,FacebookService,NotificationGateway,NotificationsService], // Keep LinkedInService here
  exports: [LinkedInService,FacebookService], // Only export if other modules need it
})
export class JobPostingModule {}
