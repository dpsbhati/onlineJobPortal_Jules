import { Injectable } from '@nestjs/common';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Notification } from './entities/notification.entity';
import { paginateResponse, WriteResponse } from 'src/shared/response';
import { IPagination } from 'src/shared/paginationEum';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
  ) {}
  async create(createNotificationDto: CreateNotificationDto) {
   try {
const notification = await this.notificationRepository.save(createNotificationDto)
    return WriteResponse(200, notification, 'Notification created successfully.');
   } catch (error) {
    console.log(error);
   }
  }

  findAll() {
    return `This action returns all notifications`;
  }

  findOne(id: number) {
    return `This action returns a #${id} notification`;
  }

  update(id: number, updateNotificationDto: UpdateNotificationDto) {
    return `This action updates a #${id} notification`;
  }

  remove(id: number) {
    return `This action removes a #${id} notification`;
  }

  async paginateNotifications(req: any, pagination: IPagination) {
    try {
      const { curPage = 1, perPage = 10, whereClause } = pagination;
  
      // Basic where condition for non-deleted records
      const parameters: Record<string, any> = { is_deleted: false };
  
      // Fields to be searched
      const fieldsToSearch = [
       'subject','content','status','jobTitle','application_id'
      ];
  
      let queryBuilder = this.notificationRepository.createQueryBuilder('app')
        .where('app.is_deleted = :is_deleted', parameters);  // Base query for non-deleted records
  
      // Handle individual field searches
      if (Array.isArray(whereClause)) {
        whereClause.forEach((p) => {
          const fieldValue = p.value;
          if (fieldsToSearch.includes(p.key) && fieldValue) {
            queryBuilder.andWhere(`${p.key} LIKE :${p.key}_search`, { [`${p.key}_search`]: `%${fieldValue}%` });
          }
        });
  
        // Handle global search across multiple fields
        const allValues = whereClause.find((p) => p.key === 'all')?.value;
        if (allValues) {
          const searchConditions = fieldsToSearch
            .map((field) => `${field} LIKE :all_search`)
            .join(' OR ');
          queryBuilder.andWhere(`(${searchConditions})`, { all_search: `%${allValues}%` });
        }
      }
  
      // Pagination setup
      const skip = (curPage - 1) * perPage;
  
      // Execute query and get the paginated result
      const [list, totalCount] = await queryBuilder
        .skip(skip)
        .take(perPage)
        .orderBy('app.created_at', 'DESC')
        .getManyAndCount();
  
      // If no records found
      if (!list.length) {
        return WriteResponse(404, [], 'No records found.');
      }
  
      // Return paginated response
      return paginateResponse(list, totalCount, curPage, perPage);
  
    } catch (error) {
      console.error('Pagination Error --> ', error);
      return WriteResponse(500, {}, 'Something went wrong.');
    }
  }
  
}
