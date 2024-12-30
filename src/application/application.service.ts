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

  async applyForJob(createApplicationDto: CreateApplicationDto) {
    const { job_id, user_id } = createApplicationDto;

    const existingApplication = await this.applicationRepository.findOne({
      where: { job_id, user_id, is_deleted: false },
    });

    if (existingApplication) {
      throw new Error('You have already applied for this job.');
    }

    const application = this.applicationRepository.create({
      ...createApplicationDto,
      status: 'Pending',
    });

    return await this.applicationRepository.save(application);
  }

  async findAll() {
    return await this.applicationRepository.find({
      where: { is_deleted: false },
      relations: ['job_id', 'user_id'],
      order: { applied_at: 'DESC' },
    });
  }

  async findOne(id: string) {
    const application = await this.applicationRepository.findOne({
      where: { id, is_deleted: false },
      relations: ['job_id', 'user_id'],
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
