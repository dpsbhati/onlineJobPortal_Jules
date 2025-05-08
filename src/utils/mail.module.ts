// src/mail/mail.module.ts
import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';
import { MailService } from './mail.service';
import * as dotenv from 'dotenv';
dotenv.config();

let templateDirectory;
if (process.env.NODE_ENV === 'production') {
  templateDirectory = join(__dirname, '..', '..', 'api', 'templates');
}
if (process.env.NODE_ENV === 'development') {
  templateDirectory = join(__dirname, '..', '..', 'templates');
}

@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        host: 'smtp.gmail.com', // Your SMTP server
        port: 587, // SMTP port
        auth: {
          user: 'sarfaraz.f9460@gmail.com',
          pass: 'wciirazzhwdhppaw',
        },
      },
      defaults: {
        from: '"No Reply" <noreply@example.com>',
      },
      template: {
        dir: templateDirectory,
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
