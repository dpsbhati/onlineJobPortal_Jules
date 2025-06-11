import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserProfile } from './entities/user-profile.entity';
import { CreateUserProfileDto } from './dto/create-user-profile.dto';
import { WriteResponse } from 'src/shared/response';
import * as moment from 'moment';
import { TravelDocument } from './entities/travel-documents.entity';
import { TrainingCertificateDTO } from './dto/training-certificate.dto';
import { TrainingCertificate } from './entities/training-certificate.entity';

@Injectable()
export class UserProfileService {
  constructor(
    @InjectRepository(UserProfile)
    private readonly userProfileRepository: Repository<UserProfile>,
    @InjectRepository(TravelDocument)
    private readonly travelDocumentsRepository: Repository<TravelDocument>,
    @InjectRepository(TrainingCertificate)
    private readonly trainingCertificateRepo: Repository<TrainingCertificate>,
  ) {}
  async create(
    createUserProfileDto: CreateUserProfileDto,
    user_id: string,
    req,
  ) {
    try {
      // Validate DOB format
      if (req.user.role !== 'admin') {
        if (
          !moment(createUserProfileDto.dob, moment.ISO_8601, true).isValid()
        ) {
          return WriteResponse(400, {}, 'Invalid datetime format for dob.');
        }
      }

      // Check age >= 18
      // const dobMoment = moment(createUserProfileDto.dob);
      // const age = moment().diff(dobMoment, 'years');
      // if (age < 18) {
      //   return WriteResponse(400, {}, 'User must be at least 18 years old.');
      // }

      const formattedDob = moment(createUserProfileDto.dob).toISOString();

      // Helper to stringify if value exists else null
      const toJson = (val: any) => (val ? JSON.stringify(val) : null);

      const profilePayload = {
        ...createUserProfileDto,
        dob: formattedDob,
        nationalities: toJson(createUserProfileDto.nationalities),
        additional_contact_info: toJson(
          createUserProfileDto.additional_contact_info,
        ),
        // work_experience_info: toJson(createUserProfileDto.work_experience_info),
        education_info: toJson(createUserProfileDto.education_info),
        // course_info: toJson(createUserProfileDto.course_info),
        // certification_info: toJson(createUserProfileDto.certification_info),
        carrier_info: toJson(createUserProfileDto.carrier_info),
        other_experience_info: toJson(
          createUserProfileDto.other_experience_info,
        ),
        project_info: toJson(createUserProfileDto.project_info),
        language_spoken_info: toJson(createUserProfileDto.language_spoken_info),
        contact_person_in_emergency: toJson(createUserProfileDto.contact_person_in_emergency),
        language_written_info: toJson(
          createUserProfileDto.language_written_info,
        ),
        legal_dependent: toJson(
          createUserProfileDto.legal_dependent,
        ),
        notice_period_info: toJson(createUserProfileDto.notice_period_info),
        current_salary_info: toJson(createUserProfileDto.current_salary_info),
        expected_salary_info: toJson(createUserProfileDto.expected_salary_info),
        preferences_info: toJson(createUserProfileDto.preferences_info),
        additional_info: toJson(createUserProfileDto.additional_info),
        vacancy_source_info: toJson(createUserProfileDto.vacancy_source_info),
        created_by: user_id,
        updated_by: user_id,
      };

      const newProfile = this.userProfileRepository.create(profilePayload);

      await this.userProfileRepository.update({ user_id }, newProfile);

 // Check if `travel_documents` is provided in DTO
    if (createUserProfileDto.travel_documents && createUserProfileDto.travel_documents.length > 0) {
      // Loop through each document and insert into the `travel_documents` table
      await Promise.all(
        createUserProfileDto.travel_documents.map(async (doc) => {
          const travelDocumentPayload = {
            ...doc, // assuming `doc` contains the properties of the travel document
            user_id, // Link the travel document to the user's profile
            created_by: user_id,
            updated_by: user_id,
          };
          
          // Insert into `travel_documents` table
          await this.travelDocumentsRepository.save(travelDocumentPayload);
        })
      );
    }

    // Check if `training_certificates` is provided in DTO
    if (createUserProfileDto.training_certificate && createUserProfileDto.training_certificate.length > 0) {
      // Loop through each certificate and insert into the `training_certificates` table
      await Promise.all(
        createUserProfileDto.training_certificate.map(async (certificate) => {
          const trainingCertificatePayload = {
            ...certificate, // assuming `certificate` contains the properties of the training certificate
            user_id, // Link the training certificate to the user's profile
            created_by: user_id,
            updated_by: user_id,
          };
          
          // Insert into `training_certificates` table
          await this.trainingCertificateRepo.save(trainingCertificatePayload);
        })
      );
    }



      return WriteResponse(
        200,
        createUserProfileDto,
        'User profile updated successfully.',
      );
    } catch (error) {
      return WriteResponse(
        500,
        {},
        error.message || 'An unexpected error occurred.',
      );
    }
  }

  async findAll() {
    try {
      const profiles = await this.userProfileRepository.find({
        where: { is_deleted: false },
        order: { created_at: 'DESC' },
      });

      if (profiles.length === 0) {
        return WriteResponse(404, [], 'No user profiles found.');
      }

      return WriteResponse(
        200,
        profiles,
        'User profiles retrieved successfully.',
      );
    } catch (error) {
      return WriteResponse(
        500,
        {},
        error.message || 'An unexpected error occurred.',
      );
    }
  }

  async findOne(userId: string) {
    try {
      const profile = await this.userProfileRepository.findOne({
        where: { user_id: userId, is_deleted: false },
        relations: ['user','rank'],
      });

      if (!profile) {
        return WriteResponse(
          404,
          {},
          `User Profile for the provided user ID not found.`,
        );
      }
      if (profile.user?.userProfile) {
        delete profile.user.userProfile;
        delete profile.user.password;
      }

      const userProfile = profile;

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
        if (userProfile[field] && typeof userProfile[field] === 'string') {
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

      return WriteResponse(
        200,
        profile,
        'User profile retrieved successfully.',
      );
    } catch (error) {
      console.log(error);
      return WriteResponse(
        500,
        {},
        error.message || 'An unexpected error occurred.',
      );
    }
  }

  async remove(id: string) {
    try {
      const profile = await this.findOne(id);
      if (profile.statusCode === 404) {
        return profile;
      }

      profile.data.is_deleted = true;

      await this.userProfileRepository.save(profile.data);

      return WriteResponse(200, {}, 'User profile deleted successfully.');
    } catch (error) {
      return WriteResponse(
        500,
        {},
        error.message || 'An unexpected error occurred.',
      );
    }
  }

    async createTrainingCertificate(trainingCertificateDTO: TrainingCertificateDTO) {
      try {
      
        if (trainingCertificateDTO.id) {
         
          await this.trainingCertificateRepo.update(
            trainingCertificateDTO.id,
            trainingCertificateDTO,
          );
          return WriteResponse(
            200,
            trainingCertificateDTO,
            'Training Certificate updated successfully.',
          );
        } else {
         
          if (trainingCertificateDTO.id === null) {
            delete trainingCertificateDTO.id;
          }
          const trainingType =
            await this.trainingCertificateRepo.save(trainingCertificateDTO);
          return WriteResponse(
            200,
            trainingType,
            'Training Certificate created successfully.',
          );
        }
      } catch (error) {
        console.error(error);
        return WriteResponse(500, false, 'Internal Server Error');
      }
    }
}
