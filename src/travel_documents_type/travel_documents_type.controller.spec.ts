import { Test, TestingModule } from '@nestjs/testing';
import { TravelDocumentsTypeController } from './travel_documents_type.controller';
import { TravelDocumentsTypeService } from './travel_documents_type.service';

describe('TravelDocumentsTypeController', () => {
  let controller: TravelDocumentsTypeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TravelDocumentsTypeController],
      providers: [TravelDocumentsTypeService],
    }).compile();

    controller = module.get<TravelDocumentsTypeController>(TravelDocumentsTypeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
