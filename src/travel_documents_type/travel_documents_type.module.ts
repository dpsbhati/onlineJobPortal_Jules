import { Module } from '@nestjs/common';
import { TravelDocumentsTypeService } from './travel_documents_type.service';
import { TravelDocumentsTypeController } from './travel_documents_type.controller';
import { TravelDocumentsType } from './entities/travel_documents_type.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([TravelDocumentsType])], // Register the entity here
  controllers: [TravelDocumentsTypeController],
  providers: [TravelDocumentsTypeService],
})
export class TravelDocumentsTypeModule {}
