// logger.middleware.ts

import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
// import { Request, Response, NextFunction } from 'express';
// import { WriteResponse } from 'src/shared/response';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
    private readonly logger = new Logger('HTTP');
    use(req: any, res: any, next: (error?: any) => void) {
        console.log("Middleware is Working fine");
        if (req.headers.usermodulerole) {
            var user_module_role = JSON.parse(req.headers.usermodulerole)
            var accessModules = []
            user_module_role.forEach((element, index) => {
                accessModules.push(element.modules?.short_code)
            });
            console.log(req.originalUrl);
            console.log(accessModules);
            if (!accessModules.includes('SomeModuleName')) {
                // let unauthorizedUrls = [
                //     '/api/invoices/pagination',
                //     '/api/invoices/create-or-update',
                //     '/api/billing/pagination',
                //     '/api/billing/create-or-update',
                //     '/api/purchase-orders/pagination',
                //     '/api/purchase-orders/create-or-update',
                //     '/api/items/pagination',
                //     '/api/items/create-or-update'
                // ];
                let unauthorizedUrls = [];

                if (unauthorizedUrls.some(url => url === req.originalUrl)) {
                    res.send({
                        "statusCode": 401,
                        "message": "Unauthorized",
                        "data": false
                    });
                }
            }
        }
        next();
    }
}
