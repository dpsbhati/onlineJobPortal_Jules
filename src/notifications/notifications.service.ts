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

  // create a notification
  async create(createNotificationDto: CreateNotificationDto) {
    try {
      const notification = await this.notificationRepository.save(
        createNotificationDto,
      );
      return WriteResponse(
        200,
        notification,
        'Notification created successfully.',
      );
    } catch (error) {
      console.log(error);
      return WriteResponse(500, false, 'Something went wrong.');
    }
  }

  // get all notifications
  async findAll() {
    try {
      const notifications = await this.notificationRepository.find({
        where: { is_deleted: false },
      });
      if (notifications.length === 0) {
        return WriteResponse(404, [], 'No notifications found.');
      }
      return WriteResponse(
        200,
        notifications,
        'Notifications retrieved successfully.',
      );
    } catch (error) {
      console.log(error);
      return WriteResponse(500, false, 'Something went wrong.');
    }
  }

  // get single notification
  async findOne(id: string) {
    try {
      const notification = await this.notificationRepository.findOne({
        where: { id: id, is_deleted: false },
      });

      if (!notification) {
        return WriteResponse(404, {}, 'Notification not found');
      }
      return WriteResponse(
        200,
        notification,
        'Notification retrieved successfully.',
      );
    } catch (error) {
      console.log(error);
      return WriteResponse(500, false, 'Something went wrong.');
    }
  }

  // delete a notification
  async remove(id: string) {
    try {
      const notification = await this.notificationRepository.findOne({
        where: { id: id, is_deleted: false },
      });
      if (!notification) {
        return WriteResponse(404, {}, 'Notification not found');
      }

      const result = await this.notificationRepository.update(id, {
        is_deleted: true,
      });

      return WriteResponse(200, true, 'Notification deleted successfully.');
    } catch (error) {
      console.log(error);
      return WriteResponse(500, false, 'Something went wrong.');
    }
  }

  // get paginated notifications
  async paginateNotifications(req: any, pagination: IPagination) {
    try {
      let { curPage = 1, perPage = 10, whereClause } = pagination;

      // Basic where condition for non-deleted records
      let parameters: Record<string, any> = { is_deleted: false };

      // Fields to be searched
      const fieldsToSearch = ['subject', 'content'];

      let queryBuilder = this.notificationRepository
        .createQueryBuilder('app')
        .where('app.is_deleted = :is_deleted', parameters); // Base query for non-deleted records

      // Handle individual field searches
      if (Array.isArray(whereClause)) {
        whereClause.forEach((p) => {
          const fieldValue = p.value;
          if (fieldsToSearch.includes(p.key) && fieldValue) {
            queryBuilder.andWhere(`${p.key} LIKE :${p.key}_search`, {
              [`${p.key}_search`]: `%${fieldValue}%`,
            });
          }
        });

        // Handle global search across multiple fields
        const allValues = whereClause.find((p) => p.key === 'all')?.value;
        if (allValues) {
          const searchConditions = fieldsToSearch
            .map((field) => `${field} LIKE :all_search`)
            .join(' OR ');
          queryBuilder.andWhere(`(${searchConditions})`, {
            all_search: `%${allValues}%`,
          });
        }
      }

      const user_id = whereClause.find(
        (p: any) => p.key === 'user_id' && p.value,
      );

      if (user_id) {
        queryBuilder.andWhere('app.user_id = :user_id', {
          user_id: user_id.value,
        });
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

  async markMultipleAsRead(userId: any) {
    try {
      // Fetch only the ids (array of objects)
      const notificationObjects = await this.notificationRepository.find({
        where: { is_read: false, is_deleted: false, user_id: userId },
        select: ['id'],
      });

      // Extract the ids into an array of strings
      const notificationIds = notificationObjects.map((n) => n.id);

      if (notificationIds.length === 0) {
        // No notifications to update
        return WriteResponse(200, true, 'No unread notifications found.');
      }

      await this.notificationRepository
        .createQueryBuilder()
        .update(Notification)
        .set({ is_read: true })
        .where('id IN (:...ids)', { ids: notificationIds })
        .andWhere('user_id = :userId', { userId })
        .execute();

      return WriteResponse(
        200,
        true,
        'Notifications marked as read successfully.',
      );
    } catch (error) {
      console.log(error);
      return WriteResponse(500, {}, 'Something went wrong.');
    }
  }
}
