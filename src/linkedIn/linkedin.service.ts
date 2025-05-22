import { Injectable } from '@nestjs/common';
import { CreateLinkedinDto } from './dto/create-linkedin.dto';
import { UpdateLinkedinDto } from './dto/update-linkedin.dto';
import { Cron, CronExpression } from '@nestjs/schedule';
import axios from 'axios';

@Injectable()
export class LinkedInService {
  private readonly apiUrl = 'https://api.linkedin.com/v2';
  private readonly accessToken = 'YOUR_ACCESS_TOKEN';

  async createJobPost(content: any): Promise<any> {
    const url = `${this.apiUrl}/jobPostings`;
    try {
      const response = await axios.post(url, content, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(`LinkedIn API error: ${error}`);
    }
  }

}


@Injectable()
export class JobScheduler {
  constructor(private readonly linkedInService: LinkedInService) {}

  @Cron(CronExpression.EVERY_HOUR) 
  async postScheduledJobs() {
    const jobContent = {
      title: 'Software Engineer',
      description: 'Job description goes here',
      location: 'Remote',
      // Add other LinkedIn job post fields
    };

    try {
      const response = await this.linkedInService.createJobPost(jobContent);
    } catch (error) {
      console.error('Error posting job:', error);
    }
  }
}
