import { Injectable } from '@angular/core';
import {
    HttpRequest,
    HttpHandler,
    HttpEvent,
    HttpInterceptor,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
    constructor(private authenticationService: AuthService) { }


    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const currentUser = this.authenticationService.currentUserValue;

        if (currentUser && currentUser.role) { // Replace `role` with `token` if it represents the JWT
            request = request.clone({
                setHeaders: {
                    Authorization: `Bearer ${currentUser.role}`,
                },
            });
        }

        return next.handle(request);
    }
}
