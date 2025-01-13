import { Injectable } from '@nestjs/common';
import { CreateCoursesAndCertificationDto } from './dto/create-courses_and_certification.dto';
import { UpdateCoursesAndCertificationDto } from './dto/update-courses_and_certification.dto';

@Injectable()
export class CoursesAndCertificationService {
  create(createCoursesAndCertificationDto: CreateCoursesAndCertificationDto) {
    return 'This action adds a new coursesAndCertification';
  }

  findAll() {
    return `This action returns all coursesAndCertification`;
  }

  findOne(id: number) {
    return `This action returns a #${id} coursesAndCertification`;
  }

  update(id: number, updateCoursesAndCertificationDto: UpdateCoursesAndCertificationDto) {
    return `This action updates a #${id} coursesAndCertification`;
  }

  remove(id: number) {
    return `This action removes a #${id} coursesAndCertification`;
  }
}
