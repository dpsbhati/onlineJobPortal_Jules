import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { JobPosting } from './entities/job-posting.entity';
import { CreateJobPostingDto } from './dto/create-job-posting.dto';
import { UpdateJobPostingDto } from './dto/update-job-posting.dto';
import { paginateResponse, WriteResponse } from 'src/shared/response';
import { LinkedInService } from 'src/linkedin/linkedin.service';
import { FacebookService } from 'src/facebook/facebook.service';
import { CronJob } from 'cron';
import { IPagination } from 'src/shared/paginationEum';

@Injectable()
export class JobPostingService {
  constructor(
    @InjectRepository(JobPosting)
    private jobPostingRepository: Repository<JobPosting>,
    private readonly linkedInService: LinkedInService,
    private readonly facebookService: FacebookService,
  ) { }

  private jobs = new Map<number, { linkedIn: CronJob; facebook: CronJob }>();

  // async create(createJobPostingDto: CreateJobPostingDto): Promise<JobPosting> {
  //   const jobPosting = this.jobPostingRepository.create(createJobPostingDto);
  //   return await this.jobPostingRepository.save(jobPosting);
  // }

  // async createOrUpdate(createJobPostingDto: CreateJobPostingDto) {
  //   try {
  //     const { id, ...jobDetails } = createJobPostingDto;

  //     // UPDATE
  //     if (createJobPostingDto.id) {
  //       const jobPosting = await this.jobPostingRepository.findOne({
  //         where: { id: createJobPostingDto.id, is_deleted: false }
  //       });

  //       if (!jobPosting) return WriteResponse(404, false, 'Job posting not found');

  //       await this.jobPostingRepository.update(createJobPostingDto.id, createJobPostingDto);

  //       const updatedJobPosting = await this.jobPostingRepository.findOne({ where: { id: createJobPostingDto.id } });

  //       return WriteResponse(200, updatedJobPosting, 'Job posting updated successfully');
  //     }

  //     // CREATE

  //     const newJobPosting = this.jobPostingRepository.create({ is_deleted: false, ...createJobPostingDto });
  //     await this.jobPostingRepository.save(newJobPosting);
  //     const jobPostById = await this.jobPostingRepository.findOne({ where: { id: createJobPostingDto.id } });
  //     return WriteResponse(200, jobPostById, 'Job posting created successfully');
  //   } catch (error) {
  //     console.error('Error in createOrUpdate job posting:', error);
  //     return WriteResponse(500, false, 'Failed to create or update job posting');
  //   }
  // }

  async createOrUpdate(jobDto: CreateJobPostingDto, userId: string) {
    try {
      // Check if the job posting exists
      const jobPosting = jobDto.id
        ? await this.jobPostingRepository.findOne({
          where: { id: jobDto.id, is_deleted: false },
        })
        : null;

      if (jobDto.id && !jobPosting) {
        return WriteResponse(404, {}, `Job with ID ${jobDto.id} not found.`);
      }

      // Check for duplicate title
      const duplicateCheck = await this.jobPostingRepository.findOne({
        where: {
          title: jobDto.title,
          is_deleted: false,
          ...(jobDto.id ? { id: Not(jobDto.id) } : {}),
        },
      });

      if (duplicateCheck) {
        return WriteResponse(
          409,
          {},
          `Job posting with title "${jobDto.title}" already exists.`,
        );
      }

      // Prepare job posting data
      const updatedJobPosting = this.jobPostingRepository.create({
        ...jobPosting, // Existing job data (if updating)
        ...jobDto, // New data from DTO
        created_by: jobPosting ? jobPosting.created_by : userId, // Preserve `created_by` if updating
        updated_by: userId, // Always set `updated_by` to the current user
      });

      // Save the job posting
      const savedJobPosting = await this.jobPostingRepository.save(updatedJobPosting);

      return WriteResponse(
        200,
        savedJobPosting,
        jobPosting
          ? 'Job Posting updated successfully.'
          : 'Job Posting created successfully.',
      );
    } catch (error) {
      return WriteResponse(500, {}, error.message || 'INTERNAL_SERVER_ERROR.');
    }
  }


  async paginateJobPostings(pagination: IPagination) {
    try {
      const { curPage, perPage, whereClause } = pagination;

      // Default whereClause to filter out deleted job postings
      let lwhereClause = 'job.is_deleted = 0';

      // Fields to search
      const fieldsToSearch = [
        'title',
        'short_description',
        'full_description',
        'employer',
        'job_type',
        'work_type',
        'qualifications',
        'skills_required',
        'date_published',
        'deadline',
        'assignment_duration',
        'rank',
        'required_experience',
        'start_salary',
        'end_salary',
        'salary',
        'country_code',
        'state_code',
        'city',
        'address',
        'isActive',
      ];

      // Process whereClause
      if (Array.isArray(whereClause)) {
        fieldsToSearch.forEach((field) => {
          const fieldValue = whereClause.find((p) => p.key === field)?.value;
          if (fieldValue) {
            lwhereClause += ` AND job.${field} LIKE '%${fieldValue}%'`;
          }
        });

        const allValues = whereClause.find((p) => p.key === 'all')?.value;
        if (allValues) {
          const searches = fieldsToSearch
            .map((ser) => `job.${ser} LIKE '%${allValues}%'`)
            .join(' OR ');
          lwhereClause += ` AND (${searches})`;
        }
      }

      const skip = (curPage - 1) * perPage;

      // Fetch paginated data with user details
      const [list, count] = await this.jobPostingRepository
        .createQueryBuilder('job')
        .where(lwhereClause)
        .skip(skip)
        .take(perPage)
        .orderBy('job.created_at', 'DESC')
        .getManyAndCount();
      // 
      const enrichedJobList = await Promise.all(
        list.map(async (job) => {
          const enrichedJob = {
            ...job,
          };
          return enrichedJob;
        }),
      );

      return paginateResponse(enrichedJobList, count, curPage,);
    } catch (error) {
      console.error('Job Postings Pagination Error --> ', error);
      return WriteResponse(500, error, `Something went wrong.`);
    }
  }





  async findAll() {
    try {
      const jobPostings = await this.jobPostingRepository.find({
        where: { is_deleted: false },
        order: { created_at: 'DESC' },
      });

      if (jobPostings.length > 0) {
        return WriteResponse(200, jobPostings, 'Job postings retrieved successfully.');
      }

      return WriteResponse(404, [], 'No job postings found.');
    } catch (error) {
      return WriteResponse(
        500,
        {},
        error.message || 'An unexpected error occurred.',
      );
    }
  }



  // async findOne(id: string): Promise<any> {
  //   try {
  //     const stage = await this.jobPostingRepository.findOne({
  //       where: {
  //         id: id,
  //         is_deleted: false,
  //       }
  //     });
  //     return stage
  //       ? WriteResponse(200, stage, `Job Posting Found successfully`)
  //       : WriteResponse(404, null, `Job Posting not found`)
  //   }
  //   catch (error) {
  //     return WriteResponse(500, error, `Something went wrong.`);
  //   }
  // }

  async findOne(key: string, value: string) {
    try {
      const jobPosting = await this.jobPostingRepository.findOne({
        where: { [key]: value, is_deleted: false },
      });
      if (!jobPosting) {
        return WriteResponse(404, {}, `Job posting  not found.`);
      }
      return WriteResponse(
        200,
        jobPosting,
        'Job posting retrieved successfully.',
      );
    } catch (error) {
      return WriteResponse(
        500,
        {},
        error.message || 'An unexpected error occurred.',
      );
    }
  }

  async remove(id: string) {
    if (!id) {
      return WriteResponse(400, false, 'Job posting ID is required.');
    }

    const result = await this.jobPostingRepository.update(id, {
      is_deleted: true,
    });

    return WriteResponse(200, true, 'Job posting deleted successfully.');
  }

  async toggleJobStatus(id: string, isActive: boolean) {
    try {
      // Ensure the job posting exists
      const jobPosting = await this.jobPostingRepository.findOne({
        where: { id, is_deleted: false },
      });

      if (!jobPosting) {
        return WriteResponse(404, {}, `Job posting with ID ${id} not found.`);
      }

      // Update the status of the job posting
      jobPosting.isActive = isActive;
      await this.jobPostingRepository.save(jobPosting);

      return WriteResponse(
        200,
        jobPosting,
        `Job posting has been ${isActive ? 'activated' : 'deactivated'} successfully.`,
      );
    } catch (error) {
      return WriteResponse(
        500,
        {},
        error.message || 'An unexpected error occurred.',
      );
    }
  }

}
