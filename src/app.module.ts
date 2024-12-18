// import { Module } from '@nestjs/common';
// import { JobPostingModule } from './job-posting/job-posting.module';
// import { ApplicationModule } from './application/application.module';

// @Module({
//   imports: [JobPostingModule,ApplicationModule],
// })
// export class AppModule {}


import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JobPostingModule } from 'src/job-posting/job-posting.module';
import { JobPosting } from 'src/job-posting/entities/job-posting.entity';
import { Application } from 'src/application/entities/application.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Ensures ConfigService is available globally
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('DB_HOST', '103.195.4.8'),
        port: configService.get<number>('DB_PORT', 3306),
        username: configService.get<string>('DB_USERNAME', 'admin_onlinejobportal'),
        password: configService.get<string>('DB_PASSWORD', 'esh@len$1'),
        database: configService.get<string>('DB_NAME', 'admin_onlinejobportal'),
        entities: [JobPosting, Application],
        synchronize: true, // Set to false in production
      }),
      inject: [ConfigService],
    }),
    JobPostingModule,
  ],
})
export class AppModule {}
