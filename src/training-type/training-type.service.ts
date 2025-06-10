// training-type.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TrainingType } from './entities/training-type.entity';
import { CreateTrainingTypeDto } from './dto/create-training-type.dto';
import { WriteResponse } from 'src/shared/response';

@Injectable()
export class TrainingTypeService {
  constructor(
    @InjectRepository(TrainingType)
    private readonly trainingTypeRepository: Repository<TrainingType>, // This injects the repository
  ) {}

  // Create
  async create(trainingTypeDto: CreateTrainingTypeDto) {
    try {
      // Check if 'id' exists, indicating an update operation
      if (trainingTypeDto.id) {
        // Retrieve the entity by its id
        const existingTrainingType = await this.trainingTypeRepository.findOne({
          where: { id: trainingTypeDto.id, is_deleted: false }, // Find by 'id' only
        });

        if (!existingTrainingType) {
          throw new Error('Training type not found');
        }

        // Update the entity with the new data
        const updatedTrainingType = await this.trainingTypeRepository.update(
          existingTrainingType.id,
          trainingTypeDto,
        );

        return WriteResponse(
          200,
          trainingTypeDto,
          'Training Type updated successfully.',
        );
      } else {
        // If no 'id' exists, it's a new entity creation
        if (trainingTypeDto.id === null) {
          delete trainingTypeDto.id;
        }
        const trainingType =
          await this.trainingTypeRepository.save(trainingTypeDto);

        return WriteResponse(
          200,
          trainingType,
          'Training Type created successfully.',
        );
      }
    } catch (error) {
      console.error(error);
      return WriteResponse(500, false, 'Internal Server Error'); // Return a generic error response
    }
  }

  async findAll() {
    try {
      const data = await this.trainingTypeRepository.find({
        where: { is_deleted: false },
      });
      if (data) {
        return WriteResponse(200, data, 'Data found successfully');
      } else {
        return WriteResponse(400, false, 'Data not found!');
      }
    } catch (error) {
      console.log(error);
      return WriteResponse(500, false, 'Something Went Wrong.');
    }
  }

  async findOne(id: string) {
    let data = await this.trainingTypeRepository.findOne({
      where: { id: id, is_deleted: false },
    });
    if (data) {
      return WriteResponse(200, data, 'Data found successfully');
    } else {
      return WriteResponse(400, false, 'Data not found!');
    }
  }

  async remove(id: string) {
    var data = await this.trainingTypeRepository.findOne({
      where: { id: id, is_deleted: false },
    });
    if (data) {
      await this.trainingTypeRepository.update(data.id, { is_deleted: true });
      return WriteResponse(200, true, 'Data deleted successfully');
    } else {
      return WriteResponse(404, false, 'Data not found!');
    }
  }
}
