import { Test, TestingModule } from '@nestjs/testing';
import { CoursesAndCertificationService } from './courses_and_certification.service';

describe('CoursesAndCertificationService', () => {
  let service: CoursesAndCertificationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CoursesAndCertificationService],
    }).compile();

    service = module.get<CoursesAndCertificationService>(CoursesAndCertificationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
