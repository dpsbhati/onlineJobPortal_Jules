import { Test, TestingModule } from '@nestjs/testing';
import { TravelDocumentsTypeService } from './travel_documents_type.service';

describe('TravelDocumentsTypeService', () => {
  let service: TravelDocumentsTypeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TravelDocumentsTypeService],
    }).compile();

    service = module.get<TravelDocumentsTypeService>(TravelDocumentsTypeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
