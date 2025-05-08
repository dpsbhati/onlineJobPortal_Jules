// src/mail/mail.service.ts
import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  

  async sendEmail(
    to: string,
    subject: string,
    context: Record<string, any>,
    templateName: string='verify'
  ) {
    try {
      await this.mailerService.sendMail({
        to,
        subject,
        template: templateName, // Name of the template file without extension
        context, // Data to pass to the template
      });
      console.log(`Email sent to ${to}`);
    } catch (error) {
      console.error(`Failed to send email to ${to}:`, error.message);
      throw error;
    }
  }
}
