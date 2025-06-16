import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, of, map } from 'rxjs';

export interface Avatar {
  name: string;
  path: string;
  url: string;
  color?: string; // Color hexadecimal para fallback si la imagen no existe
}

@Injectable({
  providedIn: 'root'
})
export class AvatarService {
  private baseUrl = '/api/assets';

  constructor(private http: HttpClient) { }
  
  /**
   * Obtiene la lista de avatares disponibles
   */
  getAvailableAvatars(): Observable<Avatar[]> {
    return this.http.get<Avatar[]>(`${this.baseUrl}/avatars`)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          console.error('Error al obtener avatares:', error);
          
          // Proporcionar avatares predeterminados si hay error
          const defaultAvatars: Avatar[] = [
            { name: 'Default', path: '/api/assets/avatar/default-avatar.png', url: '/api/assets/avatar/default-avatar.png', color: '3F51B5' },
            { name: 'Ironclad', path: '/api/assets/avatar/ironclad.png', url: '/api/assets/avatar/ironclad.png', color: 'FF5252' },
            { name: 'Silent', path: '/api/assets/avatar/silent.png', url: '/api/assets/avatar/silent.png', color: '4CAF50' },
            { name: 'Defect', path: '/api/assets/avatar/defect.png', url: '/api/assets/avatar/defect.png', color: 'FFEB3B' },
            { name: 'Watcher', path: '/api/assets/avatar/watcher.png', url: '/api/assets/avatar/watcher.png', color: '9C27B0' }
          ];
          
          // Devolver avatares predeterminados en caso de error
          return of(defaultAvatars);
        })
      );
  }
  
  /**
   * Verifica si una imagen existe en el servidor
   */
  checkImageExists(imageUrl: string): Observable<boolean> {
    return this.http.get(imageUrl, { responseType: 'blob' })
      .pipe(
        map(() => true),
        catchError(() => of(false))
      );
  }
}
