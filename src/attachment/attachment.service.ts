import { Injectable } from '@nestjs/common';
import { CreateAttachmentDto } from './dto/create-attachment.dto';
import { UpdateAttachmentDto } from './dto/update-attachment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Attachment } from './entities/attachment.entity';
import { Repository } from 'typeorm';
import { Users } from 'src/user/entities/user.entity';

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
      });
      const savedAttachment = await this.attachmentRepository.save(newAttachment);
      return { status: 201, message: 'Attachment created successfully', data: savedAttachment };
    } catch (error) {
      console.error('Error creating attachment:', error.message);
      return { status: 500, message: 'Failed to create attachment', error: error.message };
    }
  }
  
  async findAll() {
    try {
      const attachments = await this.attachmentRepository.find({
        where: [{ is_deleted: false }, { is_deleted: null }], // Include null for legacy rows
      });
      return { status: 200, message: 'Attachments retrieved successfully', data: attachments };
    } catch (error) {
      console.error('Error fetching attachments:', error.message);
      return { status: 500, message: 'Failed to fetch attachments', error: error.message };
    }
  
  }
  async findOne(id: string) {
    try {
      const attachment = await this.attachmentRepository.findOne({
        where: { id, is_deleted: false },
      });

      if (!attachment) {
        return { status: 404, message: `Attachment with ID ${id} not found`, data: null };
      }

      return { status: 200, message: 'Attachment retrieved successfully', data: attachment };
    } catch (error) {
      console.error('Error fetching attachment:', error.message);
      return { status: 500, message: 'Failed to fetch attachment', error: error.message };
    }
  }

  async update(id: string, updateAttachmentDto: UpdateAttachmentDto, userId: string) {
    try {
      const attachment = await this.attachmentRepository.findOne({
        where: { id, is_deleted: false },
      });

      if (!attachment) {
        return { status: 404, message: `Attachment with ID ${id} not found`, data: null };
      }

      const updatedAttachment = await this.attachmentRepository.save({
        ...attachment,
        ...updateAttachmentDto,
        updated_by: userId,
      });

      return { status: 200, message: 'Attachment updated successfully', data: updatedAttachment };
    } catch (error) {
      console.error('Error updating attachment:', error.message);
      return { status: 500, message: 'Failed to update attachment', error: error.message };
    }
  }

  async remove(id: string, userId: string) {
    try {
      const attachment = await this.attachmentRepository.findOne({
        where: { id, is_deleted: false },
      });

      if (!attachment) {
        return { status: 404, message: `Attachment with ID ${id} not found`, data: null };
      }

      attachment.is_deleted = true;
      attachment.updated_by = userId;
      await this.attachmentRepository.save(attachment);
      
      return { status: 200, message: 'Attachment deleted successfully', data: attachment };
    } catch (error) {
      console.error('Error deleting attachment:', error.message);
      return { status: 500, message: 'Failed to delete attachment', error: error.message };
    }
  }
  async getApplicationDetailsById(applicationId: string) {
    if (!applicationId) {
      return { status: 400, message: 'Application ID is required', data: {} };
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
        return {
          status: 404,
          message: 'No attachments found for the given application ID',
          data: {},
        };
      }
  
      // Fetch user details
      const user = await this.userRepository.findOne({
        where: { id: applicationId, is_deleted: false },
      });
  
      if (!user) {
        return {
          status: 404,
          message: 'User not found for the given application ID',
          data: {},
        };
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
  
      return {
        status: 200,
        message: 'Application details retrieved successfully',
        data: response,
      };
    } catch (error) {
      console.error('Error fetching application details:', error.message);
      return {
        status: 500,
        message: 'Internal server error',
        data: {},
      };
    }
  }
}
