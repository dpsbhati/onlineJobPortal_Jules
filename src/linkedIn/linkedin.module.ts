import { Module } from '@nestjs/common';
import { LinkedInService } from './linkedin.service';
import { LinkedinController } from './linkedin.controller';

@Module({
  controllers: [LinkedinController],
  providers: [LinkedInService],
  exports: [LinkedInService], 

})
export class LinkedinModule {}
