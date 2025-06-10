import { PartialType } from '@nestjs/swagger';
import { CreateTrainingTypeDto } from './create-training-type.dto';

export class UpdateTrainingTypeDto extends PartialType(CreateTrainingTypeDto) {}
