import { Test, TestingModule } from '@nestjs/testing';
import { TrainingTypeController } from './training-type.controller';
import { TrainingTypeService } from './training-type.service';

describe('TrainingTypeController', () => {
  let controller: TrainingTypeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TrainingTypeController],
      providers: [TrainingTypeService],
    }).compile();

    controller = module.get<TrainingTypeController>(TrainingTypeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
