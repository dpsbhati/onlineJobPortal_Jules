import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Equal, LessThanOrEqual, MoreThan, Not, Repository } from 'typeorm';
import {
  JobOpeningStatus,
  JobPosting,
  JobPostStatus,
  JobTypePost,
} from './entities/job-posting.entity';
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

  @Cron(CronExpression.EVERY_10_SECONDS) // Runs every minute
  //   async autoPostJobs() {
  //     try {
  //       const now = new Date();
  //       // Get "today" as per local time (e.g., IST)
  //       // Create IST midnight today
  //       // const now = new Date();
  //       const IST_OFFSET = 5.5 * 60 * 60 * 1000; // IST is UTC +5:30
  //       console.log('IST_OFFSET----->>', IST_OFFSET);

  //       const istNow = new Date(now.getTime() - IST_OFFSET);
  //       const oneHourMs = 60 * 60 * 1000;
  //       const currentTime = new Date(istNow.getTime() - oneHourMs);
  //       // const current24=currentTime.toLocaleDateString('en-US', { hour12: false })
  //       // console.log('current24----->>', current24);
  //       // const currentTime = new Date(istNow.getTime() - oneHourMs);

  // // Extract time (HH:mm:ss) from currentTime
  // const hours = currentTime.getUTCHours().toString().padStart(2, '0');   // 24-hour format (00-23)
  // const minutes = currentTime.getUTCMinutes().toString().padStart(2, '0'); // (00-59)
  // // const seconds = currentTime.getUTCSeconds().toString().padStart(2, '0'); // (00-59)

  // const timeOnly = `${hours}:${minutes}`;

  // console.log('Extracted time:', timeOnly); // Example: "07:10:30"

  // const current24Hours=now.getHours()
  // const current24Minutes=now.getMinutes()

  // const totalTime=`${current24Hours}:${current24Minutes}`

  // console.log('current24----->>',totalTime);

  //       // Get YYYY-MM-DD from IST
  //       const istYear = istNow.getUTCFullYear();
  //       const istMonth = istNow.getUTCMonth();
  //       const istDate = istNow.getUTCDate();

  //       // Create a new UTC date from IST's Y/M/D at midnight
  //       const todayIST = new Date(Date.UTC(istYear, istMonth, istDate));
  //       // Format to YYYY-MM-DD string
  // const istDateString = `${istYear}-${(istMonth + 1).toString().padStart(2, '0')}-${istDate
  //   .toString()
  //   .padStart(2, '0')}`;

  // console.log('istDateString ---->>', istDateString);

  //       console.log(
  //         'todayIST----->>',
  //         todayIST,
  //         ' currentTime----->>',
  //         currentTime,
  //       );

  //       const jobsToPost = await this.jobPostingRepository.find({
  //         where: {
  //           jobpost_status: JobPostStatus.DRAFT,
  //           is_deleted: false,
  //           posted_date: istDateString, // Match only today's date
  //           posted_at: LessThanOrEqual(totalTime),
  //         },
  //       });
  //       console.log('jobsToPost----->>', jobsToPost);

  //       if (jobsToPost.length > 0) {
  //         this.logger.log(`Found ${jobsToPost.length} jobs to post.`);

  //         for (const job of jobsToPost) {
  //           job.jobpost_status = JobPostStatus.POSTED;
  //           job.updated_at = new Date();
  //           await this.jobPostingRepository.save(job);
  //         }

  //         this.logger.log(`Posted ${jobsToPost.length} jobs.`);
  //       }
  //     } catch (error) {
  //       this.logger.error('Error in autoPostJobs scheduler', error);
  //     }
  //   }
  async autoPostJobs() {
    try {
      const now = new Date();

      // Get hours and minutes
      let current24Hours = now.getHours();
      let current24Minutes = now.getMinutes();

      // Ensure two-digit format for hours and minutes
      const formattedHours = current24Hours.toString().padStart(2, '0');
      const formattedMinutes = current24Minutes.toString().padStart(2, '0');

      // Concatenate hours and minutes in 24-hour format
      const totalTime = `${formattedHours}:${formattedMinutes}`;

      // console.log('current24----->>', totalTime);  // Example output: "09:05"

      // Get the date in YYYY-MM-DD format
      const date = now.getDate();
      const month = now.getMonth() + 1; // Months are zero-indexed in JavaScript, so add 1
      const year = now.getFullYear();

      const todayDate = `${year}-${month.toString().padStart(2, '0')}-${date.toString().padStart(2, '0')}`;

      // console.log('todayDate----->>', todayDate);  // Example output: "2025-05-09"

      const jobsToPost = await this.jobPostingRepository.find({
        where: {
          jobpost_status: JobPostStatus.DRAFT,
          is_deleted: false,
          posted_date: todayDate, // Match only today's date
          posted_at: LessThanOrEqual(totalTime),
        },
      });

      // console.log('jobsToPost----->>', jobsToPost);

      if (jobsToPost.length > 0) {
        this.logger.log(`Found ${jobsToPost.length} jobs to post.`);

        for (const job of jobsToPost) {
          job.jobpost_status = JobPostStatus.POSTED;
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
      // console.log('Running job scheduler to close expired jobs...');

      const currentDateTime = new Date();

      // New functionality: Check for jobs in 'hold' or with today's date as date_published
      const jobsToOpen = await this.jobPostingRepository.find({
        where: {
          is_deleted: false,
          job_opening: JobOpeningStatus.HOLD,
          date_published: LessThanOrEqual(currentDateTime),
        },
      });

      if (jobsToOpen.length > 0) {
        // console.log(
        //   `Found ${jobsToOpen.length} jobs to change from 'hold' to 'open'.`,
        // );
        for (const job of jobsToOpen) {
          job.job_opening = JobOpeningStatus.OPEN;
          await this.jobPostingRepository.save(job);
          // console.log(`Job with ID ${job.id} marked as "open".`);
        }
      }

      const jobsToClose = await this.jobPostingRepository.find({
        where: {
          is_deleted: false,
          job_opening: JobOpeningStatus.OPEN,
          deadline: LessThanOrEqual(currentDateTime),
        },
      });
      // console.log('jobsToClose----->>', jobsToClose);

      if (jobsToClose.length > 0) {
        // console.log(`Found ${jobsToClose.length} jobs with expired deadlines.`);

        for (const job of jobsToClose) {
          job.job_opening = JobOpeningStatus.CLOSE;
          await this.jobPostingRepository.save(job);
          // console.log(`Job with ID ${job.id} marked as "close".`);
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
      console.log(
        'jobDto.job_type_post----------------------------------->>',
        jobDto.job_type_post,
      );

      if (jobDto.job_type_post === JobTypePost.POST_NOW) {
        jobDto.jobpost_status = JobPostStatus.POSTED;
        console.log(
          'jobDto.jobpost_status----------------------------------->>',
          jobDto.jobpost_status,
        );
      }
      console.log(
        'jobDto.jobpost_status----------------------------------->>',
        jobDto.jobpost_status,
      );

      // Fetch existing job posting (if updating)
      const jobPosting = jobDto.id
        ? await this.jobPostingRepository.findOne({
            where: { id: jobDto.id, is_deleted: false },
          })
        : null;

      // Preserve existing job_opening status if the job is being updated
      let job_opening = jobPosting
        ? jobPosting.job_opening
        : JobOpeningStatus.HOLD;

      if (!jobPosting && jobDto.date_published && jobDto.deadline) {
        const now = new Date();
        const datePublished = new Date(jobDto.date_published);
        const deadline = new Date(jobDto.deadline);

        if (now >= datePublished && now <= deadline) {
          job_opening = JobOpeningStatus.OPEN;
        } else if (now > deadline) {
          job_opening = JobOpeningStatus.CLOSE;
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
    try {
      let { curPage, perPage, direction, whereClause, sortBy } = pagination;
      let skip = (curPage - 1) * perPage;

      // Set default sorting if not provided
      sortBy = sortBy || 'created_at'; // Default sorting by created_at
      direction = direction || 'DESC'; // Default to DESC

      let lwhereClause = `f.isActive = true AND f.is_deleted = false`;
      const fieldsToSearch = [
        'job_type',
        'rank',
        'skills_required',
        'title',
        'short_description',
        'full_description',

        'employer',

        'salary',
        'start_salary',
        'end_salary',
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

      // Handle dynamic salary filtering based on salary range (start_salary, end_salary)
      const startSalaryObj = whereClause.find(
        (p: any) => p.key === 'start_salary' && p.value,
      );
      const endSalaryObj = whereClause.find(
        (p: any) => p.key === 'end_salary' && p.value,
      );
      const startSalary = startSalaryObj?.value;
      const endSalary = endSalaryObj?.value;

      if (startSalary && endSalary) {
        lwhereClause += ` AND f.salary BETWEEN ${startSalary} AND ${endSalary}`;
      } else if (startSalary) {
        lwhereClause += ` AND f.salary >= ${startSalary}`;
      } else if (endSalary) {
        lwhereClause += ` AND f.salary <= ${endSalary}`;
      }

      // Handle dynamic search across all fields, including salary
      const allValue = whereClause.find((p) => p.key === 'all')?.value;
      console.log('allValue: ', allValue);

      // if (allValue) {
      //   const conditions = fieldsToSearch
      //     .map((field) => {
      //       console.log('Checking field: ', field);

      //       // Special handling for numeric fields (salary, start_salary, end_salary)
      //       if (
      //         field === 'salary' ||
      //         field === 'start_salary' ||
      //         field === 'end_salary'
      //       ) {
      //         // Check if allValue is numeric
      //         if (!isNaN(Number(allValue))) {
      //           return `f.${field} = ${allValue}`; // Exact match for numbers
      //         } else {
      //           return `f.${field} LIKE '%${allValue}%'`; // Fallback for non-numeric search
      //         }
      //       } else {
      //         // Default for string fields
      //         return `f.${field} LIKE '%${allValue}%'`;
      //       }
      //     })
      //     .join(' OR ');
      //   lwhereClause += ` AND (${conditions})`;
      // }

      if (allValue) {
        const conditions = fieldsToSearch
          .map((field) => {
            const matchPattern = `${allValue}%`; // start-to-end match
            const matchPatterns = `%${allValue}%`; // start-to-end match
            if (
              field === 'salary' ||
              field === 'start_salary' ||
              field === 'end_salary'
            ) {
              return `CAST(f.${field} AS CHAR) LIKE '${matchPattern}'`;
            } else {
              return `f.${field} LIKE '${matchPatterns}'`;
            }
          })
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
        )
        .where(lwhereClause)
        .orderBy(`f.${sortBy}`, direction.toUpperCase() as 'ASC' | 'DESC')
        .skip(skip)
        .take(perPage);

      const [entities, raw] = await Promise.all([
        queryBuilder.getMany(),
        queryBuilder.getRawMany(),
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
    } catch (error) {
      console.error('Error fetching job postings:', error);
      return WriteResponse(500, {}, 'something went wrong');
    }
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
        where: {
          id: jobId,
          is_deleted: false,
          jobpost_status: JobPostStatus.DRAFT,
        },
      });

      if (!jobPosting) {
        return WriteResponse(
          404,
          {},
          `Job with ID ${jobId} not found or is not in draft status.`,
        );
      }

      jobPosting.jobpost_status = JobPostStatus.POSTED;
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
