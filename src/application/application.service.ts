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
  ) { }

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
      // Fetch the application with its relations and order by applied_at and created_at in descending order
      const application = await this.applicationRepository.findOne({
        where: { id, is_deleted: false },
        relations: [
          'job',
          'user',
          'job.courses_and_certification',
          'user.userProfile',
        ],
        order: {
          applied_at: 'DESC', // Order by applied_at descending
          created_at: 'DESC', // Order by created_at descending
        },
      });

      if (!application) {
        return WriteResponse(404, {}, `Application with ID ${id} not found.`);
      }

      // Add comments and status to the response
      const response = {
        ...application,
        comments: application.comments || 'No comments available', // Fallback if comments are null/undefined
        status: application.status || 'No status available', // Fallback if status is null/undefined
      };

      return WriteResponse(200, response, 'Application retrieved successfully.');
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
      return await this.applicationRepository.save(data);
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

  //   async pagination(req: any, pagination: IPagination) {
  //   try {
  //     const { curPage = 1, perPage = 10, whereClause } = pagination;

  //     let lwhereClause = 'app.is_deleted = :is_deleted';
  //     const parameters: Record<string, any> = { is_deleted: false };

  //     // Add filtering dynamically
  //     if (Array.isArray(whereClause)) {
  //       whereClause.forEach(({ key, value, operator }) => {
  //         if (key && value && operator) {
  //           // Validate that the key is a valid column in the app entity
  //           const validKeys = [
  //             'status',
  //             'job_id',
  //             'description',
  //             'comments',
  //             'additional_info',
  //             'certification_path',
  //             'applied_at',
  //             // Add any other valid keys here
  //           ];
  //           if (validKeys.includes(key)) {
  //             if (operator === 'LIKE') {
  //               lwhereClause += ` AND app.${key} LIKE :${key}_search`;
  //               parameters[`${key}_search`] = `%${value}%`;
  //             } else {
  //               lwhereClause += ` AND app.${key} = :${key}_search`;
  //               parameters[`${key}_search`] = value;
  //             }
  //           } else {
  //             console.warn(`Invalid key: ${key}`); // Log invalid keys for debugging
  //           }
  //         }
  //       });
  //     }

  //     const skip = (curPage - 1) * perPage;

  //     const [list, totalCount] = await this.applicationRepository
  //       .createQueryBuilder('app')
  //       .leftJoinAndSelect('app.job', 'job')
  //       .leftJoinAndSelect('app.user', 'user')
  //       .leftJoinAndSelect('user.userProfile', 'userProfile')
  //       .where(lwhereClause, parameters)
  //       .skip(skip)
  //       .take(perPage)
  //       .orderBy('app.applied_at', 'DESC')
  //       .getManyAndCount();

  //     if (!list.length) {
  //       return WriteResponse(404, [], 'No records found.');
  //     }

  //     const filteredApplications = list.map((application) => ({
  //       status: application.status,
  //       mobile: application.user?.userProfile?.mobile || null,
  //       first_name: application.user?.userProfile?.first_name || null,
  //       last_name: application.user?.userProfile?.last_name || null,
  //       email: application.user?.email || null,
  //       applied_at: application.applied_at,
  //       title: application.job?.title || null,
  //       job_id: application.job?.id || null,
  //       application_count: totalCount,
  //     }));

  //     return paginateResponse(filteredApplications, totalCount, curPage, perPage);
  //   } catch (error) {
  //     console.error('Pagination Error:', error);
  //     return WriteResponse(500, {}, 'An unexpected error occurred.');
  //   }
  // }

  async pagination(pagination: IPagination) {
    try {
      const { curPage, perPage, whereClause } = pagination;

      // Default whereClause to filter out deleted users
      let lwhereClause = 'is_deleted = false'; // Ensure deleted users are not fetched

      // Fields to search
      const fieldsToSearch =
        ['status',
          'job_id',
          'description',
          'comments',
          'additional_info',
          'certification_path',
          'applied_at',
          'work_experiences'
        ];

      // Process whereClause
      if (Array.isArray(whereClause)) {
        fieldsToSearch.forEach((field) => {
          const fieldValue = whereClause.find((p) => p.key === field)?.value;
          if (fieldValue) {
            lwhereClause += ` AND ${field} LIKE '%${fieldValue}%'`; // Removed 'job.' prefix
          }
        });

        const allValues = whereClause.find((p) => p.key === 'all')?.value;
        if (allValues) {
          const searches = fieldsToSearch
            .map((ser) => `${ser} LIKE '%${allValues}%'`) // Removed 'job.' prefix
            .join(' OR ');
          lwhereClause += ` AND (${searches})`;
        }
      }
      const skip = (curPage - 1) * perPage;
      const [list, count] = await this.applicationRepository
        .createQueryBuilder('user') // Changed alias to 'user'
        .where(lwhereClause)
        .orderBy('applied_at', 'DESC') // Order by created_at DESC
        .skip(skip)
        .take(perPage)
        .getManyAndCount();

      const enrichedUserList = await Promise.all(
        list.map(async (user) => {
          const { ...enrichedUser } = user; // Exclude password
          return enrichedUser;
        }),
      );

      return paginateResponse(enrichedUserList, count, curPage);
    } catch (error) {
      console.error('User Pagination Error --> ', error);
      return WriteResponse(500, error, `Something went wrong.`);
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
