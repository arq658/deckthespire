import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { Deck } from '../../models/deck.model';
import { Card } from '../../models/card.model';
import { Relic } from '../../models/relic.model';
import { Character } from '../../models/character.model';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { DeckEditorComponent } from '../deck-editor/deck-editor.component';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-deck-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatTabsModule,
    MatDividerModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './deck-detail.component.html',
  styleUrls: ['./deck-detail.component.scss']
})
export class DeckDetailComponent implements OnInit {
  deck: Deck | null = null;
  deckCards: Card[] = [];
  deckRelics: Relic[] = [];
  deckCharacter: Character | null = null;
  loading: boolean = true;
  error: string | null = null;
  isOwner: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
    private authService: AuthService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    const deckId = this.route.snapshot.paramMap.get('id');
    if (deckId) {
      this.loadDeck(Number(deckId));
    } else {
      this.error = 'No deck ID provided';
      this.loading = false;
    }
  }

  loadDeck(deckId: number): void {
    this.loading = true;
    this.apiService.getDeck(deckId).subscribe({
      next: (deck: Deck) => {
        this.deck = deck;
        
        // Check if the current user is the deck owner
        const currentUserId = this.authService.currentUserValue?.id;
        this.isOwner = currentUserId === deck.userId;
          // Load cards and relics data
        this.loadDeckCards();
        this.loadDeckRelics();
        this.loadDeckCharacter();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading deck', error);
        this.error = 'Failed to load deck details.';
        this.loading = false;
      }
    });
  }

  loadDeckCards(): void {
    if (!this.deck || !this.deck.cards || this.deck.cards.length === 0) {
      return;
    }

    const cardPromises = this.deck.cards.map(cardId => 
      this.apiService.getCard(cardId).toPromise()
    );

    Promise.all(cardPromises)
      .then(cards => {
        this.deckCards = cards.filter(card => card !== undefined) as Card[];
        
        // Sort cards by cost and then by name
        this.deckCards.sort((a, b) => {
          if (a.cost !== b.cost) {
            return a.cost - b.cost;
          }
          return a.name.localeCompare(b.name);
        });
      })
      .catch(error => {
        console.error('Error loading deck cards', error);
      });
  }

  loadDeckRelics(): void {
    if (!this.deck || !this.deck.relics || this.deck.relics.length === 0) {
      return;
    }

    const relicPromises = this.deck.relics.map(relicId => 
      this.apiService.getRelic(relicId).toPromise()
    );

    Promise.all(relicPromises)
      .then(relics => {
        this.deckRelics = relics.filter(relic => relic !== undefined) as Relic[];
        
        // Sort relics by tier and then by name
        this.deckRelics.sort((a, b) => {
          if (a.tier !== b.tier) {
            return this.getTierValue(a.tier) - this.getTierValue(b.tier);
          }
          return a.name.localeCompare(b.name);
        });
      })
      .catch(error => {
        console.error('Error loading deck relics', error);
      });
  }

  loadDeckCharacter(): void {
    if (!this.deck || !this.deck.characterId) {
      return;
    }

    this.apiService.getCharacter(this.deck.characterId).subscribe({
      next: (character) => {
        this.deckCharacter = character;
      },
      error: (error) => {
        console.error('Error loading deck character', error);
      }
    });
  }

  // Helper method to convert relic tier to numeric value for sorting
  getTierValue(tier: string): number {
    const tierValues: { [key: string]: number } = {
      'Starter': 0,
      'Common': 1,
      'Uncommon': 2,
      'Rare': 3,
      'Boss': 4,
      'Shop': 5,
      'Event': 6,
      'Special': 7
    };
    return tierValues[tier] || 999;
  }
  editDeck(): void {
    if (!this.deck) return;

    const dialogRef = this.dialog.open(DeckEditorComponent, {
      width: '900px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      panelClass: 'custom-dialog-container',
      data: { ...this.deck }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.apiService.updateDeck(result.id, result).subscribe({
          next: (updatedDeck) => {            this.deck = updatedDeck;
            this.loadDeckCards();
            this.loadDeckRelics();
            this.loadDeckCharacter();
          },
          error: (error) => console.error('Error updating deck:', error)
        });
      }
    });
  }

  deleteDeck(): void {
    if (!this.deck || !this.deck.id) return;

    if (confirm('Are you sure you want to delete this deck?')) {
      this.apiService.deleteDeck(this.deck.id).subscribe({
        next: () => {
          this.router.navigate(['/decks']);
        },
        error: (error) => console.error('Error deleting deck:', error)
      });
    }
  }

  backToDecks(): void {
    this.router.navigate(['/decks']);
  }

  // Helper methods to group cards by types
  getAttackCards(): Card[] {
    return this.deckCards.filter(card => card.card_type.toLowerCase() === 'attack');
  }

  getSkillCards(): Card[] {
    return this.deckCards.filter(card => card.card_type.toLowerCase() === 'skill');
  }

  getPowerCards(): Card[] {
    return this.deckCards.filter(card => card.card_type.toLowerCase() === 'power');
  }

  getOtherCards(): Card[] {
    return this.deckCards.filter(card => 
      !['attack', 'skill', 'power'].includes(card.card_type.toLowerCase())
    );
  }
}
