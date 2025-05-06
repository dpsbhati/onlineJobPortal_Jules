import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RanksService } from './ranks.service';
import { RanksController } from './ranks.controller';
import { Rank } from './entities/rank.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Rank])],
  controllers: [RanksController],
  providers: [RanksService],
  exports: [RanksService], // Optional if used in another module
})
export class RanksModule {}
