import { Injectable, Logger, NotFoundException } from '@nestjs/common';
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
import { Users } from 'src/user/entities/user.entity';
import { NotificationGateway } from 'src/notifications/notifications.gateway';
import { NotificationsService } from 'src/notifications/notifications.service';

@Injectable()
export class JobPostingService {
  private readonly logger = new Logger(JobPostingService.name);

  constructor(
    @InjectRepository(JobPosting)
    private jobPostingRepository: Repository<JobPosting>,
    private readonly linkedInService: LinkedInService,
    private readonly facebookService: FacebookService,
    @InjectRepository(Users)
    private userRepository: Repository<Users>,
    private readonly notificationGateway: NotificationGateway,
    private readonly notificationsService: NotificationsService,
  ) {}

  private jobs = new Map<number, { linkedIn: CronJob; facebook: CronJob }>();

  @Cron(CronExpression.EVERY_10_SECONDS) // Runs every minute
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

      // Get the date in YYYY-MM-DD format
      const date = now.getDate();
      const month = now.getMonth() + 1; // Months are zero-indexed in JavaScript, so add 1
      const year = now.getFullYear();

      const todayDate = `${year}-${month.toString().padStart(2, '0')}-${date.toString().padStart(2, '0')}`;

      const jobsToPost = await this.jobPostingRepository.find({
        where: {
          jobpost_status: JobPostStatus.DRAFT,
          is_deleted: false,
          posted_date: todayDate, // Match only today's date
          posted_at: LessThanOrEqual(totalTime),
        },
      });

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

  // @Cron('*/1 * * * *') // Runs every minute
  @Cron(CronExpression.EVERY_10_SECONDS) // Runs every minute
  async closeExpiredJobs() {
    try {
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
        for (const job of jobsToOpen) {
          job.job_opening = JobOpeningStatus.OPEN;
          await this.jobPostingRepository.save(job);
        }
      }

      const jobsToReopen = await this.jobPostingRepository.find({
        where: {
          is_deleted: false,
          job_opening: JobOpeningStatus.CLOSE,
          deadline: MoreThan(currentDateTime),
        },
      });
      for (const job of jobsToReopen) {
        job.job_opening = JobOpeningStatus.OPEN;
        job.isActive = true;
        await this.jobPostingRepository.save(job);
        this.logger.log(
          `Reopened job with ID ${job.id} due to extended deadline.`,
        );
      }

      const jobsToClose = await this.jobPostingRepository.find({
        where: {
          is_deleted: false,
          job_opening: JobOpeningStatus.OPEN,
          deadline: LessThanOrEqual(currentDateTime),
        },
      });

      if (jobsToClose.length > 0) {
        const expiredJobs = [];

        for (const job of jobsToClose) {
          job.job_opening = JobOpeningStatus.CLOSE;
          job.isActive = false;
          await this.jobPostingRepository.save(job);
          expiredJobs.push({
            id: job.id,
            title: job.rank,
            deadline: job.deadline,
          });
        }
        const adminUsers = await this.userRepository.find({
          where: { role: 'admin', isActive: true },
          select: ['id'],
        });
        const adminUserIds = adminUsers.map((admin) => admin.id);

        for (const expiredJob of expiredJobs) {
          this.notificationGateway.emitNotificationToUsers(
            adminUserIds,
            'adminNotification',
            {
              jobId: expiredJob.id,
              title: expiredJob.rank,
              message: `The job of "${expiredJob.rank}" has expired.`,
              type: 'job_expired',
            },
          );
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
      if (jobDto.job_type_post === JobTypePost.POST_NOW) {
        jobDto.jobpost_status = JobPostStatus.POSTED;
      }

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

      let lwhereClause = `f.is_deleted = false`;
      const fieldsToSearch = [
        'job_type',
        'rank',
        'vessel_type',
        'title',
        'short_description',
        'full_description',
        'country_code',
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

      // ✅ Handle isActive filter separately
      const isActiveObj = whereClause.find(
        (p: any) => p.key === 'isActive' && p.value,
      );

      if (typeof isActiveObj?.value === 'boolean') {
        lwhereClause += ` AND f.isActive = ${isActiveObj.value}`;
      }

      const skills_required = whereClause.find(
        (p: any) => p.key === 'skills_required' && p.value,
      );

      if (skills_required && Array.isArray(skills_required.value)) {
        const skillsConditions = skills_required.value.map(
          (skill) => `f.skills_required LIKE '%${skill}%'`,
        );
        if (skillsConditions.length > 0) {
          lwhereClause += ` AND (${skillsConditions.join(' OR ')})`;
        }
      }

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
        job.skills_required = JSON.parse(job.skills_required);
        if (typeof job.social_media_type === 'string') {
          job.social_media_type = JSON.parse(job.social_media_type);
        }
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

      jobPosting.skills_required = JSON.parse(jobPosting.skills_required);

      if (typeof jobPosting.social_media_type === 'string') {
        jobPosting.social_media_type = JSON.parse(jobPosting.social_media_type);
      }

      const response = {
        ...jobPosting,
        job_type_post: jobPosting.job_type_post || 'Not Specified', // Ensure job_type_post is included
      };
      delete response.user.password;
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

  async toggleJobStatus(query) {
    try {
      let { id, isActive } = query;
      isActive = isActive === 'true' ? true : false;

      if (!id) {
        return WriteResponse(400, false, 'Job posting ID is required.');
      }

      const jobPosting = await this.jobPostingRepository.findOne({
        where: { id: id, is_deleted: false },
      });

      if (!jobPosting) {
        return WriteResponse(404, {}, `Job posting with ID ${id} not found.`);
      }

      await this.jobPostingRepository.update(id, { isActive: isActive });

      return WriteResponse(
        200,
        true,
        `The job has been successfully ${isActive ? 'activated' : 'deactivated'}.`,
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

  async updateDeadline(job_id: string, deadline: Date) {
    try {
      const jobPosting = await this.jobPostingRepository.findOne({
        where: { id: job_id, is_deleted: false },
      });

      if (!jobPosting) {
        throw new NotFoundException('Job not found');
      }
      await this.jobPostingRepository.update(job_id,{deadline:deadline})

      return WriteResponse(
        200,
        true,
        'Job deadline updated successfully.',
      );
    } catch (error) {
      console.error('Error occurred while updating deadline:', error.message);
      return WriteResponse(500, {}, error.message || 'INTERNAL_SERVER_ERROR.');
    }
  }
}
