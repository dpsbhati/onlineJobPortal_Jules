import * as winston from 'winston';
import 'winston-daily-rotate-file';
import { Request } from 'express';

const transport = new winston.transports.DailyRotateFile({
    filename: 'logs/app-error-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxFiles: '14d',
    level: 'error',
});

export const winstonLogger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.printf(({ timestamp, level, message }) => {
            return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
        }),
    ),
    transports: [
        new winston.transports.Console(),
        transport,
    ],
});
