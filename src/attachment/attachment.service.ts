import { Injectable } from '@nestjs/common';
import { CreateAttachmentDto } from './dto/create-attachment.dto';
import { UpdateAttachmentDto } from './dto/update-attachment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Attachment } from './entities/attachment.entity';
import { Repository } from 'typeorm';
import { Users } from 'src/user/entities/user.entity';
import { WriteResponse } from 'src/shared/response';

@Injectable()
export class AttachmentService {
  constructor(
    @InjectRepository(Attachment)
    private readonly attachmentRepository: Repository<Attachment>,
    @InjectRepository(Users)
    private readonly userRepository: Repository<Users>,
  ) {}


  async create(createAttachmentDto: CreateAttachmentDto, userId: string) {
    try {
      const newAttachment = this.attachmentRepository.create({
        ...createAttachmentDto,
        created_by: userId,
        updated_by: userId,
        is_deleted: false,
      });
  
      console.log('Before Save:', newAttachment);
  
      const savedAttachment = await this.attachmentRepository.save(newAttachment);
  
      console.log('After Save:', savedAttachment);
  
      return WriteResponse(201, savedAttachment, 'Attachment created successfully');
    } catch (error) {
      console.error('Error creating attachment:', error.message);
      return WriteResponse(500, {}, 'Failed to create attachment');
    }
  }
  
  async findAll() {
    try {
      const attachments = await this.attachmentRepository.find({
        where: [{ is_deleted: false }, { is_deleted: null }], // Include null for legacy rows
      });
  
      if (attachments.length === 0) {
        return WriteResponse(404, [], 'No attachments found.');
      }
  
      return WriteResponse(200, attachments, 'Attachments retrieved successfully.');
    } catch (error) {
      console.error('Error fetching attachments:', error.message);
      return WriteResponse(500, {}, 'Failed to fetch attachments.');
    }
  }
  
  async findOne(id: string) {
    try {
      const attachment = await this.attachmentRepository.findOne({
        where: { id, is_deleted: false },
      });
  
      if (!attachment) {
        return WriteResponse(404, {}, `Attachment with ID ${id} not found`);
      }
  
      return WriteResponse(200, attachment, 'Attachment retrieved successfully');
    } catch (error) {
      console.error('Error fetching attachment:', error.message);
      return WriteResponse(500, {}, 'Failed to fetch attachment.');
    }
  }
  
  async update(id: string, updateAttachmentDto: UpdateAttachmentDto, userId: string) {
    try {
      const attachment = await this.attachmentRepository.findOne({
        where: { id, is_deleted: false },
      });
  
      if (!attachment) {
        return WriteResponse(404, {}, `Attachment with ID ${id} not found`);
      }
  
      const updatedAttachment = await this.attachmentRepository.save({
        ...attachment,
        ...updateAttachmentDto,
        updated_by: userId,
      });
  
      return WriteResponse(200, updatedAttachment, 'Attachment updated successfully');
    } catch (error) {
      console.error('Error updating attachment:', error.message);
      return WriteResponse(500, {}, 'Failed to update attachment.');
    }
  }
  
  async remove(id: string, userId: string) {
    try {
      const attachment = await this.attachmentRepository.findOne({
        where: { id, is_deleted: false },
      });
  
      if (!attachment) {
        return WriteResponse(404, {}, `Attachment with ID ${id} not found`);
      }
  
      attachment.is_deleted = true;
      attachment.updated_by = userId;
      await this.attachmentRepository.save(attachment);
  
      return WriteResponse(200, attachment, 'Attachment deleted successfully');
    } catch (error) {
      console.error('Error deleting attachment:', error.message);
      return WriteResponse(500, {}, 'Failed to delete attachment.');
    }
  }
  
  async getApplicationDetailsById(applicationId: string) {
    if (!applicationId) {
      return WriteResponse(400, {}, 'Application ID is required');
    }
  
    try {
      // Fetch attachments and join with CoursesAndCertification
      const attachments = await this.attachmentRepository
        .createQueryBuilder('attachment')
        .leftJoinAndSelect(
          'courses_and_certification',
          'courses',
          'attachment.user_id = courses.created_by', // Replace with the appropriate column for the logical link
        )
        .where('attachment.user_id = :applicationId', { applicationId })
        .andWhere('attachment.is_deleted = false')
        .select([
          'attachment.attachment_details',
          'attachment.file_path',
          'courses.organization_name', // Select organization_name from courses_and_certification
        ])
        .getRawMany();
  
      if (attachments.length === 0) {
        return WriteResponse(404, {}, 'No attachments found for the given application ID');
      }
  
      // Fetch user details
      const user = await this.userRepository.findOne({
        where: { id: applicationId, is_deleted: false },
      });
  
      if (!user) {
        return WriteResponse(404, {}, 'User not found for the given application ID');
      }
  
      // Prepare response
      const response = {
        user_id: user.id,
        email: user.email,
        attachments: attachments.map((attachment) => ({
          attachment_details: attachment.attachment_details,
          file_path: attachment.file_path,
          organization_name: attachment.organization_name,
        })),
      };
  
      return WriteResponse(200, response, 'Application details retrieved successfully');
    } catch (error) {
      console.error('Error fetching application details:', error.message);
      return WriteResponse(500, {}, 'Internal server error');
    }
  }
  
}
