import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, Not, Repository } from 'typeorm';
import { JobPosting } from './entities/job-posting.entity';
import { CreateJobPostingDto } from './dto/create-job-posting.dto';
import { UpdateJobPostingDto } from './dto/update-job-posting.dto';
import { paginateResponse, WriteResponse } from 'src/shared/response';
import { LinkedInService } from 'src/linkedin/linkedin.service';
import { FacebookService } from 'src/facebook/facebook.service';
import { CronJob } from 'cron';
import { IPagination } from 'src/shared/paginationEum';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class JobPostingService {
  private readonly logger = new Logger(JobPostingService.name)

  constructor(
    @InjectRepository(JobPosting)
    private jobPostingRepository: Repository<JobPosting>,
    private readonly linkedInService: LinkedInService,
    private readonly facebookService: FacebookService,
  ) {}

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

  @Cron(CronExpression.EVERY_MINUTE) // Runs every minute
  async autoPostJobs() {
    try {
      const now = new Date();
      const jobsToPost = await this.jobPostingRepository.find({
        where: {
          jobpost_status: 'draft',
          is_deleted: false,
          posted_at: LessThanOrEqual(now),
        },
      });

      if (jobsToPost.length > 0) {
        this.logger.log(`Found ${jobsToPost.length} jobs to post.`);

        for (const job of jobsToPost) {
          job.jobpost_status = 'posted'; 
          job.updated_at = new Date();
          await this.jobPostingRepository.save(job);
        }

        this.logger.log(`Posted ${jobsToPost.length} jobs.`);
      }
    } catch (error) {
      this.logger.error('Error in autoPostJobs scheduler', error);
    }
  }


  async createOrUpdate(jobDto: CreateJobPostingDto, userId: string) {
    try {
        console.log('Starting createOrUpdate process...');

        let jobPosting: JobPosting | null = null;

        // Check if the job ID exists for an update
        if (jobDto.id) {
            console.log(`Checking for existing job posting with ID: ${jobDto.id}`);
            jobPosting = await this.jobPostingRepository.findOne({
                where: { id: jobDto.id, is_deleted: false },
            });

            if (!jobPosting) {
                console.error(
                    `Job with ID ${jobDto.id} not found. Verify the ID or check if the record is marked as deleted.`,
                );
                return WriteResponse(
                    404,
                    {},
                    `Job with ID ${jobDto.id} not found. Verify the ID or check if the record is marked as deleted.`,
                );
            }

            console.log(`Found existing job posting with ID: ${jobDto.id}`);
        } else {
            console.log('No job ID provided. Creating a new job posting...');
        }

        // Validate `social_media_type`
        const allowedSocialMediaTypes = ['facebook', 'linkedin'];
        if (
            jobDto.social_media_type &&
            !allowedSocialMediaTypes.includes(jobDto.social_media_type)
        ) {
            console.error(
                `Invalid social_media_type: ${jobDto.social_media_type}. Allowed values are: ${allowedSocialMediaTypes.join(', ')}.`,
            );
            return WriteResponse(
                400,
                {},
                `Invalid social_media_type. Allowed values are: ${allowedSocialMediaTypes.join(', ')}.`,
            );
        }

        console.log('Preparing job posting data...');
        // Prepare job posting data
        const updatedJobPosting = this.jobPostingRepository.create({
            ...jobPosting, // Preserve existing data if updating
            ...jobDto, // Merge new data
            jobpost_status: jobDto.jobpost_status || 'draft', // Default to 'draft' if not provided
            posted_at: jobDto.posted_at || null, // Use provided posted_at or set to null
            created_by: jobPosting ? jobPosting.created_by : userId, // Preserve created_by for updates
            updated_by: userId, // Always set updated_by to current user
        });

        console.log('Saving job posting...');
        // Save the job posting
        const savedJobPosting = await this.jobPostingRepository.save(updatedJobPosting);

        console.log(
            jobPosting
                ? `Job Posting with ID ${savedJobPosting.id} updated successfully.`
                : `Job Posting with ID ${savedJobPosting.id} created successfully.`,
        );

        return WriteResponse(
            200,
            savedJobPosting,
            jobPosting
                ? 'Job Posting updated successfully.'
                : 'Job Posting created successfully.',
        );
    } catch (error) {
        console.error('Error occurred during createOrUpdate process:', error.message);
        return WriteResponse(500, {}, error.message || 'INTERNAL_SERVER_ERROR.');
    }
}


  
  

  async paginateJobPostings(pagination: IPagination) {
    try {
        const { curPage = 1, perPage = 10, whereClause } = pagination;

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
        const [list, totalCount] = await this.jobPostingRepository
            .createQueryBuilder('job')
            .where(lwhereClause)
            .skip(skip)
            .take(perPage)
            .orderBy('job.created_at', 'DESC')
            .getManyAndCount();

        const enrichedJobList = await Promise.all(
            list.map(async (job) => {
                const enrichedJob = {
                    ...job,
                };
                return enrichedJob;
            }),
        );

        return paginateResponse(enrichedJobList, totalCount, curPage, perPage);
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
        return WriteResponse(
          200,
          jobPostings,
          'Job postings retrieved successfully.',
        );
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

  async postScheduledJob(jobId: string, userId: string) {
    try {
      const jobPosting = await this.jobPostingRepository.findOne({
        where: { id: jobId, is_deleted: false, jobpost_status: 'draft' },
      });
  
      if (!jobPosting) {
        return WriteResponse(
          404,
          {},
          `Job with ID ${jobId} not found or is not in draft status.`,
        );
      }
  
      jobPosting.jobpost_status = 'posted';
      jobPosting.updated_by = userId; 
  
      const updatedJobPosting = await this.jobPostingRepository.save(jobPosting);
  
      return WriteResponse(
        200,
        updatedJobPosting,
        'Job Posting successfully published.',
      );
    } catch (error) {
      return WriteResponse(500, {}, error.message || 'INTERNAL_SERVER_ERROR.');
    }
  }
  
  
}
