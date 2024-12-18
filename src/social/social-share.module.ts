import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SocialShareService } from './social-share.service';

@Module({
  imports: [ConfigModule],
  providers: [SocialShareService],
  exports: [SocialShareService],
})
export class SocialShareModule {}
