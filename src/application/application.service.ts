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

@Injectable()
export class ApplicationService {
  constructor(
    @InjectRepository(applications)
    private readonly applicationRepository: Repository<applications>,
    @InjectRepository(CoursesAndCertification)
    private coursesRepository: Repository<CoursesAndCertification>,
  ) {}

  async applyForJob(createApplicationDto: CreateApplicationDto) {
    const { job_id, user_id, certification_path } = createApplicationDto;

    // Validate the certification file format
    if (
      certification_path &&
      !/\.(pdf|jpg|jpeg|png|doc|docx)$/i.test(certification_path)
    ) {
      return WriteResponse(
        400,
        {},
        'certification_path must be a valid file format (.pdf, .jpg, .jpeg, .png, .doc, .docx).',
      );
    }

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
      description: createApplicationDto.description,
      comments: createApplicationDto.comments,
      cv_path: createApplicationDto.cv_path,
      certification_path, // New field
      additional_info: createApplicationDto.additional_info,
      work_experiences: createApplicationDto.work_experiences,
      created_by: user_id,
      updated_by: user_id,
    });

    const savedApplication = await this.applicationRepository.save(application);
    if (createApplicationDto.job_id) {
      // Delete existing courses and certifications for the job ID
      await this.coursesRepository.delete({
        job_id: createApplicationDto.job_id,
      });
    }

    if (createApplicationDto.courses_and_certification) {
      for (const course of createApplicationDto.courses_and_certification) {
        const courseWithJobId = {
          ...course,
          job_id: createApplicationDto.job_id, // Add job ID to each course
        };
        // Save the course
        await this.coursesRepository.save(courseWithJobId);
      }
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

    return WriteResponse(
      200,
      savedApplication,
      'Application submitted successfully.',
    );
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
    try {
      if (!id) {
        return WriteResponse(400, {}, 'Application ID is required');
      }

      console.log('Searching for application with ID:', id);

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

      const response = {
        ...application,
        comments: application.comments || 'No comments available',
        status: application.status || 'No status available',
      };

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

      Object.assign(application, updateApplicationDto);

      const updatedApplication =
        await this.applicationRepository.save(application);

      return WriteResponse(
        200,
        updatedApplication,
        'Application updated successfully.',
      );
    } catch (error) {
      console.error('Error updating application:', error.message);
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
      const { curPage = 1, perPage = 10, whereClause } = pagination;

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
        'applied_at',
        'job.title',
        'user.email',
        'userProfile.first_name',
      ];

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
        return WriteResponse(404, [], `No records found.`);
      }

      const enrichedApplications = list.map((application) => ({
        ...application,
      }));

      return paginateResponse(
        enrichedApplications,
        totalCount,
        curPage,
        perPage,
      );
    } catch (error) {
      console.error('Application Pagination Error --> ', error);
      return WriteResponse(500, {}, `Something went wrong.`);
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
      console.log('Confirmation email sent successfully.');
    } catch (error) {
      console.error('Failed to send confirmation email:', error.message);
    }
  }
}
