import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SocialShareService {
  constructor(private configService: ConfigService) {}

  generateFacebookShareUrl(jobId: number, jobTitle: string, companyName: string): string {
    const baseUrl = this.configService.get<string>('APP_URL');
    const jobUrl = `${baseUrl}/jobs/${jobId}`;
    const text = encodeURIComponent(`Exciting Maritime Opportunity: ${jobTitle} at ${companyName}! 🚢 #MaritimeJobs #Seafarer`);
    return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(jobUrl)}&quote=${text}`;
  }

  generateLinkedInShareUrl(jobId: number, jobTitle: string, companyName: string): string {
    const baseUrl = this.configService.get<string>('APP_URL');
    const jobUrl = `${baseUrl}/jobs/${jobId}`;
    const title = encodeURIComponent(`Maritime Career Opportunity: ${jobTitle} at ${companyName}`);
    return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(jobUrl)}&title=${title}`;
  }

  generateTwitterShareUrl(jobId: number, jobTitle: string, companyName: string): string {
    const baseUrl = this.configService.get<string>('APP_URL');
    const jobUrl = `${baseUrl}/jobs/${jobId}`;
    const text = encodeURIComponent(`🚢 New Maritime Opportunity: ${jobTitle} at ${companyName}! Check it out: #MaritimeJobs #Seafarer`);
    return `https://twitter.com/intent/tweet?url=${encodeURIComponent(jobUrl)}&text=${text}`;
  }
}
