import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Brackets,
  Equal,
  LessThanOrEqual,
  MoreThan,
  Not,
  Repository,
} from 'typeorm';
import {
  JobOpeningStatus,
  JobPosting,
  JobPostStatus,
  JobTypePost,
} from './entities/job-posting.entity';
import {
  Changejobstatus,
  CreateJobPostingDto,
  UpdateDeadlineDto,
} from './dto/create-job-posting.dto';
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

      console.log('now date----->>>', now);

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

      const allDraftJobs = await this.jobPostingRepository.find({
        where: {
          jobpost_status: JobPostStatus.DRAFT,
          is_deleted: false,
          // posted_date: todayDate, // Match only today's date
          // posted_at: LessThanOrEqual(totalTime),
        },
      });
      // console.log('allDraftJobs', allDraftJobs);

      const jobsToPost = allDraftJobs.filter((job) => {
        if (job.posted_date && job.posted_at) {
          const scheduledDateTime = new Date(
            `${job.posted_date}T${job.posted_at}`,
          );
          return scheduledDateTime <= now;
          // console.log("isExpired",isExpired);
        }
        return false;
      });

      if (jobsToPost.length > 0) {
        this.logger.log(`Found ${jobsToPost.length} jobs to post.`);

        for (const job of jobsToPost) {
          job.jobpost_status = JobPostStatus.POSTED;
          job.job_opening = JobOpeningStatus.OPEN;
          job.isActive = true;
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
      console.log('currentDateTime---------->', currentDateTime);
      const todayDate = currentDateTime.toISOString().slice(0, 10); // "2025-06-02"
      console.log('todayDate---------->', todayDate);

      // New functionality: Check for jobs in 'hold' or with today's date as date_published
      const allHoldJobs = await this.jobPostingRepository.find({
        where: {
          is_deleted: false,
          job_opening: JobOpeningStatus.HOLD,
          // posted_at: LessThanOrEqual(currentDateTime),
        },
      });
      // console.log("allHoldJobs",allHoldJobs);

      const jobsToOpen = allHoldJobs.filter((job) => {
        if (job.posted_date && job.posted_at) {
          const scheduledDateTime = new Date(
            `${job.posted_date}T${job.posted_at}`,
          );
          return scheduledDateTime <= currentDateTime;
          // console.log("isExpired",isExpired);
        }
        return false;
      });

      if (jobsToOpen.length > 0) {
        for (const job of jobsToOpen) {
          job.job_opening = JobOpeningStatus.OPEN;
          await this.jobPostingRepository.save(job);
        }
      }

      // const jobsToReopen = await this.jobPostingRepository.find({
      //   where: {
      //     is_deleted: false,
      //     job_opening: JobOpeningStatus.CLOSE,
      //     deadline: MoreThan(currentDateTime),
      //   },
      // });
      // for (const job of jobsToReopen) {
      //   job.job_opening = JobOpeningStatus.OPEN;
      //   job.isActive = true;
      //   await this.jobPostingRepository.save(job);
      //   this.logger.log(
      //     `Reopened job with ID ${job.id} due to extended deadline.`,
      //   );
      // }
      const now = new Date();

      // Step 1: Find all CLOSED jobs (with deadlines)
      const jobsToReopen = await this.jobPostingRepository.find({
        where: {
          is_deleted: false,
          job_opening: JobOpeningStatus.CLOSE,
        },
      });

      for (const job of jobsToReopen) {
        if (job.deadline) {
          const deadline = new Date(job.deadline);
          const expirationTime = new Date(deadline);
          expirationTime.setDate(deadline.getDate() + 1); // Deadline + 1 day
          expirationTime.setHours(0, 0, 0, 0); // Set to 12:00 AM

          // If current time is before expiration time, reopen the job
          if (now < expirationTime) {
            job.job_opening = JobOpeningStatus.OPEN;
            job.isActive = true;

            await this.jobPostingRepository.save(job);

            this.logger.log(
              `Reopened job with ID ${job.id} due to extended deadline.`,
            );
          }
        }
      }

      const jobsToClose = await this.jobPostingRepository
        .createQueryBuilder('job')
        .leftJoinAndSelect('job.ranks', 'ranks')
        .where('job.is_deleted = false')
        .andWhere('job.job_opening = :open', { open: JobOpeningStatus.OPEN })
        // Close jobs jinki deadline date current date se chhoti ho
        .andWhere('DATE(job.deadline) < CURDATE()')
        .getMany();
      // const now = new Date();
      // Filter jobs where deadline + 1 day <= now (i.e., job is overdue)
      const expiredJobs = jobsToClose.filter((job) => {
        if (job.deadline) {
          const newdeadline = new Date(job.deadline);
          const expirationTime = new Date(newdeadline);
          expirationTime.setDate(newdeadline.getDate() + 1); // Add 1 day
          expirationTime.setHours(0, 0, 0, 0); // Set to 12:00 AM next day

          return now >= expirationTime;
        }
        return false;
      });

      if (jobsToClose.length > 0) {
        const expiredJobs = [];

        for (const job of jobsToClose) {
          job.job_opening = JobOpeningStatus.CLOSE;
          job.isActive = false;
          await this.jobPostingRepository.save(job);
          expiredJobs.push({
            id: job.id,
            title: job.ranks.rank_name,
            deadline: job.deadline,
          });
        }
        const adminUsers = await this.userRepository.find({
          where: { role: 'admin', isActive: true, is_deleted: false },
          select: ['id'],
        });
        const adminUserIds = adminUsers.map((admin) => admin.id);

        for (const expiredJob of expiredJobs) {
          this.notificationGateway.emitNotificationToUsers(
            adminUserIds,
            'adminNotification',
            {
              title: 'Job Expired',
              message: `The job of "${expiredJob.title}" has expired.`,
              type: 'job_expired',
            },
          );
          await Promise.all(
            adminUserIds.map((adminId) =>
              this.notificationsService.create({
                user_id: adminId,
                application_id: null,
                job_id: expiredJob.id,
                subject: 'Job Expired',
                type: 'job_expired',
                content: `The job of "${expiredJob.title}" has expired.`,
              }),
            ),
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
      if (jobDto.job_type_post === JobTypePost.SCHEDULE_LATER) {
        jobDto.jobpost_status = JobPostStatus.DRAFT;
        jobDto.job_opening = JobOpeningStatus.HOLD;
        jobDto.isActive = false;

        if (jobDto.posted_date) {
          const scheduledDate = new Date(jobDto.posted_date);
          const deadlineDate = new Date(jobDto.deadline);

          // Compare only dates (year, month, day), ignoring time
          const scheduledDateOnly = scheduledDate.toISOString().split('T')[0];
          const deadlineDateOnly = deadlineDate.toISOString().split('T')[0];

          if (deadlineDateOnly < scheduledDateOnly) {
            return WriteResponse(
              400,
              false,
              'Deadline must be greater than the posted date.',
            );
          }
        }
      }

      // if (jobDto.deadline) {
      //   const deadlineDate = new Date(jobDto.deadline);

      //   // Set time to 23:59:59.999 UTC
      //   deadlineDate.setUTCHours(23, 59, 59, 999);

      //   // Assign back as Date object
      //   jobDto.deadline = deadlineDate;
      // }

      // Combine posted_date and posted_at to Date object
      let scheduledDateTime: Date | null = null;
      if (jobDto.posted_date && jobDto.posted_at) {
        scheduledDateTime = new Date(
          `${jobDto.posted_date}T${jobDto.posted_at}:00`,
        );
      }

      const now = new Date();

      // If scheduled datetime is in the future, set draft and inactive
      if (scheduledDateTime && scheduledDateTime > now) {
        jobDto.job_type_post = JobTypePost.SCHEDULE_LATER;
        jobDto.jobpost_status = JobPostStatus.DRAFT;
        jobDto.job_opening = JobOpeningStatus.HOLD;
        jobDto.isActive = false;
      } else {
        // Else, if no scheduled datetime or datetime passed, mark posted and active
        jobDto.job_type_post = JobTypePost.POST_NOW;
        jobDto.jobpost_status = JobPostStatus.POSTED;
        jobDto.job_opening = JobOpeningStatus.OPEN;
        jobDto.isActive = true;
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
        : jobDto.job_opening || JobOpeningStatus.OPEN;

      // if (!jobPosting && jobDto.date_published && jobDto.deadline) {
      //   const now = new Date();
      //   const datePublished = new Date();
      //   const deadline = new Date(jobDto.deadline);

      //   if (now >= datePublished && now <= deadline) {
      //     job_opening = JobOpeningStatus.OPEN;
      //   } else if (now > deadline) {
      //     job_opening = JobOpeningStatus.CLOSE;
      //   }
      // }

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

      const rank = await this.findOne('id', savedJobPosting.id);

      const applicantUsers = await this.userRepository
        .createQueryBuilder('user')
        .innerJoin('user.userProfile', 'profile')
        .where('user.role = :role', { role: 'applicant' })
        .andWhere('user.isActive = :active', { active: true })
        .andWhere('user.is_deleted = :deleted', { deleted: false })
        .andWhere('profile.rank = :rank', { rank: jobDto.rank })
        .select(['user.id'])
        .getMany();

      const applicantIds = applicantUsers.map((user) => user.id);

      const notificationSubject = 'New Job Posted';
      const notificationContent = `A new job for the position of ${rank.data.ranks.rank_name} has been posted.`;

      // Now send notifications only to these users
      this.notificationGateway.emitNotificationToUsers(
        applicantIds,
        'adminNotification',
        {
          title: notificationSubject,
          message: notificationContent,
          type: 'job_posting',
        },
      );

      await Promise.all(
        applicantIds.map((adminId) =>
          this.notificationsService.create({
            user_id: adminId,
            application_id: null,
            job_id: savedJobPosting.id,
            subject: notificationSubject,
            type: 'job_posting',
            content: notificationContent,
          }),
        ),
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
      const isActiveObj = whereClause.find((p: any) => p.key === 'isActive');

      if (typeof isActiveObj?.value === 'boolean') {
        lwhereClause += ` AND f.isActive = ${isActiveObj.value}`;
      }

      const skills_required = whereClause.find(
        (p: any) => p.key === 'skills_required' && p.value,
      );
      const rank_name = whereClause.find(
        (p: any) => p.key === 'rank_name' && p.value,
      );

      if (skills_required && Array.isArray(skills_required.value)) {
        const skillsConditions = skills_required.value.map(
          (skill) => `f.skills_required LIKE '%${skill}%'`,
        );
        if (skillsConditions.length > 0) {
          lwhereClause += ` AND (${skillsConditions.join(' OR ')})`;
        }
      }

      if (rank_name) {
        const escapedRankName = String(rank_name.value).replace(/'/g, "''");
        lwhereClause += ` AND ranks.rank_name LIKE '%${escapedRankName}%'`;
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

      const allValue = whereClause.find((p) => p.key === 'all')?.value;

      if (allValue) {
        const escapedAll = String(allValue).replace(/'/g, "''");
        const matchPattern = `%${escapedAll}%`;

        // Add ranks.rank_name explicitly here, separate from fieldsToSearch
        const allFields = [...fieldsToSearch, 'ranks.rank_name'];

        const conditions = allFields
          .map((field) => {
            if (
              field === 'salary' ||
              field === 'start_salary' ||
              field === 'end_salary'
            ) {
              return `CAST(f.${field} AS CHAR) LIKE '${matchPattern}'`;
            } else if (field === 'ranks.rank_name') {
              return `ranks.rank_name LIKE '${matchPattern}'`;
            } else {
              return `f.${field} LIKE '${matchPattern}'`;
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
        .leftJoinAndSelect('f.ranks', 'ranks')
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
        .leftJoinAndSelect('f.ranks', 'ranks')
        .where(lwhereClause)
        .getCount();

      // Return paginated data
      return paginateResponse(finalData, totalCount);
    } catch (error) {
      console.error('Error fetching job postings:', error);
      return WriteResponse(500, {}, 'something went wrong');
    }
  }
  //   async paginateJobPostings(req, pagination: IPagination) {
  //   try {
  //     let { curPage, perPage, direction, whereClause, sortBy } = pagination;
  //     let skip = (curPage - 1) * perPage;

  //     // Defaults
  //     sortBy = sortBy || 'created_at';
  //     direction = direction || 'DESC';

  //     const fieldsToSearch = [
  //       'job_type', 'rank', 'vessel_type', 'title', 'short_description', 'full_description',
  //       'country_code', 'employer', 'salary', 'start_salary', 'end_salary', 'job_type_post',
  //       'jobpost_status', 'job_opening',
  //     ];

  //     const queryBuilder = this.jobPostingRepository.createQueryBuilder('f')
  //       .leftJoin(
  //         (qb) =>
  //           qb
  //             .select('a.job_id', 'job_id')
  //             .addSelect('COUNT(a.id)', 'application_number')
  //             .from('applications', 'a')
  //             .groupBy('a.job_id'),
  //         'app_counts',
  //         'app_counts.job_id = f.id',
  //       )
  //       .addSelect('COALESCE(app_counts.application_number, 0)', 'application_number')
  //       .leftJoinAndSelect('f.ranks', 'ranks')
  //       .where('f.is_deleted = false');

  //     // Helper to find filter by key
  //     const findFilter = (key: string) =>
  //       whereClause.find(p => p.key === key && p.value !== undefined && p.value !== null);

  //     // Apply filters per field using QueryBuilder safely

  //     // Apply filters for fieldsToSearch except 'rank' (rank handled as ranks.rank_name)
  //     for (const field of fieldsToSearch) {
  //       if (field === 'rank') continue;

  //       const filters = whereClause.filter(p => p.key === field);
  //       if (filters.length > 0) {
  //         queryBuilder.andWhere(new Brackets(qb => {
  //           filters.forEach((filter, idx) => {
  //             qb.orWhere(`f.${field} LIKE :${field}${idx}`, { [`${field}${idx}`]: `%${filter.value}%` });
  //           });
  //         }));
  //       }
  //     }

  //     // Handle isActive filter
  //     const isActiveObj = findFilter('isActive');
  //     if (typeof isActiveObj?.value === 'boolean') {
  //       queryBuilder.andWhere('f.isActive = :isActive', { isActive: isActiveObj.value });
  //     }

  //     // Handle skills_required array filter
  //     const skills_required = findFilter('skills_required');
  //     if (skills_required && Array.isArray(skills_required.value)) {
  //       queryBuilder.andWhere(new Brackets(qb => {
  //         skills_required.value.forEach((skill, idx) => {
  //           qb.orWhere(`f.skills_required LIKE :skill${idx}`, { [`skill${idx}`]: `%${skill}%` });
  //         });
  //       }));
  //     }

  //     // Handle rank_name filter on joined ranks table
  //     const rank_name = findFilter('rank_name');
  //     if (rank_name) {
  //       queryBuilder.andWhere('ranks.rank_name LIKE :rankName', { rankName: `%${rank_name.value}%` });
  //     }

  //     // Handle date ranges
  //     const startDateObj = findFilter('startDate');
  //     const endDateObj = findFilter('endDate');
  //     if (startDateObj && endDateObj) {
  //       queryBuilder.andWhere('DATE(f.date_published) BETWEEN :startDate AND :endDate', {
  //         startDate: startDateObj.value,
  //         endDate: endDateObj.value,
  //       });
  //     } else if (startDateObj) {
  //       queryBuilder.andWhere('DATE(f.date_published) >= :startDate', { startDate: startDateObj.value });
  //     } else if (endDateObj) {
  //       queryBuilder.andWhere('DATE(f.date_published) <= :endDate', { endDate: endDateObj.value });
  //     }

  //     // Salary range filters
  //     const startSalaryObj = findFilter('start_salary');
  //     const endSalaryObj = findFilter('end_salary');
  //     if (startSalaryObj && endSalaryObj) {
  //       queryBuilder.andWhere('f.salary BETWEEN :startSalary AND :endSalary', {
  //         startSalary: startSalaryObj.value,
  //         endSalary: endSalaryObj.value,
  //       });
  //     } else if (startSalaryObj) {
  //       queryBuilder.andWhere('f.salary >= :startSalary', { startSalary: startSalaryObj.value });
  //     } else if (endSalaryObj) {
  //       queryBuilder.andWhere('f.salary <= :endSalary', { endSalary: endSalaryObj.value });
  //     }

  //     // Handle 'all' search filter across all fields + ranks.rank_name
  //     const allValue = findFilter('all')?.value;
  //     if (allValue) {
  //       const allParam = `%${allValue}%`;
  //       const searchFields = [...fieldsToSearch.filter(f => f !== 'rank'), 'ranks.rank_name'];

  //       queryBuilder.andWhere(new Brackets(qb => {
  //         searchFields.forEach(field => {
  //           if (field === 'salary' || field === 'start_salary' || field === 'end_salary') {
  //             qb.orWhere(`CAST(f.${field} AS CHAR) LIKE :allParam`);
  //           } else if (field === 'ranks.rank_name') {
  //             qb.orWhere(`ranks.rank_name LIKE :allParam`);
  //           } else {
  //             qb.orWhere(`f.${field} LIKE :allParam`);
  //           }
  //         });
  //       })).setParameter('allParam', allParam);
  //     }

  //     // Pagination and sorting
  //     queryBuilder
  //       .orderBy(`f.${sortBy}`, direction.toUpperCase() as 'ASC' | 'DESC')
  //       .skip(skip)
  //       .take(perPage);

  //     // Execute queries
  //     const [entities, raw] = await Promise.all([
  //       queryBuilder.getMany(),
  //       queryBuilder.getRawMany(),
  //     ]);

  //     // Map application_number
  //     const finalData = entities.map(job => {
  //       const rawItem = raw.find(r => r.f_id === job.id);
  //       try { job.skills_required = JSON.parse(job.skills_required); } catch {}
  //       if (typeof job.social_media_type === 'string') {
  //         try { job.social_media_type = JSON.parse(job.social_media_type); } catch {}
  //       }
  //       return {
  //         ...job,
  //         application_number: parseInt(rawItem?.application_number || '0'),
  //       };
  //     });

  //     // Total count query (same filters)
  //     const countQueryBuilder = this.jobPostingRepository.createQueryBuilder('f')
  //       .leftJoin('f.ranks', 'ranks')
  //       .where('f.is_deleted = false');

  //     // Repeat filters on countQueryBuilder
  //     for (const filter of whereClause) {
  //       if (!filter.key || filter.value === undefined || filter.key === 'all') continue;

  //       switch (filter.key) {
  //         case 'isActive':
  //           countQueryBuilder.andWhere('f.isActive = :isActive', { isActive: filter.value });
  //           break;
  //         case 'skills_required':
  //           if (Array.isArray(filter.value) && filter.value.length) {
  //             countQueryBuilder.andWhere(new Brackets(qb => {
  //               filter.value.forEach((skill, idx) => {
  //                 qb.orWhere(`f.skills_required LIKE :skill${idx}`, { [`skill${idx}`]: `%${skill}%` });
  //               });
  //             }));
  //           }
  //           break;
  //         case 'rank_name':
  //           countQueryBuilder.andWhere('ranks.rank_name LIKE :rankName', { rankName: `%${filter.value}%` });
  //           break;
  //         case 'startDate':
  //         case 'endDate':
  //         case 'start_salary':
  //         case 'end_salary':
  //           break; // handled later
  //         default:
  //           if (typeof filter.value === 'string') {
  //             countQueryBuilder.andWhere(`f.${filter.key} LIKE :${filter.key}`, { [filter.key]: `%${filter.value}%` });
  //           } else {
  //             countQueryBuilder.andWhere(`f.${filter.key} = :${filter.key}`, { [filter.key]: filter.value });
  //           }
  //       }
  //     }

  //     // Handle date range on count query
  //     if (findFilter('startDate') && findFilter('endDate')) {
  //       countQueryBuilder.andWhere('DATE(f.date_published) BETWEEN :startDate AND :endDate', {
  //         startDate: findFilter('startDate').value,
  //         endDate: findFilter('endDate').value,
  //       });
  //     } else if (findFilter('startDate')) {
  //       countQueryBuilder.andWhere('DATE(f.date_published) >= :startDate', { startDate: findFilter('startDate').value });
  //     } else if (findFilter('endDate')) {
  //       countQueryBuilder.andWhere('DATE(f.date_published) <= :endDate', { endDate: findFilter('endDate').value });
  //     }

  //     // Salary range on count query
  //     if (findFilter('start_salary') && findFilter('end_salary')) {
  //       countQueryBuilder.andWhere('f.salary BETWEEN :startSalary AND :endSalary', {
  //         startSalary: findFilter('start_salary').value,
  //         endSalary: findFilter('end_salary').value,
  //       });
  //     } else if (findFilter('start_salary')) {
  //       countQueryBuilder.andWhere('f.salary >= :startSalary', { startSalary: findFilter('start_salary').value });
  //     } else if (findFilter('end_salary')) {
  //       countQueryBuilder.andWhere('f.salary <= :endSalary', { endSalary: findFilter('end_salary').value });
  //     }

  //     // 'all' filter on count query
  //     if (allValue) {
  //       const allParam = `%${allValue}%`;
  //       const searchFields = [...fieldsToSearch.filter(f => f !== 'rank'), 'ranks.rank_name'];
  //       countQueryBuilder.andWhere(new Brackets(qb => {
  //         searchFields.forEach(field => {
  //           if (field === 'salary' || field === 'start_salary' || field === 'end_salary') {
  //             qb.orWhere(`CAST(f.${field} AS CHAR) LIKE :allParam`);
  //           } else if (field === 'ranks.rank_name') {
  //             qb.orWhere(`ranks.rank_name LIKE :allParam`);
  //           } else {
  //             qb.orWhere(`f.${field} LIKE :allParam`);
  //           }
  //         });
  //       })).setParameter('allParam', allParam);
  //     }

  //     const totalCount = await countQueryBuilder.getCount();

  //     return paginateResponse(finalData, totalCount);

  //   } catch (error) {
  //     console.error('Error fetching job postings:', error);
  //     return WriteResponse(500, {}, 'something went wrong');
  //   }
  // }

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
        relations: ['user', 'ranks'], // Automatically load the related user entity
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

  // async toggleJobStatus(query) {
  //   try {
  //     let { id, isActive } = query;
  //     isActive = isActive === 'true' ? true : false;

  //     if (!id) {
  //       return WriteResponse(400, false, 'Job posting ID is required.');
  //     }

  //     const jobPosting = await this.jobPostingRepository.findOne({
  //       where: { id: id, is_deleted: false },
  //     });

  //     if (!jobPosting) {
  //       return WriteResponse(404, {}, 'Record not found.');
  //     }

  //     if (jobPosting.jobpost_status === JobPostStatus.DRAFT) {
  //       return WriteResponse(
  //         400,
  //         false,
  //         'Scheduled job cannot be manually activated.',
  //       );
  //     }
  //     // Block activation if this is a scheduled job
  //     // if (jobPosting.posted_date !== null && jobPosting.posted_at !== null) {
  //     //   return WriteResponse(
  //     //     400,
  //     //     false,
  //     //     'Scheduled jobs cannot be manually activated.',
  //     //   );
  //     // }
  //     await this.jobPostingRepository.update(id, { isActive: isActive });

  //     return WriteResponse(
  //       200,
  //       true,
  //       `The job has been successfully ${isActive ? 'activated' : 'deactivated'}.`,
  //     );
  //   } catch (error) {
  //     return WriteResponse(
  //       500,
  //       {},
  //       error.message || 'An unexpected error occurred.',
  //     );
  //   }
  // }

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
        return WriteResponse(404, {}, 'Record not found.');
      }

      if (jobPosting.jobpost_status === JobPostStatus.DRAFT) {
        return WriteResponse(
          400,
          false,
          'Scheduled job cannot be manually activated.',
        );
      }

      // Determine job_opening based on isActive
      const updatedFields = {
        isActive: isActive,
        job_opening: isActive ? JobOpeningStatus.OPEN : JobOpeningStatus.HOLD,
      };

      await this.jobPostingRepository.update(id, updatedFields);

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

  async updateDeadline(updateDeadlineDto: UpdateDeadlineDto) {
    try {
      const jobPosting = await this.jobPostingRepository.findOne({
        where: { id: updateDeadlineDto.job_id, is_deleted: false },
      });

      if (!jobPosting) {
        return WriteResponse(404, false, 'Job posting not found.');
      }
      await this.jobPostingRepository.update(updateDeadlineDto.job_id, {
        deadline: updateDeadlineDto.deadline,
        job_opening: updateDeadlineDto.job_opening,
        isActive: updateDeadlineDto.isActive,
      });

      return WriteResponse(200, true, 'Job deadline updated successfully.');
    } catch (error) {
      console.error(error);
      return WriteResponse(500, false, 'Something went wrong.');
    }
  }
  async Changestatus(changejobstatus: Changejobstatus) {
    try {
      const jobdetail = await this.jobPostingRepository.findOne({
        where: { id: changejobstatus.job_id, is_deleted: false },
      });

      if (!jobdetail) {
        return WriteResponse(404, false, 'Job not found');
      }

      // Case 1: Archive the job
      if (changejobstatus.job_opening === JobOpeningStatus.ARCHIVED) {
        jobdetail.job_opening = JobOpeningStatus.ARCHIVED;
        jobdetail.isActive = false;
      } else if (changejobstatus.job_opening === JobOpeningStatus.OPEN) {
        // Case 2: Re-open the job and set status based on deadline
        const now = new Date();

        if (jobdetail.deadline < now) {
          jobdetail.job_opening = JobOpeningStatus.CLOSE;
          jobdetail.isActive = false;
        } else {
          jobdetail.job_opening = JobOpeningStatus.OPEN;
          jobdetail.isActive = true;
        }
      }

      const updatedJob = await this.jobPostingRepository.save(jobdetail);
      return WriteResponse(200, updatedJob, 'Job status updated successfully');
    } catch (error) {
      console.error(error);
      return WriteResponse(500, false, 'Something went wrong');
    }
  }
}
