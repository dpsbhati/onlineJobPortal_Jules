import { Injectable, BadRequestException } from '@nestjs/common';
import { join } from 'path';

@Injectable()
export class UploadsService {
  async saveFileDetails(file: Express.Multer.File, body: any) {
    if (!file) {
      throw new BadRequestException('No file provided.');
    }

    // Validate file type (optional)
    const allowedMimeTypes = [
      'application/msword', // .doc
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
      'application/pdf', // .pdf
      'text/plain', // .txt
      'image/png', // .png
      'image/jpeg', // .jpg, .jpeg
    ];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(`Invalid file type: ${file.mimetype}`);
    }

    // Construct public file path
    const filePath = join(
      './public',
      body.folderName || 'default',
      file.filename,
    );

    // Return file details
    return {
      originalName: file.originalname,
      filename: file.filename,
      size: file.size,
      type: file.mimetype,
      path: `${process.env.API_URL}/${filePath}`, // Constructed public URL
      userId: body.userId || 'unknown',
    };
  }
}
