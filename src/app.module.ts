import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
// import { ConfigModule,ConfigService } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { JobPostingModule } from './job-posting/job-posting.module';
import { ApplicationModule } from './application/application.module';
import { UploadsModule } from './uploads/uploads.module';
import { LoggerMiddleware } from './middleware/logger.middleware';
import { MailModule } from './utils/mail.module';
import { AuthService } from './auth/auth.service';
import { JwtModule } from '@nestjs/jwt';
import { UserProfileModule } from './user-profile/user-profile.module';
import { LinkedinModule } from './linkedin/linkedin.module';
import { ScheduleModule } from '@nestjs/schedule';
import { JobScheduler } from './linkedin/linkedin.service';
import { FacebookModule } from './facebook/facebook.module';
import { CoursesAndCertificationModule } from './courses_and_certification/courses_and_certification.module';
import { ConfigService } from './config.service';
import { ConfigModule } from './config.module';
import { NotificationsModule } from './notifications/notifications.module';
import { RanksModule } from './ranks/ranks.module';
import { TrainingTypeModule } from './training-type/training-type.module';
import { TravelDocumentsTypeModule } from './travel_documents_type/travel_documents_type.module';

@Module({
  imports: [
    // ConfigModule.forRoot({
    //   isGlobal: true,
    //   // Ensures ConfigService is available globally
    // }),
    ConfigModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule, MailModule, ScheduleModule.forRoot()],
      // useFactory: async (configService: ConfigService) => ({
      //   type: 'mysql',
      //   host: configService.get<string>('DB_HOST', ''),
      //   port: configService.get<number>('DB_PORT', 3306),
      //   username: configService.get<string>('DB_USERNAME', ''),
      //   password: configService.get<string>('DB_PASSWORD', ''),
      //   database: configService.get<string>('DB_NAME', ''),
      //   entities: [__dirname + '/**/*.entity{.ts,.js}'],
      //   synchronize: false, // Set to false for production
      //   timezone: 'UTC',
      //   autoLoadEntities: true,
      // }),
      useFactory: (configService: ConfigService) =>
        configService.getTypeOrmConfig(),
      inject: [ConfigService], // Inject ConfigService
    }),
    UserModule,
    JobPostingModule,
    ApplicationModule,
    UploadsModule,
    UserProfileModule,
    LinkedinModule,
    FacebookModule,
    CoursesAndCertificationModule,
    NotificationsModule,
    RanksModule,
    TrainingTypeModule,
    TravelDocumentsTypeModule,
  ],
  providers: [JobScheduler],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
