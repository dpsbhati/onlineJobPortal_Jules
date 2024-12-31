import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm'; // Ensure TypeOrmModule is imported
import { ApplicationService } from './application.service';
import { ApplicationController } from './application.controller';
import { applications } from './entities/application.entity'; // Your entity

@Module({
  imports: [
    TypeOrmModule.forFeature([applications]), // Add your entity here
  ],
  providers: [ApplicationService],
  controllers: [ApplicationController],
})
export class ApplicationModule {}
