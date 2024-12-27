import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserProfileDto } from './dto/create-user-profile.dto';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UserProfile } from './entities/user-profile.entity';

@Injectable()
export class UserProfileService {
  constructor(
    @InjectRepository(UserProfile)
    private readonly userProfileRepository: Repository<UserProfile>,
  ) {}

  async create(createUserProfileDto: CreateUserProfileDto) {
    const newProfile = this.userProfileRepository.create(createUserProfileDto);
    return this.userProfileRepository.save(newProfile);
  }

  async findAll(user_id: string) {
    return this.userProfileRepository.find({ where: { user_id, is_deleted: false } });
  }

  async findOne(id: string, user_id: string) {
    const profile = await this.userProfileRepository.findOne({ where: { id, user_id, is_deleted: false } });
    if (!profile) {
      throw new NotFoundException(`UserProfile with ID ${id} not found`);
    }
    return profile;
  }

  async update(id: string, updateUserProfileDto: UpdateUserProfileDto) {
    const profile = await this.findOne(id, updateUserProfileDto.user_id);
    Object.assign(profile, updateUserProfileDto);
    return this.userProfileRepository.save(profile);
  }

  async remove(id: string, user_id: string) {
    const profile = await this.findOne(id, user_id);
    profile.is_deleted = true;
    return this.userProfileRepository.save(profile);
  }
}
