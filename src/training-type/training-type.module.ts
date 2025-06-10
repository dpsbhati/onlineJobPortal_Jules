// training-type.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrainingType } from './entities/training-type.entity';
import { TrainingTypeService } from './training-type.service';
import { TrainingTypeController } from './training-type.controller';

@Module({
  imports: [TypeOrmModule.forFeature([TrainingType])], // Register the entity here
  providers: [TrainingTypeService],
  controllers: [TrainingTypeController],
})
export class TrainingTypeModule {}
