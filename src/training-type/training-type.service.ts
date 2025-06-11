// training-type.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { TrainingType } from './entities/training-type.entity';
import { CreateTrainingTypeDto } from './dto/create-training-type.dto';
import { WriteResponse } from 'src/shared/response';

@Injectable()
export class TrainingTypeService {
  constructor(
    @InjectRepository(TrainingType)
    private readonly trainingTypeRepository: Repository<TrainingType>, // This injects the repository
  ) {}

  async create(trainingTypeDto: CreateTrainingTypeDto) {
    try {
      const existingByName = await this.trainingTypeRepository.findOne({
        where: {
          name: trainingTypeDto.name,
          is_deleted: false,
        },
      });
      if (trainingTypeDto.id) {
        const existingTrainingType = await this.trainingTypeRepository.findOne({
          where: { id: trainingTypeDto.id, is_deleted: false },
        });
        if (!existingTrainingType) {
          return WriteResponse(404, false, 'Training Type not found.');
        }
        if (existingByName && existingByName.id !== trainingTypeDto.id) {
          return WriteResponse(
            400,
            false,
            'Training Type name already exists.',
          );
        }
        await this.trainingTypeRepository.update(
          trainingTypeDto.id,
          trainingTypeDto,
        );
        return WriteResponse(
          200,
          trainingTypeDto,
          'Training Type updated successfully.',
        );
      } else {
        if (existingByName) {
          return WriteResponse(
            400,
            false,
            'Training Type name already exists.',
          );
        }
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
      return WriteResponse(500, false, 'Internal Server Error');
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
    try {
      let data = await this.trainingTypeRepository.findOne({
        where: { id: id, is_deleted: false },
      });
      if (data) {
        return WriteResponse(200, data, 'Data found successfully');
      } else {
        return WriteResponse(400, false, 'Data not found!');
      }
    } catch (error) {
      console.log(error);
      return WriteResponse(500, false, `Something went wrong.`);
    }
  }

  async remove(id: string) {
    try {
      var data = await this.trainingTypeRepository.findOne({
        where: { id: id, is_deleted: false },
      });
      if (data) {
        await this.trainingTypeRepository.update(data.id, { is_deleted: true });
        return WriteResponse(200, true, 'Data deleted successfully');
      } else {
        return WriteResponse(404, false, 'Data not found!');
      }
    } catch (error) {
      console.log(error);
      return WriteResponse(500, false, `Something went wrong.`);
    }
  }
}
