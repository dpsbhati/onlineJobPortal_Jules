import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import {
  CreateNotificationDto
} from './dto/create-notification.dto';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { IPagination, IPaginationSwagger } from 'src/shared/paginationEum';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('notifications')
@ApiTags('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('create')
  create(@Body() createNotificationDto: CreateNotificationDto) {
    return this.notificationsService.create(createNotificationDto);
  }

  @Get('getAll')
  findAll() {
    return this.notificationsService.findAll();
  }

  @Get('getOne/:id')
  findOne(@Param('id') id: string) {
    return this.notificationsService.findOne(id);
  }

  @Post('delete/:id')
  remove(@Param('id') id: string) {
    return this.notificationsService.remove(id);
  }

  @Post('pagination')
  @ApiBody({
    schema: {
      type: 'object',
      properties: IPaginationSwagger,
    },
  })
  async pagination(@Req() req: any, @Body() pagination: IPagination) {
    return this.notificationsService.paginateNotifications(req, pagination);
  }

  @Get('mark-notifications-as-read')
  markReadMultiple(@Req() req) {
    return this.notificationsService.markMultipleAsRead(req.user.id);
  }
}
