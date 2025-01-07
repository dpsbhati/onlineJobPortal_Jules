import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
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


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, 
      // Ensures ConfigService is available globally
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule, MailModule,ScheduleModule.forRoot()],
      useFactory: async (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('DB_HOST', '103.195.4.8'),
        port: configService.get<number>('DB_PORT', 3306),
        username: configService.get<string>('DB_USERNAME', 'admin_onlinejobportal'),
        password: configService.get<string>('DB_PASSWORD', 'esh@len$1'),
        database: configService.get<string>('DB_NAME', 'admin_onlinejobportal'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: false, // Set to false for production
        // timezone: 'UTC',
        autoLoadEntities: true,
      }),
      inject: [ConfigService],
    }),
    UserModule,
    JobPostingModule,
    ApplicationModule,
    UploadsModule,
    UserProfileModule,
    LinkedinModule,
    FacebookModule,
    
  ],
  providers: [JobScheduler],

})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes('*');
  }
}
