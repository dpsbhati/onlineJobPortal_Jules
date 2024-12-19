import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { QueryFailedError } from 'typeorm';

@Catch(QueryFailedError)
export class QueryFailedExceptionFilter implements ExceptionFilter {
  catch(exception: QueryFailedError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    let message = exception.message;
    
    // Check if driverError exists and its code
    if (exception.driverError && exception.driverError['code'] === 'ER_DUP_ENTRY') {
      message = 'Duplicate entry exists.';
    } else if (exception.driverError && exception.driverError['code'] === 'ER_PARSE_ERROR') {
      message = 'Something went wrong.';
    }

    response
      .status(HttpStatus.BAD_REQUEST)
      .json({
        statusCode: HttpStatus.BAD_REQUEST,
        message: message,
        timestamp: new Date().toISOString(),
        path: request.url,
        method: request.method,
      });
  }
}
