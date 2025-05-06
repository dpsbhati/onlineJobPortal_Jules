import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, MoreThan, Not, Repository } from 'typeorm';
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
  private readonly logger = new Logger(JobPostingService.name);

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

  @Cron('*/1 * * * *') // Runs every minute
  async closeExpiredJobs() {
    try {
      console.log('Running job scheduler to close expired jobs...');

      const currentDateTime = new Date();

      // New functionality: Check for jobs in 'hold' or with today's date as date_published
      const jobsToOpen = await this.jobPostingRepository.find({
        where: {
          is_deleted: false,
          job_opening: 'hold',
          date_published: LessThanOrEqual(currentDateTime),
        },
      });

      if (jobsToOpen.length > 0) {
        console.log(
          `Found ${jobsToOpen.length} jobs to change from 'hold' to 'open'.`,
        );
        for (const job of jobsToOpen) {
          job.job_opening = 'open';
          await this.jobPostingRepository.save(job);
          console.log(`Job with ID ${job.id} marked as "open".`);
        }
      }

      const jobsToClose = await this.jobPostingRepository.find({
        where: {
          is_deleted: false,
          job_opening: 'open',
          deadline: LessThanOrEqual(currentDateTime),
        },
      });

      if (jobsToClose.length > 0) {
        console.log(`Found ${jobsToClose.length} jobs with expired deadlines.`);

        for (const job of jobsToClose) {
          job.job_opening = 'close';
          await this.jobPostingRepository.save(job);
          console.log(`Job with ID ${job.id} marked as "close".`);
        }
      }
    } catch (error) {
      console.error(
        'Error occurred while updating expired jobs:',
        error.message,
      );
    }
  }

  async createOrUpdate(jobDto: CreateJobPostingDto, userId: string) {
    try {
      // Fetch existing job posting (if updating)
      const jobPosting = jobDto.id
        ? await this.jobPostingRepository.findOne({
            where: { id: jobDto.id, is_deleted: false },
          })
        : null;

      // Preserve existing job_opening status if the job is being updated
      let job_opening = jobPosting ? jobPosting.job_opening : 'hold';

      if (!jobPosting && jobDto.date_published && jobDto.deadline) {
        const now = new Date();
        const datePublished = new Date(jobDto.date_published);
        const deadline = new Date(jobDto.deadline);

        if (now >= datePublished && now <= deadline) {
          job_opening = 'open';
        } else if (now > deadline) {
          job_opening = 'close';
        }
      }

      if (Array.isArray(jobDto.social_media_type)) {
        jobDto.social_media_type = JSON.stringify(jobDto.social_media_type);
      }

      // Create or update job posting
      const updatedJobPosting = this.jobPostingRepository.create({
        ...jobPosting,
        ...jobDto,
        job_type_post: jobDto.job_type_post, // Ensure job_type_post is passed
        job_opening,
        application_instruction: jobDto.application_instruction,
        employee_experience: jobDto.employee_experience,
        created_by: jobPosting ? jobPosting.created_by : userId,
        updated_by: userId,
      });

      // Save the job posting
      const savedJobPosting =
        await this.jobPostingRepository.save(updatedJobPosting);

      console.log(
        jobPosting
          ? `Updated Job Posting with ID: ${savedJobPosting.id}`
          : `Created Job Posting with ID: ${savedJobPosting.id}`,
      );

      return WriteResponse(
        200,
        savedJobPosting,
        jobPosting
          ? 'Job Posting updated successfully.'
          : 'Job Posting created successfully.',
      );
    } catch (error) {
      console.error(
        'Error occurred during createOrUpdate process:',
        error.message,
      );
      return WriteResponse(500, {}, error.message || 'INTERNAL_SERVER_ERROR.');
    }
  }

  async paginateJobPostings(req, pagination: IPagination) {
    let { curPage, perPage, direction, whereClause, sortBy } = pagination;
    let skip = (curPage - 1) * perPage;

    // Set default sorting if not provided
    sortBy = 'created_at';
    direction = direction || 'DESC'; // Default to DESC

    let lwhereClause = `f.isActive = true AND f.is_deleted = false`;
    const fieldsToSearch = [
      'job_type',
      'qualifications',
      'skills_required',
      'title',
      'short_description',
      'full_description',
      'assignment_duration',
      'employer',
      'rank',
      'required_experience',
      'salary',
      'address',
      'work_type',
      'application_instruction',
      'employee_experience',
      'job_type_post',
      'jobpost_status',
      'job_opening',
    ];

    // Apply dynamic filters for each field in fieldsToSearch
    fieldsToSearch.forEach((field) => {
      const fieldValues = whereClause
        .filter((p) => p.key === field)
        .map((p) => p.value);
      if (fieldValues.length > 0) {
        const conditions = fieldValues
          .map((value) => `f.${field} LIKE '%${value}%'`)
          .join(' OR ');
        lwhereClause += ` AND (${conditions})`;
      }
    });

    // Handle start and end date range filtering dynamically
    const startDateObj = whereClause.find(
      (p: any) => p.key === 'startDate' && p.value,
    );
    const endDateObj = whereClause.find(
      (p: any) => p.key === 'endDate' && p.value,
    );
    const startDate = startDateObj?.value;
    const endDate = endDateObj?.value;

    if (startDate && endDate) {
      lwhereClause += ` AND DATE(f.date_published) BETWEEN '${startDate}' AND '${endDate}'`;
    } else if (startDate) {
      lwhereClause += ` AND DATE(f.date_published) >= '${startDate}'`;
    } else if (endDate) {
      lwhereClause += ` AND DATE(f.date_published) <= '${endDate}'`;
    }

    // Handle dynamic search across all fields
    const allValue = whereClause.find((p) => p.key === 'all')?.value;
    if (allValue) {
      const conditions = fieldsToSearch
        .map((field) => `f.${field} LIKE '%${allValue}%'`)
        .join(' OR ');
      lwhereClause += ` AND (${conditions})`;
    }

    const queryBuilder = await this.jobPostingRepository
      .createQueryBuilder('f')
      .leftJoin(
        (qb) =>
          qb
            .select('a.job_id', 'job_id')
            .addSelect('COUNT(a.id)', 'application_number')
            .from('applications', 'a')
            .groupBy('a.job_id'),
        'app_counts',
        'app_counts.job_id = f.id',
      )
      .addSelect(
        'COALESCE(app_counts.application_number, 0)',
        'application_number',
      ) // select applicant count
      .where(lwhereClause)
      .orderBy(`f.${sortBy}`, direction.toUpperCase() as 'ASC' | 'DESC')
      .skip(skip)
      .take(perPage);

    const [entities, raw] = await Promise.all([
      queryBuilder.getMany(), // actual job posting records (entity)
      queryBuilder.getRawMany(), // raw rows with applicant_number
    ]);

    // Map applicant_number back into the entity list
    const finalData = entities.map((job, index) => {
      const rawItem = raw.find((r) => r.f_id === job.id);
      return {
        ...job,
        application_number: parseInt(rawItem?.application_number || '0'),
      };
    });

    // Count query separately
    const totalCount = await this.jobPostingRepository
      .createQueryBuilder('f')
      .where(lwhereClause)
      .getCount();

    // Return paginated data
    return paginateResponse(finalData, totalCount);
  }

  async findAll() {
    try {
      const jobPostings = await this.jobPostingRepository.find({
        where: { is_deleted: false },
        order: { created_at: 'DESC' },
      });

      if (jobPostings.length > 0) {
        const enrichedJobPostings = jobPostings.map((job) => ({
          ...job,
          job_type_post: job.job_type_post || 'Not Specified',
        }));

        return WriteResponse(
          200,
          enrichedJobPostings,
          'Job postings retrieved successfully.',
        );
      }

      return WriteResponse(404, [], 'No job postings found.');
    } catch (error) {
      console.error('Error fetching job postings:', error.message);
      return WriteResponse(500, {}, 'An unexpected error occurred.');
    }
  }

  async findOne(key: string, value: string) {
    try {
      const jobPosting = await this.jobPostingRepository.findOne({
        where: { [key]: value, is_deleted: false },
        relations: ['user'], // Automatically load the related user entity
      });

      if (!jobPosting) {
        return WriteResponse(404, {}, `Job posting not found.`);
      }

      const response = {
        ...jobPosting,
        job_type_post: jobPosting.job_type_post || 'Not Specified', // Ensure job_type_post is included
      };

      return WriteResponse(
        200,
        response,
        'Job posting retrieved successfully.',
      );
    } catch (error) {
      console.error('Error fetching job posting:', error.message);
      return WriteResponse(500, {}, 'An unexpected error occurred.');
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
      const jobPosting = await this.jobPostingRepository.findOne({
        where: { id, is_deleted: false },
      });

      if (!jobPosting) {
        return WriteResponse(404, {}, `Job posting with ID ${id} not found.`);
      }

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

      const updatedJobPosting =
        await this.jobPostingRepository.save(jobPosting);

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
