import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { Application } from './entities/application.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class ApplicationService {
  constructor(
    @InjectRepository(Application)
    private readonly applicationRepository: Repository<Application>,
  ) {}

  // Create a new application
  async create(createApplicationDto: CreateApplicationDto): Promise<Application> {
    const newApplication = this.applicationRepository.create(createApplicationDto);
    return await this.applicationRepository.save(newApplication);
  }

  // Get all applications
  async findAll(): Promise<Application[]> {
    return await this.applicationRepository.find({
      relations: ['user_id', 'job_id'], // Adjust relations based on your entity relationships
    });
  }

  // Get a single application by ID
  async findOne(id: string): Promise<Application> {
    const application = await this.applicationRepository.findOne({
      where: { id },
      relations: ['user_id', 'job_id'], // Adjust relations based on your entity relationships
    });
    if (!application) {
      throw new NotFoundException(`Application with ID ${id} not found`);
    }
    return application;
  }

  // Update an application
  async update(id: string, updateApplicationDto: UpdateApplicationDto): Promise<Application> {
    const application = await this.findOne(id);
    Object.assign(application, updateApplicationDto);
    return await this.applicationRepository.save(application);
  }

  // Soft delete an application
  async remove(id: string): Promise<void> {
    const application = await this.findOne(id);
    application.is_deleted = true;
    await this.applicationRepository.save(application);
  }
}
