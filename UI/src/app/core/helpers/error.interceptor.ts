import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { AuthenticationService } from '../services/authentication.service';
import { CustomErrorResponse } from '../models/custom-error-response';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private authenticationService: AuthenticationService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError(err => {
        if (err.status === 401) {
          this.authenticationService.logout();
          location.reload(true);
        }

        // back-end is not allowed
        if (err.status === 0) {
          return throwError(new CustomErrorResponse('Connection to server failed.', 0));
        }

        // back-end throw expected error
        const message = err.error.message;
        if (message) {
          return throwError(new CustomErrorResponse(message, err.status));
        }

        // back-end throw unexpected error
        return throwError(new CustomErrorResponse(err.error, err.status));
      })
    );
  }
}
