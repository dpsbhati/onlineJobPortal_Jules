import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AttachmentService } from './attachment.service';
import { CreateAttachmentDto } from './dto/create-attachment.dto';
import { UpdateAttachmentDto } from './dto/update-attachment.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';


@ApiTags('attachment')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('attachment')
export class AttachmentController {
  constructor(private readonly attachmentService: AttachmentService) {}

  
  @Post("create-attachment")
  create(@Body() createAttachmentDto: CreateAttachmentDto, @Req() req: any) {
    const userId = req.user.id; // Assume user ID is available in the request
    return this.attachmentService.create(createAttachmentDto, userId);
  }
  
  @Get("get-all")
  findAll() {
    return this.attachmentService.findAll();
  }
  
  @Get('get-one')
  findOne(@Param('id') id: string) {
    return this.attachmentService.findOne(id);
  }

  @Post(':id')
  update(
    @Param('id') id: string,
    @Body() updateAttachmentDto: UpdateAttachmentDto,
    @Req() req: any,
  ) {
    const userId = req.user.id;
    return this.attachmentService.update(id, updateAttachmentDto, userId);
  }

  @Post(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    const userId = req.user.id;
    return this.attachmentService.remove(id, userId);
  }

  @Get('application/:applicationId')
  async getApplicationDetails(@Param('applicationId') applicationId: string) {
    return this.attachmentService.getApplicationDetailsById(applicationId);
  }
}
