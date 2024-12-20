import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
// import { JobPosting } from 'src/job-posting/entities/job-posting.entity';
// import { Application } from 'src/application/entities/application.entity';
import { UserModule } from './user/user.module';
import { JobPostingModule } from './job-posting/job-posting.module';
import { ApplicationModule } from './application/application.module';
import { UploadsModule } from './uploads/uploads.module';
import { LoggerMiddleware } from './middleware/logger.middleware';
import { MailModule } from './utils/mail.module';
import { Application } from './application/entities/application.entity';
import { JobPosting } from './job-posting/entities/job-posting.entity';
import { users } from './user/entities/user.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Ensures ConfigService is available globally
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule,MailModule],
      useFactory: async (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('DB_HOST', '103.195.4.8'),
        port: configService.get<number>('DB_PORT', 3306),
        username: configService.get<string>('DB_USERNAME', 'admin_onlinejobportal'),
        password: configService.get<string>('DB_PASSWORD', 'esh@len$1'),
        database: configService.get<string>('DB_NAME', 'admin_onlinejobportal'),
        // entities: [JobPosting, Application,users],
        synchronize: true, // Set to false in production
      }),
      inject: [ConfigService],
    }),
    UserModule,
    JobPostingModule,
    ApplicationModule,
    UploadsModule
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes('*');
  }
}
