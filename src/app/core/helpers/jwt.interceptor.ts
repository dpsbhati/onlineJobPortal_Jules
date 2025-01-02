import { inject, Injectable } from '@angular/core';
import {
    HttpRequest,
    HttpHandler,
    HttpEvent,
    HttpInterceptor,
    HttpHandlerFn,
    HttpErrorResponse,
} from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { NotifyService } from '../services/notify.service';

/**
 * Intercept
 *
 * @param req
 * @param next
 */
export const JwtInterceptor = (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> =>
    {
        const authService = inject(AuthService);
        const notify = inject(NotifyService);
    
        // Clone the request object
        let newReq = req.clone();
        debugger;
    
        // Request
        //
        // If the access token didn't expire, add the Authorization header.
        // We won't add the Authorization header if the access token expired.
        // This will force the server to return a "401 Unauthorized" response
        // for the protected API routes which our response interceptor will
        // catch and delete the access token from the local storage while logging
        // the user out from the app.
        if ( authService.accessToken )
        {
            newReq = req.clone({
                headers: req.headers.set('Authorization', 'Bearer ' + authService.accessToken),
            });
        }
    
        // Response
        return next(newReq).pipe(
            catchError((error) =>
            {
                // Catch "401 Unauthorized" responses
                if ( error instanceof HttpErrorResponse && error.status === 401 )
                {
                    // Sign out
                    //authService.logout();
    
                    // Reload the app
                    //location.reload();
                }
    
                if ( error instanceof HttpErrorResponse && error.status === 500)
                    {
                        notify.showError("Internal Server Error");
                    }
    
                return throwError(error);
            }),
        );
    };
    
