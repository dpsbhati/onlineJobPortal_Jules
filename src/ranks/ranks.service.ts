import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rank } from './entities/rank.entity';
import { CreateRankDto } from './dto/create-rank.dto';
import { UpdateRankDto } from './dto/update-rank.dto';
import { write } from 'fs';
import { paginateResponse, WriteResponse } from 'src/shared/response';

@Injectable()
export class RanksService {
  constructor(
    @InjectRepository(Rank)
    private readonly rankRepo: Repository<Rank>,
  ) {}

  async create(createRankDtos: CreateRankDto[]) {
    try {
      // Filter only valid records (id is 0 or not present)
      const validNewRanks = createRankDtos
        .filter((dto) => !dto.id || dto.id === undefined)
        .map((dto) => ({ rank_name: dto.rank_name }));

      if (validNewRanks.length === 0) {
        return WriteResponse(400, [], 'No valid records to insert');
      }

      // Save all at once (single DB hit)
      const inserted = await this.rankRepo.save(validNewRanks);

      return WriteResponse(200, inserted, 'Records created successfully');
    } catch (error) {
      console.error('Bulk create error:', error);
      return WriteResponse(
        500,
        false,
        'Something went wrong while inserting records',
      );
    }
  }

  async findAll() {
    try {
      const data = await this.rankRepo.find({
        where: { is_deleted: false },
      });
      if (data.length > 0) {
        return WriteResponse(200, data, 'Record found sucessfully');
      } else {
        return WriteResponse(404, false, 'Record not found');
      }
    } catch (error) {
      console.log(error);
      return WriteResponse(500, false, 'Something went wrong');
    }
  }

  async findOne(id: string) {
    let data = await this.rankRepo.findOne({
      where: { id: id, is_deleted: false },
    });
    if (data) {
      return WriteResponse(200, data, 'Data found successfully');
    } else {
      return WriteResponse(400, false, 'Data not found!');
    }
  }

  async remove(id: string) {
    if (!id) {
      return WriteResponse(400, false, 'Rank ID is required.');
    }
    const result = await this.rankRepo.update(id, {
      is_deleted: true,
    });

    return WriteResponse(200, true, 'Rank deleted successfully.');
  }

  async pagination(IPagination, req) {
    let { curPage, perPage, sortBy } = IPagination;
    let skip = (curPage - 1) * perPage;
    let all = IPagination.whereClause.find((i) => i.key == 'all' && i.value);
    let lwhereClause = `f.is_deleted = false`;
    if (all) {
      lwhereClause += ` and f.rank_name like '%${all.value}%'`;
    }
    let [data, count] = await this.rankRepo
      .createQueryBuilder('f')
      .where(lwhereClause)
      .skip(skip)
      .take(perPage)
      .orderBy('f.created_at', 'DESC')
      .getManyAndCount();
    if (data.length > 0) {
      return paginateResponse(data, count);
    } else {
      return WriteResponse(400, false, 'Data not found!');
    }
  }
}
