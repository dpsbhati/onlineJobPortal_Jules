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

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Ensures ConfigService is available globally
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule,MailModule],
      useFactory: async (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        // entities: [JobPosting, Application],
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
