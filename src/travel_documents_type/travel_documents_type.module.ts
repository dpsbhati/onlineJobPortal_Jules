import { Module } from '@nestjs/common';
import { TravelDocumentsTypeService } from './travel_documents_type.service';
import { TravelDocumentsTypeController } from './travel_documents_type.controller';

@Module({
  controllers: [TravelDocumentsTypeController],
  providers: [TravelDocumentsTypeService],
})
export class TravelDocumentsTypeModule {}
