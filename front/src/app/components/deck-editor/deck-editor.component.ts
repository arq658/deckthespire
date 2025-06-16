import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { Deck } from '../../models/deck.model';
import { ApiService } from '../../services/api.service';
import { Card } from '../../models/card.model';
import { Relic } from '../../models/relic.model';
import { Character } from '../../models/character.model';

@Component({
  selector: 'app-deck-editor',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatDialogModule,
    MatSelectModule,
    MatChipsModule,
    MatIconModule
  ],
  templateUrl: './deck-editor.component.html',
  styleUrls: ['./deck-editor.component.scss']
})
export class DeckEditorComponent implements OnInit {
  deck: Deck;
  availableCards: Card[] = [];
  availableRelics: Relic[] = [];
  availableCharacters: Character[] = [];
  selectedCardIds: string[] = [];
  selectedRelicIds: string[] = [];
  filteredCards: Card[] = [];
  filteredRelics: Relic[] = [];
  cardFilter: string = '';
  relicFilter: string = '';
  cardsMap: Map<string, Card> = new Map();
  relicsMap: Map<string, Relic> = new Map();

  constructor(
    private apiService: ApiService,
    public dialogRef: MatDialogRef<DeckEditorComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Deck
  ) {
    this.deck = { ...data };
    
    // Convert card and relic IDs to strings if they exist
    if (this.deck.cards) {
      this.selectedCardIds = this.deck.cards.map(id => id.toString());
    } else {
      this.deck.cards = [];
      this.selectedCardIds = [];
    }
    
    if (this.deck.relics) {
      this.selectedRelicIds = this.deck.relics.map(id => id.toString());
    } else {
      this.deck.relics = [];
      this.selectedRelicIds = [];
    }
  }
  ngOnInit(): void {
    this.loadCards();
    this.loadRelics();
    this.loadCharacters();
  }

  loadCards(): void {
    this.apiService.getAllCards().subscribe({
      next: (cards: Card[]) => {
        this.availableCards = cards;
        this.filteredCards = cards;
        
        // Create a map for quick card access by ID
        cards.forEach(card => {
          if (card.id) {
            this.cardsMap.set(card.id, card);
          }
        });
      },
      error: (error) => console.error('Error loading cards:', error)
    });
  }

  loadRelics(): void {
    this.apiService.getAllRelics().subscribe({
      next: (relics: Relic[]) => {
        this.availableRelics = relics;
        this.filteredRelics = relics;
        
        // Create a map for quick relic access by ID
        relics.forEach(relic => {
          if (relic.id) {
            this.relicsMap.set(relic.id, relic);
          }
        });
      },
      error: (error) => console.error('Error loading relics:', error)
    });
  }

  loadCharacters(): void {
    this.apiService.getAllCharacters().subscribe({
      next: (characters: Character[]) => {
        this.availableCharacters = characters;
      },
      error: (error) => console.error('Error loading characters:', error)
    });
  }

  addCardToDeck(cardId: string): void {
    if (!this.selectedCardIds.includes(cardId)) {
      this.selectedCardIds.push(cardId);
      this.deck.cards.push(Number(cardId));
    }
  }

  removeCardFromDeck(cardId: string): void {
    this.selectedCardIds = this.selectedCardIds.filter(id => id !== cardId);
    this.deck.cards = this.deck.cards.filter(id => id !== Number(cardId));
  }

  addRelicToDeck(relicId: string): void {
    if (!this.selectedRelicIds.includes(relicId)) {
      this.selectedRelicIds.push(relicId);
      if (!this.deck.relics) {
        this.deck.relics = [];
      }
      this.deck.relics.push(Number(relicId));
    }
  }

  removeRelicFromDeck(relicId: string): void {
    this.selectedRelicIds = this.selectedRelicIds.filter(id => id !== relicId);
    if (this.deck.relics) {
      this.deck.relics = this.deck.relics.filter(id => id !== Number(relicId));
    }
  }

  filterCards(): void {
    if (!this.cardFilter.trim()) {
      this.filteredCards = this.availableCards;
      return;
    }
    
    const filter = this.cardFilter.toLowerCase().trim();
    this.filteredCards = this.availableCards.filter(card => 
      card.name.toLowerCase().includes(filter) || 
      card.description.toLowerCase().includes(filter) ||
      card.color.toLowerCase().includes(filter) ||
      card.rarity.toLowerCase().includes(filter) ||
      card.card_type.toLowerCase().includes(filter)
    );
  }

  filterRelics(): void {
    if (!this.relicFilter.trim()) {
      this.filteredRelics = this.availableRelics;
      return;
    }
    
    const filter = this.relicFilter.toLowerCase().trim();
    this.filteredRelics = this.availableRelics.filter(relic => 
      relic.name.toLowerCase().includes(filter) || 
      relic.description.toLowerCase().includes(filter) ||
      relic.tier.toLowerCase().includes(filter) ||
      relic.pool.toLowerCase().includes(filter)
    );
  }

  getCardById(cardId: string): Card | undefined {
    return this.cardsMap.get(cardId);
  }

  getRelicById(relicId: string): Relic | undefined {
    return this.relicsMap.get(relicId);
  }

  onCancelClick(): void {
    this.dialogRef.close();
  }  onSaveClick(): void {
    // Make sure card and relic IDs are numbers
    this.deck.cards = this.selectedCardIds.map(id => Number(id));
    if (this.selectedRelicIds.length > 0) {
      this.deck.relics = this.selectedRelicIds.map(id => Number(id));
    }
    
    // Ensure userId is a number
    if (this.deck.userId !== undefined && this.deck.userId !== null) {
      this.deck.userId = Number(this.deck.userId);
    }
    
    console.log('Guardando deck:', JSON.stringify(this.deck));
    this.dialogRef.close(this.deck);
  }
}
