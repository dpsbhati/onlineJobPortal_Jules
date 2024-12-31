import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserProfile } from './entities/user-profile.entity';
import { CreateUserProfileDto } from './dto/create-user-profile.dto';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { WriteResponse } from 'src/shared/response';

@Injectable()
export class UserProfileService {
  constructor(
    @InjectRepository(UserProfile)
    private readonly userProfileRepository: Repository<UserProfile>,
  ) {}

  // Create a new user profile
  async create(createUserProfileDto: CreateUserProfileDto) {
    try {
      const newProfile = this.userProfileRepository.create({
        ...createUserProfileDto,
        created_by: createUserProfileDto.user_id,
        updated_by: createUserProfileDto.user_id,
      });

      const savedProfile = await this.userProfileRepository.save(newProfile);

      return WriteResponse(
        200,
        savedProfile,
        'User profile created successfully.',
      );
    } catch (error) {
      return WriteResponse(
        500,
        {},
        error.message || 'An unexpected error occurred.',
      );
    }
  }

  // Retrieve all user profiles
  async findAll() {
    try {
      const profiles = await this.userProfileRepository.find({
        where: { is_deleted: false },
        order: { created_at: 'DESC' },
      });

      if (profiles.length === 0) {
        return WriteResponse(404, [], 'No user profiles found.');
      }

      return WriteResponse(200, profiles, 'User profiles retrieved successfully.');
    } catch (error) {
      return WriteResponse(
        500,
        {},
        error.message || 'An unexpected error occurred.',
      );
    }
  }

  // Retrieve a single user profile by ID
  async findOne(id: string) {
    try {
      const profile = await this.userProfileRepository.findOne({
        where: { id, is_deleted: false },
      });

      if (!profile) {
        return WriteResponse(
          404,
          {},
          `User Profile with ID ${id} not found.`,
        );
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

  async update(id: string, updateUserProfileDto: UpdateUserProfileDto) {
    try {
      const profile = await this.findOne(id);
      if (profile.statusCode === 404) {
        return profile; 
      }

      Object.assign(profile.data, updateUserProfileDto);

      const updatedProfile = await this.userProfileRepository.save(profile.data);

      return WriteResponse(
        200,
        updatedProfile,
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

  async remove(id: string) {
    try {
      const profile = await this.findOne(id);
      if (profile.statusCode === 404) {
        return profile; 
      }

      profile.data.is_deleted = true;

      await this.userProfileRepository.save(profile.data);

      return WriteResponse(
        200,
        {},
        'User profile deleted successfully.',
      );
    } catch (error) {
      return WriteResponse(
        500,
        {},
        error.message || 'An unexpected error occurred.',
      );
    }
  }
}
