import {
  Controller,
  Post,
  Body,
  Res,
  UploadedFile,
  UseInterceptors,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiConsumes,
  ApiBody,
  ApiResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { join, extname } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { Response } from 'express';
import { UploadsService } from './uploads.service';

@ApiTags('uploads')
@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post('files')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, callback) => {
          const folderName = req.body.folderName || 'default';
          const uploadPath = join('./public', folderName);

          if (!existsSync(uploadPath)) {
            mkdirSync(uploadPath, { recursive: true });
          }

          callback(null, uploadPath);
        },
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, callback) => {
        const allowedMimeTypes = [
          'image/jpeg',
          'image/png',
          'video/mp4',
          'application/msword', // .doc
          'application/pdf', // .doc
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
        ];

        if (!allowedMimeTypes.includes(file.mimetype)) {
          return callback(
            new Error(`Unsupported file type: ${file.mimetype}`),
            false,
          );
        }
        callback(null, true);
      },
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    }),
  )
  @ApiOperation({ summary: 'Upload a file to a specific folder' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        folderName: {
          type: 'string',
          description: 'Folder where the file will be uploaded',
        },
        file: {
          type: 'string',
          format: 'binary',
          description: 'File to upload',
        },
        userId: {
          type: 'string',
          description: 'User ID associated with the file',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'File uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request or missing file' })
  @ApiResponse({ status: 500, description: 'Error uploading file' })
  async uploadFile(
    @Body() body: any,
    @Res() res: Response,
    @UploadedFile() file: Express.Multer.File,
  ) {
    try {
      if (!file) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'File is missing',
        });
      }
      const fileDetails = await this.uploadsService.saveFileDetails(file, body);
      return res.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        message: 'File uploaded successfully',
        data: fileDetails,
      });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error uploading file',
        error: error.message,
      });
    }
  }
}
