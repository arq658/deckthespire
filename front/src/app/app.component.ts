import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';
import { Subscription } from 'rxjs';
import { User } from './models/user.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'Deck The Spire';
  isLoggedIn = false;
  username = '';
  userAvatar = '';
  private authSubscription: Subscription | null = null;
  
  constructor(
    public router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Suscribirse a los cambios en el estado de autenticación
    this.authSubscription = this.authService.currentUser$.subscribe(user => {
      this.isLoggedIn = !!user;
      
      if (user) {
        this.username = user.displayName || user.username;
        this.userAvatar = user.avatarUrl || '';
      } else {
        this.username = '';
        this.userAvatar = '';
      }
    });
  }

  ngOnDestroy(): void {
    // Cancelar la suscripción para evitar fugas de memoria
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }
}
