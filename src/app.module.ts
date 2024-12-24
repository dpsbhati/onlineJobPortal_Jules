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


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Ensures ConfigService is available globally
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule, MailModule],
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
    // AuthService,
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
