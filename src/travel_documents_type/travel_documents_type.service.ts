import { Injectable } from '@nestjs/common';
import { CreateTravelDocumentsTypeDto } from './dto/create-travel_documents_type.dto';
import { WriteResponse } from 'src/shared/response';
import { TravelDocumentsType } from './entities/travel_documents_type.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class TravelDocumentsTypeService {
  constructor(
    @InjectRepository(TravelDocumentsType)
    private readonly traveleRepository: Repository<TravelDocumentsType>, // This injects the repository
  ) {}
  async create(createTravelDocumentsTypeDto: CreateTravelDocumentsTypeDto) {
    try {
      const existingByName = await this.traveleRepository.findOne({
        where: {
          name: CreateTravelDocumentsTypeDto.name,
          is_deleted: false,
        },
      });
      if (CreateTravelDocumentsTypeDto.id) {
        const existingTrainingType = await this.traveleRepository.findOne({
          where: { id: CreateTravelDocumentsTypeDto.id, is_deleted: false },
        });
        if (!existingTrainingType) {
          return WriteResponse(404, false, 'Training Type not found.');
        }
        if (
          existingByName &&
          existingByName.id !== CreateTravelDocumentsTypeDto.id
        ) {
          return WriteResponse(
            400,
            false,
            'Training Type name already exists.',
          );
        }
        await this.traveleRepository.update(
          CreateTravelDocumentsTypeDto.id,
          CreateTravelDocumentsTypeDto,
        );
        return WriteResponse(
          200,
          CreateTravelDocumentsTypeDto,
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
        if (CreateTravelDocumentsTypeDto.id === null) {
          delete CreateTravelDocumentsTypeDto.id;
        }
        const trainingType = await this.traveleRepository.save(
          CreateTravelDocumentsTypeDto,
        );
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
      const data = await this.traveleRepository.find({
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
    let data = await this.traveleRepository.findOne({
      where: { id: id, is_deleted: false },
    });
    if (data) {
      return WriteResponse(200, data, 'Data found successfully');
    } else {
      return WriteResponse(400, false, 'Data not found!');
    }
  }

  async remove(id: string) {
    var data = await this.traveleRepository.findOne({
      where: { id: id, is_deleted: false },
    });
    if (data) {
      await this.traveleRepository.update(data.id, { is_deleted: true });
      return WriteResponse(200, true, 'Data deleted successfully');
    } else {
      return WriteResponse(404, false, 'Data not found!');
    }
  }
}
