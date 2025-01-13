import { Test, TestingModule } from '@nestjs/testing';
import { CoursesAndCertificationController } from './courses_and_certification.controller';
import { CoursesAndCertificationService } from './courses_and_certification.service';

describe('CoursesAndCertificationController', () => {
  let controller: CoursesAndCertificationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CoursesAndCertificationController],
      providers: [CoursesAndCertificationService],
    }).compile();

    controller = module.get<CoursesAndCertificationController>(CoursesAndCertificationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
