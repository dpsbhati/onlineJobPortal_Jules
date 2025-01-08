import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { applications } from './entities/application.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { paginateResponse, WriteResponse } from 'src/shared/response';
import { IPagination } from 'src/shared/paginationEum';

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
      return WriteResponse(409, [], 'You have already applied for this job.');
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

  async paginateApplications(pagination: IPagination) {
    try {
        const { curPage = 1, perPage = 10, whereClause } = pagination;

        let lwhereClause = 'app.is_deleted = 0';

        const fieldsToSearch = [
            'status',
            'description',
            'comments',
            'additional_info',
            'work_experiences',
            'user.first_name',
            'user.last_name',
            'job.title',
        ];

        if (Array.isArray(whereClause)) {
            fieldsToSearch.forEach((field) => {
                const fieldValue = whereClause.find((p) => p.key === field)?.value;
                if (fieldValue) {
                    lwhereClause += ` AND ${field} LIKE '%${fieldValue}%'`;
                }
            });

            const allValues = whereClause.find((p) => p.key === 'all')?.value;
            if (allValues) {
                const searches = fieldsToSearch
                    .map((field) => `${field} LIKE '%${allValues}%'`)
                    .join(' OR ');
                lwhereClause += ` AND (${searches})`;
            }
        }

        const skip = (curPage - 1) * perPage;

        const [list, totalCount] = await this.applicationRepository
            .createQueryBuilder('app')
            .leftJoinAndSelect('app.job', 'job')
            .leftJoinAndSelect('app.user', 'user')
            .where(lwhereClause)
            .skip(skip)
            .take(perPage)
            .orderBy('app.created_at', 'DESC')
            .getManyAndCount();

        const enrichedApplications = list.map((application) => ({
            ...application,
        }));

        return paginateResponse(enrichedApplications, totalCount, curPage, perPage);
    } catch (error) {
        console.error('Application Pagination Error --> ', error);
        return WriteResponse(500, {}, `Something went wrong.`);
    }
}

}
