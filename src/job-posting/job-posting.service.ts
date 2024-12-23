import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JobPosting } from './entities/job-posting.entity';
import { CreateJobPostingDto } from './dto/create-job-posting.dto';
import { UpdateJobPostingDto } from './dto/update-job-posting.dto';
import { WriteResponse } from 'src/shared/response';

@Injectable()
export class JobPostingService {
  constructor(
    @InjectRepository(JobPosting)
    private jobPostingRepository: Repository<JobPosting>,
  ) { }

  // async create(createJobPostingDto: CreateJobPostingDto): Promise<JobPosting> {
  //   const jobPosting = this.jobPostingRepository.create(createJobPostingDto);
  //   return await this.jobPostingRepository.save(jobPosting);
  // }

  async createOrUpdate(createJobPostingDto: CreateJobPostingDto) {
    try {
      const { id, ...jobDetails } = createJobPostingDto;

      // UPDATE
      if (createJobPostingDto.id) {
        const jobPosting = await this.jobPostingRepository.findOne({
          where: { id: createJobPostingDto.id, is_deleted: false }
        });

        if (!jobPosting) return WriteResponse(404, false, 'Job posting not found');

        await this.jobPostingRepository.update(createJobPostingDto.id, createJobPostingDto);

        const updatedJobPosting = await this.jobPostingRepository.findOne({ where: { id: createJobPostingDto.id } });

        return WriteResponse(200, updatedJobPosting, 'Job posting updated successfully');
      }

      // CREATE

      const newJobPosting = this.jobPostingRepository.create({ is_deleted: false, ...createJobPostingDto });
      await this.jobPostingRepository.save(newJobPosting);
      const jobPostById = await this.jobPostingRepository.findOne({ where: { id: createJobPostingDto.id } });
      return WriteResponse(200, jobPostById, 'Job posting created successfully');
    } catch (error) {
      console.error('Error in createOrUpdate job posting:', error);
      return WriteResponse(500, false, 'Failed to create or update job posting');
    }
  }







  async findAll() {
    const jobPostings = await this.jobPostingRepository.find({
      where: { is_deleted: false },
      order: { created_at: 'DESC' }, // Optional: Order by latest postings
    });

    if (jobPostings.length > 0) {
      return WriteResponse(200, jobPostings);
    }

    return WriteResponse(404, false, 'No job postings found.');
  }

  async findOne(id: string): Promise<any> {
    try {
      const stage = await this.jobPostingRepository.findOne({
        where: {
          id: id,
          is_deleted: false,
        }
      });
      return stage
        ? WriteResponse(200, stage, `Job Posting Found successfully`)
        : WriteResponse(404, null, `Job Posting not found`)
    }
    catch (error) {
      return WriteResponse(500, error, `Something went wrong.`);
    }
  }


  async remove(id: string) {
    if (!id) {
      return WriteResponse(400, false, 'Job posting ID is required.');
    }

    const result = await this.jobPostingRepository.update(id, { is_deleted: true });

    if (result.affected === 0) {
      return WriteResponse(404, false, 'Job posting not found.');
    }

    return WriteResponse(200, true, 'Job posting deleted successfully.');
  }


}
