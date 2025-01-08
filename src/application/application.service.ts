import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { applications } from './entities/application.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { WriteResponse } from 'src/shared/response';

@Injectable()
export class ApplicationService {
  constructor(
    @InjectRepository(applications)
    private readonly applicationRepository: Repository<applications>,
  ) {}

  async applyForJob(createApplicationDto: CreateApplicationDto) {
    const { job_id, user_id } = createApplicationDto;
  
    // Check if the user has already applied for this job
    const existingApplication = await this.applicationRepository.findOne({
      where: {
        job: { id: job_id }, 
        user: { id: user_id },
        is_deleted: false,
      },
    });
  
    if (existingApplication) {
      throw new Error('You have already applied for this job.');
    }
  
    // Create a new application
    const application = this.applicationRepository.create({
      job: { id: job_id }, // Reference the job relation
      user: { id: user_id }, // Reference the user relation
      status: 'Pending',
      description: createApplicationDto.description,
      comments: createApplicationDto.comments,
      cv_path: createApplicationDto.cv_path,
      additional_info: createApplicationDto.additional_info,
      work_experiences: createApplicationDto.work_experiences,
      created_by: user_id,
      updated_by: user_id,
    });
  
    return await this.applicationRepository.save(application);
  }
  
  async findAll() {
    try {
      const applications = await this.applicationRepository.find({
        where: { is_deleted: false },
        relations: ['job', 'user'],
        order: { applied_at: 'DESC' },
      });

      if (applications.length === 0) {
        return WriteResponse(404, [], 'No applications found.');
      }

      return WriteResponse(
        200,
        applications,
        'Applications retrieved successfully.',
      );
    } catch (error) {
      return WriteResponse(
        500,
        {},
        error.message || 'An unexpected error occurred.',
      );
    }
  }

  async findOne(id: string) {
    const application = await this.applicationRepository.findOne({
      where: { id, is_deleted: false },
      relations: ['job', 'user'], // Use property names of relations
    });
  
    if (!application) {
      throw new NotFoundException(`Application with ID ${id} not found.`);
    }
  
    return application;
  }
  
  async update(id: string, updateApplicationDto: UpdateApplicationDto) {
    const application = await this.findOne(id);
    Object.assign(application, updateApplicationDto);
    return await this.applicationRepository.save(application);
  }

  async remove(id: string) {
    const application = await this.findOne(id);
    application.is_deleted = true;
    return await this.applicationRepository.save(application);
  }
}
