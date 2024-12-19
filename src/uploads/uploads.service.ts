import { Injectable } from '@nestjs/common';
import { join } from 'path';

@Injectable()
export class UploadsService {
  async saveFileDetails(file: Express.Multer.File, body: any) {
    // Construct public file path
    const filePath = join('./public', body.folderName || 'default', file.filename);

    // Save metadata (e.g., in a database or as a return value)
    return {
      originalName: file.originalname,
      filename: file.filename,
      size: file.size,
      path: `${process.env.API_URL}/${filePath}`, 
      userId: body.userId || 'unknown',
    };
  }
}
