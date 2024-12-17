import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JobPosting } from './entities/job-posting.entity';
import { CreateJobPostingDto } from './dto/create-job-posting.dto';
import { UpdateJobPostingDto } from './dto/update-job-posting.dto';

@Injectable()
export class JobPostingService {
  constructor(
    @InjectRepository(JobPosting)
    private jobPostingRepository: Repository<JobPosting>,
  ) {}

  async create(createJobPostingDto: CreateJobPostingDto): Promise<JobPosting> {
    const jobPosting = this.jobPostingRepository.create(createJobPostingDto);
    return await this.jobPostingRepository.save(jobPosting);
  }

  async findAll(): Promise<JobPosting[]> {
    return await this.jobPostingRepository.find();
  }

  async findOne(id: number): Promise<JobPosting> {
    return await this.jobPostingRepository.findOne(id);
  }

    async update(
    id: number,
    updateJobPostingDto: UpdateJobPostingDto,
  ): Promise<JobPosting> {
    const jobPosting = await this.jobPostingRepository.findOne(id);
    if (!jobPosting) {
      throw new Error('Job posting not found');
    }
    Object.assign(jobPosting, updateJobPostingDto);
    return await this.jobPostingRepository.save(jobPosting);
  }

  async remove(id): Promise<void> {
    const jobPosting = await this.jobPostingRepository.findOne(id);
    if (!jobPosting) {
      throw new Error('Job posting not found');
    }
    await this.jobPostingRepository.remove(jobPosting);
  }
}
