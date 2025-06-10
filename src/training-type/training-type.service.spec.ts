import { Test, TestingModule } from '@nestjs/testing';
import { TrainingTypeService } from './training-type.service';

describe('TrainingTypeService', () => {
  let service: TrainingTypeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TrainingTypeService],
    }).compile();

    service = module.get<TrainingTypeService>(TrainingTypeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
