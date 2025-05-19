import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserProfile } from './entities/user-profile.entity';
import { CreateUserProfileDto } from './dto/create-user-profile.dto';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { WriteResponse } from 'src/shared/response';
import * as moment from 'moment';
import { CareerInfo } from './entities/career-info.entity';

@Injectable()
export class UserProfileService {
  constructor(
    @InjectRepository(UserProfile)
    private readonly userProfileRepository: Repository<UserProfile>,
    @InjectRepository(CareerInfo)
    private readonly careerInfoRepository: Repository<CareerInfo>,
  ) { }

  async create(createUserProfileDto: CreateUserProfileDto, user_id:string) {
    try {
      const isValidDob = moment(
        createUserProfileDto.dob,
        moment.ISO_8601,
        true,
      ).isValid();
      if (!isValidDob) {
        return WriteResponse(
          400,
          {},
          'Invalid datetime format for dob. Expected ISO 8601 format.',
        );
      }

      const formattedDob = moment(createUserProfileDto.dob).toISOString();

      const newProfile = this.userProfileRepository.create({
        ...createUserProfileDto,
        dob: formattedDob,
        nationalities: JSON.stringify(createUserProfileDto.nationalities),
        additional_contact_info: JSON.stringify(createUserProfileDto.additional_contact_info),
        created_by: user_id,
        updated_by: user_id,
      });


      const updatedProfile = await this.userProfileRepository.update(
        { user_id: user_id },
        newProfile 
      );

      if (createUserProfileDto.career_info && Array.isArray(createUserProfileDto.career_info)) {
        // Map each career_info item to add user_id
        const careerInfoEntities = createUserProfileDto.career_info.map((item) => {
          return {
            ...item,
            user_id: user_id, // assign user_id here
          };
        });
  
        // Save all career info objects in careerInfoRepository (bulk save if supported)
        await this.careerInfoRepository.save(careerInfoEntities);
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
        relations: ['user'],
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

      return WriteResponse(
        200,
        profile,
        'User profile retrieved successfully.',
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
}
