import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { ApplicationStatus } from 'src/application/enums/applications.-status';

@Injectable()
export class EmailService {
  private transporter: any;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST'),
      port: this.configService.get<number>('SMTP_PORT'),
      secure: true,
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASS'),
      },
    });
  }

  async sendApplicationStatusUpdate(
    to: string,
    applicantName: string,
    jobTitle: string,
    status: ApplicationStatus,
  ): Promise<void> {
    const subject = this.getStatusUpdateSubject(status, jobTitle);
    const content = this.getStatusUpdateContent(status, applicantName, jobTitle);

    await this.transporter.sendMail({
      from: this.configService.get<string>('SMTP_FROM'),
      to,
      subject,
      html: content,
    });
  }

  async sendApplicationAcknowledgment(
    to: string,
    applicantName: string,
    jobTitle: string,
  ): Promise<void> {
    const subject = `Application Received: ${jobTitle}`;
    const content = `
      <p>Dear ${applicantName},</p>
      <p>Thank you for applying for the position of ${jobTitle}. We have received your application and our team will review it shortly.</p>
      <p>We appreciate your interest in joining our maritime community and will be in touch with updates regarding your application.</p>
      <p>Best regards,<br>The Navilands Team</p>
    `;

    await this.transporter.sendMail({
      from: this.configService.get<string>('SMTP_FROM'),
      to,
      subject,
      html: content,
    });
  }

  private getStatusUpdateSubject(status: ApplicationStatus, jobTitle: string): string {
    switch (status) {
      case ApplicationStatus.UNDER_REVIEW:
        return `Your application for ${jobTitle} is under review`;
      case ApplicationStatus.SHORTLISTED:
        return `Shortlisted: Your application for ${jobTitle}`;
      case ApplicationStatus.INTERVIEW_SCHEDULED:
        return `Interview Scheduled: ${jobTitle} Position`;
      case ApplicationStatus.INTERVIEW_COMPLETED:
        return `Interview Follow-up: ${jobTitle} Position`;
      case ApplicationStatus.DOCUMENT_VERIFICATION:
        return `Document Verification Required: ${jobTitle} Application`;
      case ApplicationStatus.MEDICAL_CHECK:
        return `Medical Check Required: ${jobTitle} Position`;
      case ApplicationStatus.CONTRACT_PREPARATION:
        return `Contract Preparation: ${jobTitle} Position`;
      case ApplicationStatus.CONTRACT_SENT:
        return `Contract Ready for Review: ${jobTitle} Position`;
      case ApplicationStatus.CONTRACT_SIGNED:
        return `Contract Signed: Welcome Aboard for ${jobTitle}`;
      case ApplicationStatus.ONBOARDING:
        return `Onboarding Process: ${jobTitle} Position`;
      case ApplicationStatus.COMPLETED:
        return `Welcome Aboard: ${jobTitle} Position`;
      case ApplicationStatus.ON_HOLD:
        return `Application Status Update: ${jobTitle}`;
      case ApplicationStatus.REJECTED:
        return `Update on your application for ${jobTitle}`;
      case ApplicationStatus.WITHDRAWN:
        return `Application Withdrawn: ${jobTitle}`;
      default:
        return `Status Update: Your application for ${jobTitle}`;
    }
  }

  private getStatusUpdateContent(
    status: ApplicationStatus,
    applicantName: string,
    jobTitle: string,
  ): string {
    const baseContent = `<p>Dear ${applicantName},</p>`;
    let statusContent = '';

    switch (status) {
      case ApplicationStatus.UNDER_REVIEW:
        statusContent = `
          <p>Your application for the ${jobTitle} position is currently under review by our recruitment team.</p>
          <p>We will carefully evaluate your qualifications and experience against the position requirements.</p>
        `;
        break;
      case ApplicationStatus.SHORTLISTED:
        statusContent = `
          <p>Congratulations! Your application for the position of ${jobTitle} has been shortlisted.</p>
          <p>Our team was impressed with your maritime qualifications and experience. We will contact you soon regarding the next steps in the selection process.</p>
        `;
        break;
      case ApplicationStatus.INTERVIEW_SCHEDULED:
        statusContent = `
          <p>Your application for ${jobTitle} has progressed to the interview stage.</p>
          <p>Please check your calendar invitation for the interview details. Be prepared to discuss your maritime experience and qualifications.</p>
        `;
        break;
      case ApplicationStatus.INTERVIEW_COMPLETED:
        statusContent = `
          <p>Thank you for attending the interview for the ${jobTitle} position.</p>
          <p>We appreciate you taking the time to discuss your experience with us. Our team will review your interview and be in touch with the next steps.</p>
        `;
        break;
      case ApplicationStatus.DOCUMENT_VERIFICATION:
        statusContent = `
          <p>As part of the selection process for ${jobTitle}, we need to verify your maritime documents.</p>
          <p>Please submit the following documents through your application portal:</p>
          <ul>
            <li>Seaman's Book</li>
            <li>Relevant Certificates</li>
            <li>Passport</li>
            <li>Previous Contract References</li>
          </ul>
        `;
        break;
      case ApplicationStatus.MEDICAL_CHECK:
        statusContent = `
          <p>As part of the final selection process for ${jobTitle}, you are required to complete a medical examination.</p>
          <p>We will send you details about the authorized medical centers and required examinations shortly.</p>
        `;
        break;
      case ApplicationStatus.CONTRACT_PREPARATION:
        statusContent = `
          <p>We are currently preparing your contract for the ${jobTitle} position.</p>
          <p>Our HR team is finalizing the terms and conditions based on our discussions.</p>
        `;
        break;
      case ApplicationStatus.CONTRACT_SENT:
        statusContent = `
          <p>Your contract for the ${jobTitle} position is ready for your review.</p>
          <p>Please log in to your portal to review and sign the contract. If you have any questions, please contact our HR team.</p>
        `;
        break;
      case ApplicationStatus.CONTRACT_SIGNED:
        statusContent = `
          <p>Congratulations! Your contract for ${jobTitle} has been successfully signed.</p>
          <p>Welcome to our maritime family! Our HR team will contact you shortly with onboarding information.</p>
        `;
        break;
      case ApplicationStatus.ONBOARDING:
        statusContent = `
          <p>Welcome aboard! We're excited to begin your onboarding process for the ${jobTitle} position.</p>
          <p>You will receive detailed information about your joining formalities and required documentation soon.</p>
        `;
        break;
      case ApplicationStatus.COMPLETED:
        statusContent = `
          <p>Congratulations on completing all requirements for the ${jobTitle} position!</p>
          <p>We're excited to have you join our maritime team. Your journey with us begins now.</p>
        `;
        break;
      case ApplicationStatus.ON_HOLD:
        statusContent = `
          <p>Your application for ${jobTitle} has been placed on hold.</p>
          <p>We will keep your application in our active database and contact you if there are any updates.</p>
        `;
        break;
      case ApplicationStatus.REJECTED:
        statusContent = `
          <p>Thank you for your interest in the ${jobTitle} position and for taking the time to go through our application process.</p>
          <p>After careful consideration, we regret to inform you that we have decided to move forward with other candidates whose qualifications better match our current requirements.</p>
          <p>We encourage you to apply for future positions that match your skills and experience.</p>
        `;
        break;
      case ApplicationStatus.WITHDRAWN:
        statusContent = `
          <p>We have received your request to withdraw your application for the ${jobTitle} position.</p>
          <p>We appreciate your interest in our company and wish you success in your future endeavors.</p>
        `;
        break;
      default:
        statusContent = `
          <p>There has been an update to your application for ${jobTitle}.</p>
          <p>Please log in to your account to view the details.</p>
        `;
    }

    return `
      ${baseContent}
      ${statusContent}
      <p>Best regards,<br>The Navilands Team</p>
    `;
  }
}
