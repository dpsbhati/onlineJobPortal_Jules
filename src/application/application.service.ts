import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CoursesAndCertification } from 'src/courses_and_certification/entities/courses_and_certification.entity';
import { IPagination } from 'src/shared/paginationEum';
import { paginateResponse, WriteResponse } from 'src/shared/response';
import { Repository } from 'typeorm';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { applications } from './entities/application.entity';

import * as nodemailer from 'nodemailer';
import { NotificationsService } from 'src/notifications/notifications.service';
import { ApplicationStatus } from './enums/applications.-status';
import { JobPosting } from 'src/job-posting/entities/job-posting.entity';
import { count } from 'console';

@Injectable()
export class ApplicationService {
  constructor(
    @InjectRepository(applications)
    private readonly applicationRepository: Repository<applications>,
    @InjectRepository(CoursesAndCertification)
    private coursesRepository: Repository<CoursesAndCertification>,
    private readonly notificationsService: NotificationsService,
    @InjectRepository(JobPosting)
    private jobPostingRepository: Repository<JobPosting>,
  ) {}

  async applyForJob(createApplicationDto: CreateApplicationDto) {
    try {
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
        job: { id: job_id },
        user: { id: user_id },
        status: 'Pending',
        additional_info: createApplicationDto.additional_info,
        created_by: user_id,
        updated_by: user_id,
      });

      const savedApplication =
        await this.applicationRepository.save(application);
      if (createApplicationDto.job_id) {
        // Delete existing courses and certifications for the job ID
        await this.coursesRepository.delete({
          job_id: createApplicationDto.job_id,
        });
      }

      // Fetch job and user details for the email
      const jobDetails = await this.applicationRepository
        .createQueryBuilder('app')
        .leftJoinAndSelect('app.job', 'job')
        .leftJoinAndSelect('app.user', 'user')
        .where('app.id = :id', { id: savedApplication.id })
        .getOne();

      if (jobDetails) {
        // Send confirmation email
        await this.sendConfirmationEmail(jobDetails);
      }
      // Send notification (you can pass relevant information like job title, user details, status)
      const notificationData = {
        application_id: savedApplication.id,
        jobTitle: jobDetails.job.title,
        userName: savedApplication.user.email,
        status:
          ApplicationStatus[
            savedApplication.status as keyof typeof ApplicationStatus
          ], // Ensure it's an enum value
        to: jobDetails.user.email,
        subject: 'New Application',
        content: `Your application for the job ${jobDetails.job.title} has been ${savedApplication.status}.`,
      };
      const savedNotification =
        await this.notificationsService.create(notificationData);

      return WriteResponse(
        200,
        savedApplication,
        'Application submitted successfully.',
      );
    } catch (error) {
      console.error('Error in applyForJob:', error);
      return WriteResponse(500, {}, 'Something went wrong.');
    }
  }

  async findAll() {
    try {
      const applications = await this.applicationRepository.find({
        where: { is_deleted: false },
        relations: ['job', 'user', 'job.courses_and_certification'],
        order: { applied_at: 'DESC' },
      });

      if (applications.length === 0) {
        return WriteResponse(404, [], 'No applications found.');
      }

      // Remove password from nested user
      const sanitizedApplications = applications.map((app) => {
        if (app.user) {
          delete app.user.password;
        }
        return app;
      });

      return WriteResponse(
        200,
        sanitizedApplications,
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
    try {
      if (!id) {
        return WriteResponse(400, {}, 'Application ID is required');
      }
      const application = await this.applicationRepository
        .createQueryBuilder('app')
        .leftJoinAndSelect('app.job', 'job')
        .leftJoinAndSelect('app.user', 'user')
        .leftJoinAndSelect('job.courses_and_certification', 'courses')
        .leftJoinAndSelect('user.userProfile', 'userProfile')
        .where('app.id = :id', { id: id.toString() })
        .andWhere('app.is_deleted = false')
        .getOne();

      if (!application) {
        return WriteResponse(404, {}, `Application with ID ${id} not found.`);
      }

      const userProfile = application.user.userProfile;

      // List all fields that need JSON parsing
      const jsonFields = [
        'nationalities',
        'additional_contact_info',
        'work_experience_info',
        'education_info',
        'course_info',
        'certification_info',
        'other_experience_info',
        'project_info',
        'language_spoken_info',
        'language_written_info',
        'notice_period_info',
        'current_salary_info',
        'expected_salary_info',
        'preferences_info',
        'additional_info',
        'vacancy_source_info',
      ];

      // Parse JSON fields safely
      for (const field of jsonFields) {
        if (userProfile[field]) {
          try {
            userProfile[field] = JSON.parse(userProfile[field]);
          } catch {
            // If parsing fails, keep original or set to null/empty array as needed
            userProfile[field] = null; // or userProfile[field] = userProfile[field];
          }
        } else {
          userProfile[field] = null;
        }
      }

      const response = {
        ...application,
        comments: application.comments || 'No comments available',
        status: application.status || 'No status available',
      };
      delete response.user.password;
      return WriteResponse(
        200,
        response,
        'Application retrieved successfully.',
      );
    } catch (error) {
      console.error('Error fetching application:', error.message);
      return WriteResponse(
        500,
        {},
        'An unexpected error occurred while fetching the application.',
      );
    }
  }

  async paginateApplicationsByJobId(
    req: any,
    pagination: IPagination,
    job_id: string,
  ) {
    try {
      const { curPage = 1, perPage = 10, whereClause } = pagination;

      let lwhereClause = 'app.is_deleted = :is_deleted AND job.id = :job_id';
      const parameters: Record<string, any> = {
        is_deleted: false,
        job_id: job_id, // Filter by the provided job_id
      };

      const fieldsToSearch = [
        'status',
        'description',
        'comments',
        'additional_info',
        'certification_path',
        'applied_at',
        'job.title',
        'user.email',
        'userProfile.first_name',
      ];

      // Dynamically adding search filters
      if (Array.isArray(whereClause)) {
        fieldsToSearch.forEach((field) => {
          const fieldValue = whereClause.find((p) => p.key === field)?.value;
          if (fieldValue) {
            lwhereClause += ` AND ${field} LIKE :${field}_search`;
            parameters[`${field}_search`] = `%${fieldValue}%`;
          }
        });

        const allValues = whereClause.find((p) => p.key === 'all')?.value;
        if (allValues) {
          const searches = fieldsToSearch
            .map((field) => `${field} LIKE :all_search`)
            .join(' OR ');
          lwhereClause += ` AND (${searches})`;
          parameters.all_search = `%${allValues}%`;
        }
      }

      const skip = (curPage - 1) * perPage;

      // Fetch the applications for the current page based on job_id
      const sanitizedApplications = await this.applicationRepository
        .createQueryBuilder('app')
        .leftJoinAndSelect('app.job', 'job')
        .leftJoinAndSelect('app.user', 'user')
        .leftJoinAndSelect('user.userProfile', 'userProfile')
        .where(lwhereClause, parameters)
        .skip(skip)
        .take(perPage)
        .orderBy('app.applied_at', 'DESC')
        .addOrderBy('app.created_at', 'DESC')
        .getMany();

      // If no applications are found
      if (!sanitizedApplications.length) {
        return WriteResponse(404, [], `No records found.`);
      }
      // Remove password from nested user
      const applications = sanitizedApplications.map((app) => {
        if (app.user) {
          delete app.user.password;
        }
        return app;
      });

      // Return only the count of applications in the response
      return WriteResponse(
        200,
        { applications, count: sanitizedApplications.length },
        'Applications found successfully.',
      );
    } catch (error) {
      console.error('Application Pagination Error --> ', error);
      return WriteResponse(500, {}, `Something went wrong.`);
    }
  }

  async paginateJobsWithApplications(req: any, pagination: IPagination) {
    try {
      const {
        curPage = 1,
        perPage = 10,
        direction = 'DESC',
        sortBy = 'created_at',
        whereClause = [],
      } = pagination;

      const skip = (curPage - 1) * perPage;
      const params: Record<string, any> = {};

      const searchableFields = [
        'title',
        'job_type',
        'skills_required',
        'short_description',
        'full_description',
        'assignment_duration',
        'employer',
        'required_experience',
        'salary',
        'address',
        'work_type',
      ];

      let lwhereClause = 'job.is_deleted = false';

      for (const clause of whereClause) {
        const { key, value, operator = 'LIKE' } = clause;
        if (value && key !== 'all') {
          const paramKey = `filter_${key}`;
          if (operator.toUpperCase() === 'LIKE') {
            lwhereClause += ` AND job.${key} LIKE :${paramKey}`;
            params[paramKey] = `%${value}%`;
          } else {
            lwhereClause += ` AND job.${key} ${operator} :${paramKey}`;
            params[paramKey] = value;
          }
        }
      }

      const allValue = whereClause.find((p) => p.key === 'all')?.value;
      if (allValue) {
        const searchConditions = searchableFields
          .map((field, i) => {
            const paramKey = `all_search_${i}`;
            params[paramKey] = `%${allValue}%`;
            return `job.${field} LIKE :${paramKey}`;
          })
          .join(' OR ');
        lwhereClause += ` AND (${searchConditions})`;
      }

      // Get total count for pagination
      const totalCount = await this.jobPostingRepository
        .createQueryBuilder('job')
        .leftJoin('job.applications', 'app', 'app.is_deleted = false')
        .where('app.id IS NOT NULL')
        .andWhere(lwhereClause, params)
        .getCount();

      // Main data with application count
      const jobs = await this.jobPostingRepository
        .createQueryBuilder('job')
        .leftJoinAndSelect('job.applications', 'app', 'app.is_deleted = false')
        .leftJoinAndSelect('app.user', 'user')
        .leftJoinAndSelect('user.userProfile', 'userProfile')
        .leftJoin(
          (qb) =>
            qb
              .select('a.job_id', 'job_id')
              .addSelect('COUNT(a.id)', 'application_count')
              .from('applications', 'a')
              .where('a.is_deleted = false')
              .groupBy('a.job_id'),
          'app_count',
          'app_count.job_id = job.id',
        )
        .addSelect(
          'COALESCE(app_count.application_count, 0)',
          'application_count',
        )
        .where('app.id IS NOT NULL')
        .andWhere(lwhereClause, params)
        .orderBy(`job.${sortBy}`, direction.toUpperCase() as 'ASC' | 'DESC')
        .skip(skip)
        .take(perPage)
        .getRawAndEntities();

      // Merge raw application_count back into each job
      const result = jobs.entities.map((job, index) => {
        const raw = jobs.raw[index];

        // Remove user password from each application
        if (job.applications?.length) {
          for (const app of job.applications) {
            if (app.user?.password) {
              delete app.user.password;
            }
          }
        }

        return {
          ...job,
          application_count: parseInt(raw.application_count || '0'),
        };
      });

      return WriteResponse(
        200,
        { jobs: result, count: totalCount },
        'Jobs with applications found successfully.',
      );
    } catch (error) {
      console.error('Pagination error in jobs with applications -->', error);
      return WriteResponse(500, {}, 'Something went wrong.');
    }
  }

  async update(
    id: string,
    updateApplicationDto: UpdateApplicationDto,
    user: any,
  ) {
    try {
      const application: any = await this.findOne(id);
      if (!application) {
        return WriteResponse(404, {}, `Application with ID ${id} not found.`);
      }
      const isAdmin = user?.role === 'admin';

      if (!isAdmin) {
        const restrictedFields = [
          'status',
          'comments',
          'description',
          'certification_path',
        ];
        const hasRestrictedFields = restrictedFields.some((field) =>
          Object.keys(updateApplicationDto).includes(field),
        );

        if (hasRestrictedFields) {
          return WriteResponse(
            403,
            {},
            'You do not have permission to update these fields.',
          );
        }
      }

      if (
        updateApplicationDto.certification_path &&
        !/\.(pdf|jpg|jpeg|png|doc|docx)$/i.test(
          updateApplicationDto.certification_path,
        )
      ) {
        return WriteResponse(
          400,
          {},
          'certification_path must be a valid file format (.pdf, .jpg, .jpeg, .png, .doc, .docx).',
        );
      }

      // Object.assign(application, updateApplicationDto);

      updateApplicationDto.id = id;

      const updatedApplication =
        await this.applicationRepository.save(updateApplicationDto);

      // Send notification (you can pass relevant information like job title, user details, status)
      const notificationData = {
        application_id: updatedApplication.id, // Accessing the application ID from the 'data' field
        jobTitle: application.data.job.title, // Accessing the job title correctly from 'job'
        status: updatedApplication.status as ApplicationStatus,
        to: application.data.user.email, // Email of the user to send the notification to
        subject: 'Application Status Update', // Notification subject
        content: `Your application for the job ${application.data.job.title} has been ${updatedApplication.status}.`, // Notification content
      };
      const savedNotification =
        await this.notificationsService.create(notificationData);

      return WriteResponse(
        200,
        updatedApplication,
        'Application updated successfully.',
      );
    } catch (error) {
      console.error('Error updating application:', error);
      return WriteResponse(
        500,
        {},
        'An unexpected error occurred while updating the application.',
      );
    }
  }

  async remove(id: string) {
    const application = await this.findOne(id);
    if (application.statusCode == 200) {
      const data = application.data;
      data.is_deleted = true;
      await this.applicationRepository.save(data);
      return WriteResponse(200, {}, `Application deleted successfully.`);
    }
    return application;
  }

  async paginateApplications(req: any, pagination: IPagination) {
    try {
      const { curPage = 1, perPage = 10, whereClause = [] } = pagination;

      let lwhereClause = 'app.is_deleted = :is_deleted';
      const parameters: Record<string, any> = { is_deleted: false };

      const isApplicant = req.user?.role === 'applicant';
      if (isApplicant) {
        lwhereClause += ` AND app.user_id = :userId`;
        parameters.userId = req.user.id;
      }

      const fieldsToSearch = [
        'status',
        'job_id',
        'description',
        'comments',
        'additional_info',
        'certification_path',
        'job.title',
        'user.email',
        'userProfile.first_name',
        'userProfile.last_name',
      ];

      // Specific field filters
      const email = whereClause.find((p) => p.key === 'email' && p.value);
      if (email) {
        lwhereClause += ` AND user.email LIKE :email`;
        parameters.email = `%${email.value}%`;
      }
      const title = whereClause.find((p) => p.key === 'title' && p.value);
      if (title) {
        lwhereClause += ` AND job.title LIKE :title`;
        parameters.title = `%${title.value}%`;
      }
      const job_type = whereClause.find((p) => p.key === 'job_type' && p.value);
      if (job_type) {
        lwhereClause += ` AND job.job_type LIKE :job_type`;
        parameters.job_type = `%${job_type.value}%`;
      }

      // 🔍 Exact applied_at date match
      const appliedAt = whereClause.find(
        (p) => p.key === 'applied_at' && p.value,
      );
      if (appliedAt) {
        lwhereClause += ` AND DATE(app.applied_at) = :appliedAt`;
        parameters.appliedAt = appliedAt.value;
      }

      const first_name = whereClause.find(
        (p) => p.key === 'first_name' && p.value,
      );
      if (first_name) {
        lwhereClause += ` AND userProfile.first_name LIKE :first_name`;
        parameters.first_name = `%${first_name.value}%`;
      }

      const last_name = whereClause.find(
        (p) => p.key === 'last_name' && p.value,
      );
      if (last_name) {
        lwhereClause += ` AND userProfile.last_name LIKE :last_name`;
        parameters.last_name = `%${last_name.value}%`;
      }

      // Field-wise filters (safe binding)
      if (Array.isArray(whereClause)) {
        fieldsToSearch.forEach((field) => {
          const fieldValue = whereClause.find((p) => p.key === field)?.value;
          if (fieldValue) {
            const paramKey = `${field.replace('.', '_')}_search`;
            lwhereClause += ` AND ${field} LIKE :${paramKey}`;
            parameters[paramKey] = `%${fieldValue}%`;
          }
        });

        // ALL SEARCH - dynamic fields
        const allValues = whereClause.find((p) => p.key === 'all')?.value;
        if (allValues) {
          const allSearchConditions = fieldsToSearch
            .map((field, idx) => `${field} LIKE :all_search_${idx}`)
            .join(' OR ');

          // Add full name concatenation match
          lwhereClause += ` AND (CONCAT(userProfile.first_name, ' ', userProfile.last_name) LIKE :full_name_search OR ${allSearchConditions})`;

          parameters['full_name_search'] = `%${allValues}%`;

          fieldsToSearch.forEach((_, idx) => {
            parameters[`all_search_${idx}`] = `%${allValues}%`;
          });
        }
        // ✅ ALL JOB POST SEARCH - job fields only
        const allJobPost = whereClause.find(
          (p) => p.key === 'all_job_post',
        )?.value;

        if (allJobPost) {
          const jobFieldsToSearch = ['job.title', 'job.job_type'];

          const allJobPostSearchConditions = jobFieldsToSearch
            .map((field, idx) => `${field} LIKE :all_job_post_${idx}`)
            .join(' OR ');

          lwhereClause += ` AND (${allJobPostSearchConditions})`;

          jobFieldsToSearch.forEach((_, idx) => {
            parameters[`all_job_post_${idx}`] = `%${allJobPost}%`;
          });
        }
      }

      const skip = (curPage - 1) * perPage;

      const [list, totalCount] = await this.applicationRepository
        .createQueryBuilder('app')
        .leftJoinAndSelect('app.job', 'job')
        .leftJoinAndSelect('app.user', 'user')
        .leftJoinAndSelect('user.userProfile', 'userProfile')
        .where(lwhereClause, parameters)
        .skip(skip)
        .take(perPage)
        .orderBy('app.applied_at', 'DESC')
        .addOrderBy('app.created_at', 'DESC')
        .getManyAndCount();

      if (!list.length) {
        return WriteResponse(404, [], 'No records found.');
      }
      // Remove password from nested user
      const sanitizedApplications = list.map((app) => {
        if (app.user) {
          delete app.user.password;
        }
        return app;
      });

      return paginateResponse(list, totalCount, curPage, perPage);
    } catch (error) {
      console.error('Application Pagination Error --> ', error);
      return WriteResponse(500, {}, 'Something went wrong.');
    }
  }

  async pagination(req: any, pagination: IPagination) {
    try {
      const { curPage = 1, perPage = 10, whereClause } = pagination;

      let lwhereClause = 'app.is_deleted = :is_deleted';
      const parameters: Record<string, any> = { is_deleted: false };

      const fieldsToSearch = [
        'app.status',
        'app.description',
        'app.comments',
        'app.additional_info',
        'user.email',
        'userProfile.mobile',
        'userProfile.first_name',
        'userProfile.last_name',
        'job.title',
        'app.job_id',
        'userProfile.user_id',
      ];

      if (Array.isArray(whereClause)) {
        whereClause.forEach(({ key, value, operator }) => {
          if (key === 'all' && value) {
            const searches = fieldsToSearch
              .map((field) => `${field} LIKE :all_search`)
              .join(' OR ');
            lwhereClause += ` AND (${searches})`;
            parameters['all_search'] = `%${value}%`;
          } else if (key && value && operator) {
            if (operator.toUpperCase() === 'LIKE') {
              lwhereClause += ` AND ${key} LIKE :${key}_search`;
              parameters[`${key}_search`] = `%${value}%`;
            } else {
              lwhereClause += ` AND ${key} ${operator} :${key}_search`;
              parameters[`${key}_search`] = value;
            }
          }
        });
      }

      const skip = (curPage - 1) * perPage;

      const [list, totalCount] = await this.applicationRepository
        .createQueryBuilder('app')
        .leftJoinAndSelect('app.job', 'job')
        .leftJoinAndSelect('app.user', 'user')
        .leftJoinAndSelect('user.userProfile', 'userProfile')
        .where(lwhereClause, parameters)
        .skip(skip)
        .take(perPage)
        .getManyAndCount();

      if (!list.length) {
        return WriteResponse(404, [], 'No records found.');
      }

      const filteredApplications = list.map((application) => ({
        application_id: application.id, // ✅ Added application ID
        status: application.status,
        mobile: application.user?.userProfile?.mobile || null,
        first_name: application.user?.userProfile?.first_name || null,
        last_name: application.user?.userProfile?.last_name || null,
        user_id: application.user?.userProfile?.user_id || null,
        email: application.user?.email || null,
        applied_at: application.applied_at,
        title: application.job?.title || null,
        job_id: application.job?.id || null,
        application_count: totalCount,
      }));

      return paginateResponse(
        filteredApplications,
        totalCount,
        curPage,
        perPage,
      );
    } catch (error) {
      console.error('Pagination Error:', error);
      return WriteResponse(500, {}, 'An unexpected error occurred.');
    }
  }

  private async sendConfirmationEmail(application: any) {
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USER, // Your email address
        pass: process.env.EMAIL_PASS, // Your email password
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: application.user.email,
      subject: `Application Confirmation for ${application.job.title}`,
      text: `Dear ${application.user.firstName},
  
  Thank you for applying for the position of ${application.job.title}.
  
  Your application has been received and is currently under review. We will contact you if your profile matches our requirements.
  
  Best regards,
  Hiring Team`,
      html: `<p>Dear ${application.user.firstName},</p>
        <p>Thank you for applying for the position of <strong>${application.job.title}</strong>.</p>
        <p>Your application has been received and is currently under review. We will contact you if your profile matches our requirements.</p>
        <p>Best regards,<br>Hiring Team</p>`,
    };

    try {
      await transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Failed to send confirmation email:', error.message);
    }
  }
}
