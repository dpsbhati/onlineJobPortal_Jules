import { PartialType } from '@nestjs/swagger';
import { CreateCoursesAndCertificationDto } from './create-courses_and_certification.dto';

export class UpdateCoursesAndCertificationDto extends PartialType(CreateCoursesAndCertificationDto) {}
