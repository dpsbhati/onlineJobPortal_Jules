import { MailerOptions } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';
dotenv.config();

@Injectable()
export class ConfigService {
  getTypeOrmConfig(): TypeOrmModuleOptions {
    return {
      type: process.env.DATABASE_TYPE as any,
      host: process.env.DATABASE_HOST,
      port: parseInt(process.env.DATABASE_PORT, 10),
      username: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: false, // Set to false for production
      // synchronize: true,
      timezone: 'Z',
      autoLoadEntities: true,
      extra: {
        idleTimeoutMillis: 30000,
        poolSize: 10000,
      },

      logger: 'simple-console',
      // logging:true,
    };
  }
}
