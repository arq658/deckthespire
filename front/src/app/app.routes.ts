import { Routes } from '@angular/router';
import { CardListComponent } from './components/card-list/card-list.component';
import { RelicListComponent } from './components/relic-list/relic-list.component';
import { KeywordListComponent } from './components/keyword-list/keyword-list.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { UserProfileComponent } from './components/user-profile/user-profile.component';
import { DeckListComponent } from './components/deck-list/deck-list.component';
import { DeckDetailComponent } from './components/deck-detail/deck-detail.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', component: CardListComponent },
  { path: 'cards', component: CardListComponent },
  { path: 'relics', component: RelicListComponent },
  { path: 'keywords', component: KeywordListComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'profile', component: UserProfileComponent, canActivate: [authGuard] },
  { path: 'decks', component: DeckListComponent, canActivate: [authGuard] },
  { path: 'decks/:id', component: DeckDetailComponent, canActivate: [authGuard] },
  // Add more routes as needed
];
