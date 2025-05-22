import { Injectable } from '@nestjs/common';
import { CreateCoursesAndCertificationDto } from './dto/create-courses_and_certification.dto';
import { UpdateCoursesAndCertificationDto } from './dto/update-courses_and_certification.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CoursesAndCertification } from './entities/courses_and_certification.entity';
import { WriteResponse } from 'src/shared/response';

@Injectable()
export class CoursesAndCertificationService {
  constructor(
    @InjectRepository(CoursesAndCertification)
    private readonly coursesRepository: Repository<CoursesAndCertification>,
  ) {}

  create(createCoursesAndCertificationDto: CreateCoursesAndCertificationDto) {
    return 'This action adds a new coursesAndCertification';
  }

  findAll() {
    return `This action returns all coursesAndCertification`;
  }

  findOne(id: number) {
    return `This action returns a #${id} coursesAndCertification`;
  }

  update(
    id: number,
    updateCoursesAndCertificationDto: UpdateCoursesAndCertificationDto,
  ) {
    return `This action updates a #${id} coursesAndCertification`;
  }

  async remove(job_id: string) {
    try {
      if (!job_id) {
        return WriteResponse(
          400,
          {},
          'Job ID is required to delete courses and certifications.',
        );
      }

      // Fetch courses and certifications associated with the job ID
      const courses = await this.coursesRepository.find({
        where: { job_id, is_deleted: false }, // Ensures soft-deleted records are excluded
      });

      if (courses.length === 0) {
        return WriteResponse(
          404,
          {},
          `No courses or certifications found for job ID: ${job_id}.`,
        );
      }

      // Perform the delete operation
      const deleteResult = await this.coursesRepository.delete({
        job_id,
      });

      const affectedCount = deleteResult.affected || 0;

      if (affectedCount === 0) {
        return WriteResponse(
          404,
          {},
          `No courses or certifications found to delete for job ID: ${job_id}.`,
        );
      }

      return WriteResponse(
        200,
        { deleted_count: affectedCount },
        `Successfully removed ${affectedCount} courses and certifications for job ID:.`,
      );
    } catch (error) {
      console.error(
        `Error occurred while deleting courses and certifications for job ID: ${job_id}.`,
        error.message,
      );
      return WriteResponse(
        500,
        {},
        'An unexpected error occurred while deleting courses and certifications.',
      );
    }
  }
}
