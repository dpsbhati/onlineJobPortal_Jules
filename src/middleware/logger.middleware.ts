// // logger.middleware.ts

import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { winstonLogger } from './winston-logger';


@Injectable() export class LoggerMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction) {
        const { method, originalUrl, body, headers } = req; const userAgent = headers['user-agent'] || 'unknown';

        // Log Request
        winstonLogger.info(`${method} ${originalUrl} - UA: ${userAgent}`);

        // Attach error handler to response
        const originalSend = res.send;
        res.send = function (body?: any): Response {
            if (res.statusCode >= 400) {
                winstonLogger.error(`Error ${res.statusCode} on ${method} ${originalUrl} - Body: ${JSON.stringify(body)}`);
            }
            return originalSend.call(this, body);
        };
        next();
    }
}







// import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
// // import { Request, Response, NextFunction } from 'express';
// // import { WriteResponse } from 'src/shared/response';

// @Injectable()
// export class LoggerMiddleware implements NestMiddleware {
//     private readonly logger = new Logger('HTTP');
//     use(req: any, res: any, next: (error?: any) => void) {
//         console.log("Middleware is Working fine =>> ", req.user);
//         if (req.headers.user_role) {
//             var user_role = JSON.parse(req.headers.user_role)
//             var accessModules = []
//             console.log(req.originalUrl);
//             console.log(accessModules);
//             // if (!user_role.includes('admin')) {
//             //     // let unauthorizedUrls = [
//             //     //     '/api/invoices/pagination',
//             //     //     '/api/invoices/create-or-update',
//             //     //     '/api/billing/pagination',
//             //     //     '/api/billing/create-or-update',
//             //     //     '/api/purchase-orders/pagination',
//             //     //     '/api/purchase-orders/create-or-update',
//             //     //     '/api/items/pagination',
//             //     //     '/api/items/create-or-update'
//             //     // ];
//             //     let unauthorizedUrls = [];

//             //     if (unauthorizedUrls.some(url => url === req.originalUrl)) {
//             //         res.send({
//             //             "statusCode": 401,
//             //             "message": "Unauthorized",
//             //             "data": false
//             //         });
//             //     }
//             // }
//         }
//         next();
//     }
// }
