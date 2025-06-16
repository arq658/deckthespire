import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { Deck } from '../../models/deck.model';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { DeckEditorComponent } from '../deck-editor/deck-editor.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { Card } from '../../models/card.model';
import { Relic } from '../../models/relic.model';
import { Character } from '../../models/character.model';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-deck-list',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule
  ],
  templateUrl: './deck-list.component.html',
  styleUrls: ['./deck-list.component.scss']
})
export class DeckListComponent implements OnInit {
  decks: Deck[] = [];
  loading: boolean = true;
  error: string | null = null;
  currentUserId: string | null = null;
  cardsMap: Map<string, Card> = new Map();
  relicsMap: Map<string, Relic> = new Map();
  charactersMap: Map<string, Character> = new Map();

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private dialog: MatDialog,
    private router: Router
  ) { }
  ngOnInit(): void {
    this.currentUserId = this.authService.currentUserValue?.id || null;
    this.loadDecks();
    this.preloadCardRelicAndCharacterData();
  }
  preloadCardRelicAndCharacterData(): void {
    // Load all cards to easily display card names in deck view
    this.apiService.getAllCards().subscribe({
      next: (cards: Card[]) => {
        cards.forEach(card => {
          if (card.id) {
            this.cardsMap.set(card.id, card);
          }
        });
      },
      error: (error) => console.error('Error loading cards:', error)
    });

    // Load all relics to easily display relic names in deck view
    this.apiService.getAllRelics().subscribe({
      next: (relics: Relic[]) => {
        relics.forEach(relic => {
          if (relic.id) {
            this.relicsMap.set(relic.id, relic);
          }
        });
      },
      error: (error) => console.error('Error loading relics:', error)
    });

    // Load all characters to easily display character names in deck view
    this.apiService.getAllCharacters().subscribe({
      next: (characters: Character[]) => {
        characters.forEach(character => {
          if (character.id) {
            this.charactersMap.set(character.id.toString(), character);
          }
        });
      },
      error: (error) => console.error('Error loading characters:', error)
    });
  }loadDecks(): void {
    this.loading = true;
    this.apiService.getAllDecks().subscribe({
      next: (decks: Deck[]) => {
        // Filter decks that belong to the current user
        const numUserId = this.currentUserId ? Number(this.currentUserId) : null;
        console.log('Current user ID:', numUserId, 'Decks received:', decks.length);
        
        this.decks = decks.filter(deck => {
          // Ensure both are compared as numbers
          const deckUserId = deck.userId ? Number(deck.userId) : null;
          const match = deckUserId === numUserId;
          console.log('Deck ID:', deck.id, 'Deck user ID:', deckUserId, 'Match:', match);
          return match;
        });
        
        console.log('Filtered decks:', this.decks.length);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error fetching decks', error);
        this.error = 'Failed to load decks. Please try again later.';
        this.loading = false;
      }
    });
  }  openDeckEditor(deck?: Deck): void {    const dialogRef = this.dialog.open(DeckEditorComponent, {
      width: '900px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      panelClass: 'custom-dialog-container',
      data: deck ? { ...deck } : { 
        name: '', 
        description: '', 
        cards: [], 
        relics: [], 
        characterId: null,
        userId: this.currentUserId ? Number(this.currentUserId) : null 
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (result.id) {
          // Update existing deck
          this.apiService.updateDeck(result.id, result).subscribe({
            next: () => this.loadDecks(),
            error: (error) => console.error('Error updating deck:', error)
          });
        } else {          // Create new deck
          console.log('Enviando request para crear deck:', JSON.stringify(result));
          this.apiService.createDeck(result).subscribe({
            next: (response) => {
              console.log('Deck creado exitosamente:', response);
              this.loadDecks();
            },
            error: (error) => {
              console.error('Error creating deck:', error);
              alert('Error al crear el deck: ' + JSON.stringify(error));
            }
          });
        }
      }
    });
  }

  viewDeck(deckId: number): void {
    this.router.navigate(['/decks', deckId]);
  }

  editDeck(deck: Deck, event: Event): void {
    event.stopPropagation();
    this.openDeckEditor(deck);
  }

  deleteDeck(deckId: number, event: Event): void {
    event.stopPropagation();
    if (confirm('Are you sure you want to delete this deck?')) {
      this.apiService.deleteDeck(deckId).subscribe({
        next: () => this.loadDecks(),
        error: (error) => console.error('Error deleting deck:', error)
      });
    }
  }

  getCardName(cardId: number | string): string {
    return this.cardsMap.get(cardId.toString())?.name || `Card #${cardId}`;
  }

  getRelicName(relicId: number | string): string {
    return this.relicsMap.get(relicId.toString())?.name || `Relic #${relicId}`;
  }

  getCharacterName(characterId: number | string): string {
    return this.charactersMap.get(characterId.toString())?.name || `Character #${characterId}`;
  }
}
