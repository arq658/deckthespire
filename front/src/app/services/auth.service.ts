import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, map, tap, catchError, of } from 'rxjs';
import { User, LoginRequest, RegisterRequest, AuthResponse } from '../models/user.model';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = '/api/auth';
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser$: Observable<User | null>;
  private isBrowser: boolean;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    let storedUser = null;
    
    // Solo intentar usar localStorage en entorno de navegador
    if (this.isBrowser) {
      try {
        const userStr = localStorage.getItem('currentUser');
        if (userStr) {
          storedUser = JSON.parse(userStr);
        }
      } catch (e) {
        console.error('Error accessing localStorage', e);
      }
    }
    
    this.currentUserSubject = new BehaviorSubject<User | null>(storedUser);
    this.currentUser$ = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  login(loginRequest: LoginRequest): Observable<AuthResponse> {
    // El backend espera username, no email
    const backendRequest = {
      username: loginRequest.email,  // Usamos el email como username para el backend
      password: loginRequest.password
    };
    
    return this.http.post<any>(`${this.baseUrl}/signin`, backendRequest)
      .pipe(
        map(response => {
          // Transformamos la respuesta del backend al formato que espera el frontend
          const authResponse: AuthResponse = {
            token: response.token,
            user: {
              id: response.id ? response.id.toString() : '',
              username: response.username,
              email: response.email,
              displayName: response.displayName,
              avatarUrl: response.avatarUrl
            }
          };
          return authResponse;
        }),
        tap(response => {
          // Guarda el token y el usuario en localStorage solo si estamos en el navegador
          if (this.isBrowser) {
            try {
              localStorage.setItem('authToken', response.token);
              localStorage.setItem('currentUser', JSON.stringify(response.user));
            } catch (e) {
              console.error('Error saving to localStorage', e);
            }
          }
          
          // Actualiza el BehaviorSubject
          this.currentUserSubject.next(response.user);
        })
      );
  }

  register(registerRequest: RegisterRequest): Observable<AuthResponse> {
    // Preparar el objeto para el backend, añadiendo un campo para los roles si es necesario
    const backendRequest = {
      ...registerRequest,
      roles: ['user'] // Por defecto, asignamos el rol "user"
    };
    
    return this.http.post<any>(`${this.baseUrl}/signup`, backendRequest)
      .pipe(
        tap(response => {
          // Si el registro es exitoso pero no incluye token (el backend devuelve mensaje)
          if (response.message && !response.token) {
            console.log('Registration successful, redirecting to login');
            // Intentamos hacer login automático si estamos en el navegador
            if (this.isBrowser) {
              this.login({
                email: registerRequest.email,
                password: registerRequest.password
              }).subscribe();
            }
          }
        }),
        // Para mantener la compatibilidad con el tipo de retorno
        map(() => {
          const tempResponse: AuthResponse = {
            token: '',
            user: {
              id: '',
              username: registerRequest.username,
              email: registerRequest.email,
              displayName: registerRequest.displayName || registerRequest.username
            }
          };
          return tempResponse;
        })
      );
  }

  logout(): void {
    // Elimina el usuario y token del localStorage solo si estamos en el navegador
    if (this.isBrowser) {
      try {
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
      } catch (e) {
        console.error('Error removing from localStorage', e);
      }
    }
    
    // Actualiza el BehaviorSubject con null
    this.currentUserSubject.next(null);
  }

  updateUserProfile(user: User): Observable<User> {
    // Convertir al formato que espera el backend
    const updateRequest = {
      username: user.username,
      email: user.email,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      password: user.password
    };
    
    return this.http.put<any>(`${this.baseUrl}/user`, updateRequest)
      .pipe(
        map(response => {
          // Si la respuesta es un mensaje de éxito sin datos de usuario
          if (response.message) {
            // Devolvemos los datos enviados ya que fueron actualizados
            return user;
          }
          return response as User;
        }),
        tap(updatedUser => {
          // Actualiza el usuario en localStorage solo si estamos en el navegador
          const currentUser = { ...this.currentUserValue, ...updatedUser };
          
          if (this.isBrowser) {
            try {
              localStorage.setItem('currentUser', JSON.stringify(currentUser));
            } catch (e) {
              console.error('Error updating user in localStorage', e);
            }
          }
          
          // Actualiza el BehaviorSubject
          this.currentUserSubject.next(currentUser);
        })
      );
  }
  /**
   * Actualiza solo el avatar del usuario
   * @param avatarUrl La URL del nuevo avatar seleccionado
   */
  updateUserAvatar(avatarUrl: string): Observable<User> {
    return this.http.put<any>(`${this.baseUrl}/update-avatar`, { avatarUrl })
      .pipe(
        map(response => {
          // Si la respuesta es un JwtResponse
          if (response && response.user) {
            return {...response.user, avatarUrl} as User; 
          } 
          // Si la respuesta ya es el usuario actualizado
          else if (response && response.id) {
            return {...response, avatarUrl} as User;
          }
          // Si no se recibe respuesta adecuada, al menos actualizamos el avatar
          else {
            const currentUser = this.currentUserValue;
            if (currentUser) {
              return { ...currentUser, avatarUrl };
            }
          }
          return { ...response, avatarUrl };
        }),
        tap(updatedUser => {
          // Asegurar que tenemos un objeto de usuario actual
          if (!this.currentUserValue) {
            return;
          }
          
          console.log('Avatar actualizado:', avatarUrl);
          
          // Crear una copia nueva del usuario con el avatar actualizado
          const updatedUserData = { 
            ...this.currentUserValue,
            avatarUrl
          };
          
          // Actualiza el usuario en localStorage solo si estamos en el navegador
          if (this.isBrowser) {
            try {
              localStorage.setItem('currentUser', JSON.stringify(updatedUserData));
              console.log('Usuario actualizado en localStorage');
            } catch (e) {
              console.error('Error updating user in localStorage', e);
            }
          }
          
          // Actualiza el BehaviorSubject con la nueva instancia del objeto
          this.currentUserSubject.next(updatedUserData);
        })
      );
  }

  isLoggedIn(): boolean {
    if (!this.isBrowser) {
      return false; // En SSR, consideramos que no hay sesión
    }
    
    try {
      return !!this.currentUserValue && !!localStorage.getItem('authToken');
    } catch (e) {
      console.error('Error checking login status', e);
      return false;
    }
  }

  getAuthToken(): string | null {
    if (!this.isBrowser) {
      return null; // En SSR, no hay token disponible
    }
    
    try {
      return localStorage.getItem('authToken');
    } catch (e) {
      console.error('Error getting auth token', e);
      return null;
    }
  }

  /**
   * Obtiene la lista de todos los usuarios desde la API de Spring
   * Nota: Esta operación normalmente requiere permisos de administrador
   */
  getAllUsers(): Observable<User[]> {
    return this.http.get<any>(`${this.baseUrl}/users`)
      .pipe(
        map(response => {
          // Maneja formato Spring Data REST con _embedded
          if (response && response._embedded && response._embedded.users) {
            return response._embedded.users;
          }
          // Maneja formato de array simple
          else if (Array.isArray(response)) {
            return response;
          } 
          // Maneja formato con propiedad data o contenido
          else if (response && (response.data || response.content)) {
            const users = response.data || response.content;
            return users.map((item: any) => {
              // Si tiene estructura con attributes (JSON API)
              if (item.attributes) {
                return { 
                  ...item.attributes, 
                  id: item.id 
                };
              } else {
                return item;
              }
            });
          }
          // Fallback para formato inesperado
          console.error('Formato de respuesta API inesperado:', response);
          return [];
        }),
        catchError(error => {
          console.error('Error al obtener usuarios:', error);
          return of([]);
        })
      );
  }
}
