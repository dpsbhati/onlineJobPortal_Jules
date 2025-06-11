import { PartialType } from '@nestjs/mapped-types';
import { CreateTravelDocumentsTypeDto } from './create-travel_documents_type.dto';

export class UpdateTravelDocumentsTypeDto extends PartialType(CreateTravelDocumentsTypeDto) {}
