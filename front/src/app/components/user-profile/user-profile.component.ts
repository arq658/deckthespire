import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AvatarService, Avatar } from '../../services/avatar.service';
import { User } from '../../models/user.model';

// Extender la interfaz Window para incluir la función selectAvatarIndex
declare global {
  interface Window {
    selectAvatarIndex: ((index: number) => void) | undefined;
  }
}

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent implements OnInit {
  profileForm: FormGroup;
  submitted = false;
  error = '';
  success = '';
  loading = false;
  currentUser: User | null = null;
  /**
   * Transforma una URL de avatar para usar la API de recursos
   */
  getAvatarAPIUrl(avatarUrl: string): string {
    if (!avatarUrl) {
      return '/api/assets/avatar/default-avatar.png';
    }
    
    // Si la URL ya es una URL API, usarla directamente
    if (avatarUrl.startsWith('/api/assets/avatar/')) {
      return avatarUrl;
    }
    
    // Extraer el nombre de archivo del avatar
    const fileName = avatarUrl.split('/').pop();
    if (!fileName) {
      return '/api/assets/avatar/default-avatar.png';
    }
    
    // Construir la nueva URL para la API
    return `/api/assets/avatar/${fileName}`;
  }
  
  /**
   * Maneja errores al cargar la imagen de avatar
   */
  handleAvatarError(event: any): void {
    console.error('Error al cargar la imagen de avatar:', event);
    
    // Generar una imagen SVG con la inicial del nombre de usuario
    const initialLetter = this.currentUser?.displayName?.charAt(0) || 
                        this.currentUser?.username?.charAt(0) || 
                        'U';
                        
    const colorHex = '3F51B5'; // Azul por defecto
    
    // Crear un SVG básico como fallback
    const svgUrl = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='128' height='128'><rect width='128' height='128' fill='%23${colorHex}'/><text x='64' y='64' fill='white' text-anchor='middle' dominant-baseline='middle' font-size='64'>${initialLetter}</text></svg>`;
    
    // Establecer la imagen fallback
    event.target.src = svgUrl;
  }
  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private avatarService: AvatarService,
    private router: Router
  ) {
    this.profileForm = this.formBuilder.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      displayName: ['']
      // El campo avatarUrl se maneja internamente y no se muestra en el formulario
    });
  }
  ngOnInit(): void {
    // Comprueba si el usuario está autenticado
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    // Obtiene los datos del usuario actual
    this.currentUser = this.authService.currentUserValue;
    if (this.currentUser) {
      this.profileForm.patchValue({
        username: this.currentUser.username,
        email: this.currentUser.email,
        displayName: this.currentUser.displayName || ''
      });
    }
    
    // Suscribirse a cambios en el usuario currentUser para mantener la UI actualizada
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.currentUser = user;
        // No actualizamos el formulario aquí para no interferir con la edición
      }
    });
  }

  // Getter para acceder fácilmente a los campos del formulario
  get f() {
    return this.profileForm.controls;
  }  onSubmit() {
    this.submitted = true;
    this.error = '';
    this.success = '';

    // Detiene la ejecución si el formulario es inválido
    if (this.profileForm.invalid) {
      return;
    }

    this.loading = true;
    const updatedUser: User = {
      username: this.f['username'].value,
      email: this.f['email'].value,
      displayName: this.f['displayName'].value || undefined,
      // Mantener el avatar que ya tiene el usuario
      avatarUrl: this.currentUser?.avatarUrl
    };

    this.authService.updateUserProfile(updatedUser)
      .subscribe({
        next: (updatedUserData) => {
          // Actualiza el usuario actual con los datos actualizados
          this.currentUser = { ...this.currentUser, ...updatedUserData };
            // Actualiza el formulario si hay cambios adicionales en la respuesta
          this.profileForm.patchValue({
            username: this.currentUser.username,
            email: this.currentUser.email,
            displayName: this.currentUser.displayName || ''
          });
          
          this.loading = false;
          this.showSuccessMessage('Profile updated successfully');
        },
        error: error => {
          this.loading = false;
          this.showErrorMessage(error?.error?.message || 'Failed to update profile');
        }
      });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }  /**
   * Abre el diálogo de selección de avatares
   */
  openAvatarSelector(): void {
    this.avatarService.getAvailableAvatars().subscribe({
      next: (avatars) => {
        if (avatars && avatars.length > 0) {
          // Crear un diálogo simple para elegir avatares
          let avatarListHtml = '<style>' +
            '.avatar-grid { display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; margin-top: 15px; }' +
            '.avatar-option { border: 3px solid transparent; border-radius: 50%; cursor: pointer; overflow: hidden; width: 60px; height: 60px; }' +
            '.avatar-option:hover { border-color: #3f51b5; }' +
            '.avatar-option img { width: 100%; height: 100%; object-fit: cover; }' +
            '</style>' +
            '<h3 style="text-align: center;">Selecciona un avatar</h3>' +
            '<div class="avatar-grid">';          avatars.forEach((avatar, index) => {
            // Convertir a la nueva API URL
            const imgSrc = this.getAvatarAPIUrl(avatar.url);
            const safeAvatarName = avatar.name ? avatar.name.replace(/[<>]/g, '') : 'Avatar';
            
            console.log(`Avatar ${index}: ${safeAvatarName}, URL: ${imgSrc}`);
            
            avatarListHtml += `<div class="avatar-option" onclick="selectAvatarIndex(${index})">` +
              `<img src="${imgSrc}" alt="${safeAvatarName}" 
                   onerror="console.error('Error cargando avatar:', this.src); this.onerror=null;
                   const letter = '${safeAvatarName.charAt(0)}';
                   const color = '${avatar.color || '3F51B5'}';
                   this.src='data:image/svg+xml;utf8,<svg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'60\\' height=\\'60\\'><rect width=\\'60\\' height=\\'60\\' fill=\\'%23'+color+'\\'/><text x=\\'30\\' y=\\'30\\' fill=\\'white\\' text-anchor=\\'middle\\' dominant-baseline=\\'middle\\' font-size=\\'24\\'>'+letter+'</text></svg>'">` +
              '</div>';
          });
          
          avatarListHtml += '</div>';
          
          // Crear un div modal para mostrar los avatares
          const modalDiv = document.createElement('div');
          modalDiv.style.position = 'fixed';
          modalDiv.style.top = '0';
          modalDiv.style.left = '0';
          modalDiv.style.width = '100%';
          modalDiv.style.height = '100%';
          modalDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
          modalDiv.style.zIndex = '1000';
          modalDiv.style.display = 'flex';
          modalDiv.style.justifyContent = 'center';
          modalDiv.style.alignItems = 'center';
          
          const modalContent = document.createElement('div');
          modalContent.style.backgroundColor = 'white';
          modalContent.style.borderRadius = '8px';
          modalContent.style.padding = '20px';
          modalContent.style.maxWidth = '80%';
          modalContent.style.maxHeight = '80%';
          modalContent.style.overflow = 'auto';
          modalContent.innerHTML = avatarListHtml;
          
          modalDiv.appendChild(modalContent);
          document.body.appendChild(modalDiv);
          
          // Función para seleccionar el avatar
          window.selectAvatarIndex = (index: number) => {            if (index >= 0 && index < avatars.length) {
              // Convertir a la URL de la API
              const avatarUrl = this.getAvatarAPIUrl(avatars[index].url);
              
              console.log('Avatar seleccionado:', avatars[index].name, 'URL:', avatarUrl);
              
              this.updateUserAvatar(avatarUrl);
              document.body.removeChild(modalDiv);
              // Eliminar función global después de usarla
              try {
                window.selectAvatarIndex = undefined;
              } catch (e) {
                console.error('Error al limpiar selectAvatarIndex', e);
              }
            }
          };
            // Cerrar el modal al hacer clic fuera
          modalDiv.addEventListener('click', (e) => {
            if (e.target === modalDiv) {
              document.body.removeChild(modalDiv);
              // Eliminar función global después de usarla
              window.selectAvatarIndex = undefined;
            }
          });
        } else {
          console.warn('No hay avatares disponibles en la respuesta de la API');
          this.openErrorModalWithFallback('No hay avatares disponibles');
        }
      },      error: (error) => {
        console.error('Error al cargar avatares:', error);
        
        // Generar algunos avatares predeterminados incluso si hay error
        const defaultAvatars: Avatar[] = [
          { name: 'Default', path: '/api/assets/avatar/default-avatar.png', url: '/api/assets/avatar/default-avatar.png', color: '3F51B5' },
          { name: 'Ironclad', path: '/api/assets/avatar/ironclad.png', url: '/api/assets/avatar/ironclad.png', color: 'FF5252' },
          { name: 'Silent', path: '/api/assets/avatar/silent.png', url: '/api/assets/avatar/silent.png', color: '4CAF50' },
          { name: 'Defect', path: '/api/assets/avatar/defect.png', url: '/api/assets/avatar/defect.png', color: 'FFEB3B' },
          { name: 'Watcher', path: '/api/assets/avatar/watcher.png', url: '/api/assets/avatar/watcher.png', color: '9C27B0' }
        ];
        
        this.openAvatarSelectorWithFallback(defaultAvatars);
      }
    });
  }
  
  /**
   * Muestra un mensaje de éxito que desaparece automáticamente
   */
  private showSuccessMessage(message: string): void {
    this.success = message;
    this.error = ''; // Limpiar cualquier error previo
    
    // Limpiar el mensaje después de 3 segundos
    setTimeout(() => {
      this.success = '';
    }, 3000);
  }
  
  /**
   * Muestra un mensaje de error que desaparece automáticamente
   */
  private showErrorMessage(message: string): void {
    this.error = message;
    this.success = ''; // Limpiar cualquier mensaje de éxito previo
    
    // Limpiar el mensaje después de 5 segundos
    setTimeout(() => {
      this.error = '';
    }, 5000);
  }
  /**
   * Muestra un modal de error con un botón para aceptar
   */
  private openErrorModalWithFallback(errorMessage: string): void {
    // Crear un div modal para mostrar el error
    const modalDiv = document.createElement('div');
    modalDiv.style.position = 'fixed';
    modalDiv.style.top = '0';
    modalDiv.style.left = '0';
    modalDiv.style.width = '100%';
    modalDiv.style.height = '100%';
    modalDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    modalDiv.style.zIndex = '1000';
    modalDiv.style.display = 'flex';
    modalDiv.style.justifyContent = 'center';
    modalDiv.style.alignItems = 'center';
    
    const modalContent = document.createElement('div');
    modalContent.style.backgroundColor = 'white';
    modalContent.style.borderRadius = '8px';
    modalContent.style.padding = '20px';
    modalContent.style.maxWidth = '80%';
    modalContent.style.textAlign = 'center';
    
    const title = document.createElement('h3');
    title.textContent = 'LOCALHOST:4200 DICE';
    title.style.marginBottom = '20px';
    
    const message = document.createElement('p');
    message.textContent = errorMessage;
    message.style.marginBottom = '20px';
    
    const acceptButton = document.createElement('button');
    acceptButton.textContent = 'Aceptar';
    acceptButton.style.backgroundColor = '#ff4081';
    acceptButton.style.color = 'white';
    acceptButton.style.border = 'none';
    acceptButton.style.borderRadius = '4px';
    acceptButton.style.padding = '8px 16px';
    acceptButton.style.cursor = 'pointer';
    
    acceptButton.onclick = () => {
      document.body.removeChild(modalDiv);
        // Después de mostrar el error, abrimos la galería con avatares predeterminados
      const defaultAvatars: Avatar[] = [
        { name: 'Default', path: '/api/assets/avatar/default-avatar.png', url: '/api/assets/avatar/default-avatar.png', color: '3F51B5' },
        { name: 'Ironclad', path: '/api/assets/avatar/ironclad.png', url: '/api/assets/avatar/ironclad.png', color: 'FF5252' },
        { name: 'Silent', path: '/api/assets/avatar/silent.png', url: '/api/assets/avatar/silent.png', color: '4CAF50' },
        { name: 'Defect', path: '/api/assets/avatar/defect.png', url: '/api/assets/avatar/defect.png', color: 'FFEB3B' },
        { name: 'Watcher', path: '/api/assets/avatar/watcher.png', url: '/api/assets/avatar/watcher.png', color: '9C27B0' }
      ];
      
      this.openAvatarSelectorWithFallback(defaultAvatars);
    };
    
    modalContent.appendChild(title);
    modalContent.appendChild(message);
    modalContent.appendChild(acceptButton);
    
    modalDiv.appendChild(modalContent);
    document.body.appendChild(modalDiv);
  }
  /**
   * Abre el selector de avatares con una lista de respaldo en caso de error
   */
  private openAvatarSelectorWithFallback(avatars: Avatar[]): void {
    // Implementa la misma lógica que openAvatarSelector pero con los avatares de respaldo
    let avatarListHtml = '<style>' +
      '.avatar-grid { display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; margin-top: 15px; }' +
      '.avatar-option { border: 3px solid transparent; border-radius: 50%; cursor: pointer; overflow: hidden; width: 60px; height: 60px; display: flex; align-items: center; justify-content: center; background-color: #ccc; }' +
      '.avatar-option:hover { border-color: #3f51b5; }' +
      '.avatar-box { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: white; }' +
      '</style>' +
      '<h3 style="text-align: center;">Selecciona un avatar</h3>' +
      '<div class="avatar-grid">';
    
    avatars.forEach((avatar, index) => {
      const colorHex = avatar.color || '3F51B5';
      const safeAvatarName = avatar.name ? avatar.name.replace(/[<>]/g, '') : 'Avatar';
      avatarListHtml += `<div class="avatar-option" onclick="selectAvatarIndex(${index})">` +
        `<div class="avatar-box" style="background-color: #${colorHex};">${safeAvatarName.charAt(0)}</div>` +
        '</div>';
    });
    
    avatarListHtml += '</div>';
    
    // Crear un div modal para mostrar los avatares
    const modalDiv = document.createElement('div');
    modalDiv.style.position = 'fixed';
    modalDiv.style.top = '0';
    modalDiv.style.left = '0';
    modalDiv.style.width = '100%';
    modalDiv.style.height = '100%';
    modalDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    modalDiv.style.zIndex = '1000';
    modalDiv.style.display = 'flex';
    modalDiv.style.justifyContent = 'center';
    modalDiv.style.alignItems = 'center';
    
    const modalContent = document.createElement('div');
    modalContent.style.backgroundColor = 'white';
    modalContent.style.borderRadius = '8px';
    modalContent.style.padding = '20px';
    modalContent.style.maxWidth = '80%';
    modalContent.style.maxHeight = '80%';
    modalContent.style.overflow = 'auto';
    modalContent.innerHTML = avatarListHtml;
    
    modalDiv.appendChild(modalContent);
    document.body.appendChild(modalDiv);
    
    // Función para seleccionar el avatar
    window.selectAvatarIndex = (index: number) => {
      if (index >= 0 && index < avatars.length) {        // Usar la API URL para el avatar
        const avatarUrl = this.getAvatarAPIUrl(avatars[index].url);
        this.updateUserAvatar(avatarUrl);
        document.body.removeChild(modalDiv);
        window.selectAvatarIndex = undefined;
      }
    };
    
    // Cerrar el modal al hacer clic fuera
    modalDiv.addEventListener('click', (e) => {
      if (e.target === modalDiv) {
        document.body.removeChild(modalDiv);
        window.selectAvatarIndex = undefined;
      }
    });
  }  /**
   * Actualiza solo el avatar del usuario
   */
  updateUserAvatar(avatarUrl: string): void {
    this.loading = true;
    this.error = '';
    this.success = '';
    
    // Verificar si la URL es válida
    if (!avatarUrl) {
      this.showErrorMessage('La URL del avatar no es válida');
      this.loading = false;
      return;
    }
    
    this.authService.updateUserAvatar(avatarUrl).subscribe({
      next: (updatedUser) => {
        // Detener el estado de carga inmediatamente
        this.loading = false;
        
        // Forzar la actualización del avatar a nivel local
        if (this.currentUser) {
          // Aplicar el nuevo avatar creando un nuevo objeto para triggers de detección de cambios
          this.currentUser = {
            ...this.currentUser,
            avatarUrl: avatarUrl  // Usar directamente la URL que sabemos que es correcta
          };
          
          // Forzar la recarga de la imagen para evitar problemas de caché
          this.forceAvatarReload();
        }
        
        this.showSuccessMessage('¡Avatar actualizado con éxito!');
      },
      error: (error) => {
        this.loading = false;
        this.showErrorMessage(error?.error?.message || 'Error al actualizar el avatar');
        console.error('Error updating avatar:', error);
      }
    });
  }
  /**
   * Fuerza la recarga de la imagen de avatar sobrepasando el caché
   */
  private forceAvatarReload(): void {
    if (!this.currentUser?.avatarUrl) {
      return;
    }
    
    // Esperar brevemente a que el DOM se actualice
    setTimeout(() => {
      const avatarImage = document.getElementById('avatar-image') as HTMLImageElement;
      if (avatarImage) {
        // Forzar recarga añadiendo un timestamp a la URL
        const currentSrc = avatarImage.src;
        const newSrc = currentSrc.includes('?') 
          ? `${currentSrc.split('?')[0]}?t=${Date.now()}`
          : `${currentSrc}?t=${Date.now()}`;
          
        avatarImage.src = newSrc;
      }
    }, 200);
  }
}
