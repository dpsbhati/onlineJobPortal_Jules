import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class FacebookService {
  private readonly apiUrl = 'https://graph.facebook.com/v15.0';
  private readonly accessToken = 'YOUR_FACEBOOK_ACCESS_TOKEN'; // Replace with your access token

  async createJobPostFacebook(postData: any): Promise<any> {
    const url = `${this.apiUrl}/PAGE_ID/feed`; // Replace PAGE_ID with your Facebook Page ID
    try {
      const response = await axios.post(url, postData, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(
        `Facebook API Error: ${error.response?.data || error.message}`,
      );
    }
  }
}
