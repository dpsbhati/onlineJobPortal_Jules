import { Injectable } from '@nestjs/common';
import { CreateTravelDocumentsTypeDto } from './dto/create-travel_documents_type.dto';
import { UpdateTravelDocumentsTypeDto } from './dto/update-travel_documents_type.dto';

@Injectable()
export class TravelDocumentsTypeService {
  create(createTravelDocumentsTypeDto: CreateTravelDocumentsTypeDto) {
    return 'This action adds a new travelDocumentsType';
  }

  findAll() {
    return `This action returns all travelDocumentsType`;
  }

  findOne(id: number) {
    return `This action returns a #${id} travelDocumentsType`;
  }

  update(id: number, updateTravelDocumentsTypeDto: UpdateTravelDocumentsTypeDto) {
    return `This action updates a #${id} travelDocumentsType`;
  }

  remove(id: number) {
    return `This action removes a #${id} travelDocumentsType`;
  }
}
