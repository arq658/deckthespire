import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { isPlatformBrowser } from '@angular/common';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isBrowser: boolean;

  constructor(
    private authService: AuthService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Solo intenta obtener y agregar el token si estamos en el navegador
    if (this.isBrowser) {
      // Obtiene el token de autenticación
      const authToken = this.authService.getAuthToken();
      
      // Si hay un token, clona la solicitud y agrega el encabezado de autorización
      if (authToken) {
        const authReq = request.clone({
          headers: request.headers.set('Authorization', `Bearer ${authToken}`)
        });
        return next.handle(authReq);
      }
    }
    
    // Si no estamos en el navegador o no hay token, continúa con la solicitud original
    return next.handle(request);
  }
}
