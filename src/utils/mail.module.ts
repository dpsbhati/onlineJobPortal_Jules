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
        host: process.env.MAIL_HOST, // Your SMTP server
        port: parseInt(process.env.MAIL_PORT), // SMTP port
        secure:true,
        auth: {
          user: process.env.MAIL_USERNAME, // Your SMTP username
          pass: process.env.MAIL_PASSWORD, // Your SMTP password
        },
      },
      defaults: {
        from: process.env.MAIL_FROM, // Default sender address
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
