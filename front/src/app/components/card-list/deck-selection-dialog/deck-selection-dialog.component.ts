import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../services/api.service';
import { AuthService } from '../../../services/auth.service';
import { Deck } from '../../../models/deck.model';
import { Card } from '../../../models/card.model';

@Component({
  selector: 'app-deck-selection-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatListModule,
    MatButtonModule,
    MatIconModule,
    FormsModule
  ],
  template: `
    <div class="dialog-container">
      <h2 class="dialog-title">Select or Create a Deck</h2>
      <div class="dialog-content">
        <div *ngIf="loading" class="loading-message">
          <div class="spinner"></div>
          Loading decks...
        </div>
        <div *ngIf="!loading && decks.length === 0" class="no-decks-message">
          <p>You don't have any decks yet.</p>
        </div>
        <div class="deck-list" *ngIf="!loading && decks.length > 0">
          <div 
            class="deck-option" 
            *ngFor="let deck of decks" 
            [class.selected]="selectedDeck === deck"
            (click)="selectDeck(deck)">
            <span class="deck-name">{{ deck.name }}</span>
            <span class="card-count">{{ deck.cards.length || 0 }} cards</span>
          </div>
        </div>
      </div>    <div class="dialog-actions">
        <button class="cancel-btn" (click)="onCancelClick()">Cancel</button>
        <div>
          <button class="add-btn" *ngIf="selectedDeck" (click)="addCardToSelectedDeck()">Add to Deck</button>
          <button class="create-btn" (click)="createNewDeck()">Create New Deck</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dialog-container {
      background-color: var(--menu-background);
      border: 2px solid var(--title-color);
      border-radius: 10px;
      color: var(--text-color);
      padding: 0;
      overflow: hidden;
      width: 100%;
    }

    .dialog-title {
      font-family: 'Pirata One', cursive;
      font-size: 1.8rem;
      color: var(--title-color);
      text-align: center;
      margin: 0;
      padding: 16px;
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.7);
      background-color: rgba(0, 0, 0, 0.3);
      border-bottom: 2px solid var(--title-color);
    }

    .dialog-content {
      padding: 16px;
      max-height: 300px;
      overflow-y: auto;
    }

    .loading-message, .no-decks-message {
      padding: 20px;
      text-align: center;
      color: var(--text-color);
      background-color: rgba(0, 0, 0, 0.2);
      border-radius: 8px;
      font-style: italic;
    }

    .spinner {
      display: inline-block;
      width: 20px;
      height: 20px;
      border: 3px solid rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      border-top-color: var(--title-color);
      animation: spin 1s ease-in-out infinite;
      margin-bottom: 10px;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .deck-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .deck-option {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      background-color: rgba(0, 0, 0, 0.2);
      border-radius: 6px;
      border: 1px solid rgba(246, 215, 74, 0.3);
      transition: all 0.2s ease;
      cursor: pointer;
    }

    .deck-option:hover {
      background-color: rgba(246, 215, 74, 0.1);
      transform: translateY(-2px);
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
    }

    .deck-option.selected {
      background-color: rgba(246, 215, 74, 0.2);
      border-color: var(--title-color);
      box-shadow: 0 0 8px rgba(246, 215, 74, 0.4);
    }

    .deck-name {
      font-weight: 500;
      color: var(--text-color);
      font-size: 1.1em;
    }

    .card-count {
      color: var(--accent-color);
      font-size: 0.9em;
      font-style: italic;
    }    .dialog-actions {
      display: flex;
      justify-content: space-between;
      padding: 16px;
      border-top: 1px solid rgba(246, 215, 74, 0.3);
      background-color: rgba(0, 0, 0, 0.2);
    }
    
    .dialog-actions > div {
      display: flex;
      gap: 10px;
    }    .cancel-btn, .create-btn, .add-btn {
      font-family: 'Pirata One', cursive;
      padding: 8px 16px;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.3s;
      text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.7);
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
      font-size: 1.05rem;
      letter-spacing: 0.5px;
      min-width: 110px;
      height: 40px;
      white-space: nowrap;
      display: flex;
      align-items: center;
      justify-content: center;
      line-height: 1.2;
    }

    .cancel-btn {
      background-color: rgba(0, 0, 0, 0.4);
      color: #aaa;
      border: 1px solid #666;
    }

    .cancel-btn:hover {
      background-color: rgba(0, 0, 0, 0.6);
      transform: translateY(-2px);
      box-shadow: 0 6px 8px rgba(0, 0, 0, 0.4);
    }
    
    .add-btn {
      background-color: rgba(136, 192, 112, 0.3); /* Green tint */
      color: #88c070;
      border: 2px solid #88c070;
    }
    
    .add-btn:hover {
      background-color: rgba(136, 192, 112, 0.5);
      transform: translateY(-2px);
      box-shadow: 0 6px 8px rgba(0, 0, 0, 0.4);
    }

    .create-btn {
      background-color: var(--button-background);
      color: var(--title-color);
      border: 2px solid var(--title-color);
    }

    .create-btn:hover {
      background-color: var(--button-hover);
      transform: translateY(-2px);
      box-shadow: 0 6px 8px rgba(0, 0, 0, 0.4);
    }
  `]
})
export class DeckSelectionDialogComponent implements OnInit {
  decks: Deck[] = [];
  loading: boolean = true;
  selectedDeck: Deck | null = null;

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    public dialogRef: MatDialogRef<DeckSelectionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { card: Card }
  ) {}

  ngOnInit(): void {
    this.loadUserDecks();
  }

  loadUserDecks(): void {
    const currentUserId = this.authService.currentUserValue?.id;
    if (!currentUserId) {
      this.loading = false;
      return;
    }

    this.apiService.getAllDecks().subscribe({
      next: (decks: Deck[]) => {        // Filter decks that belong to the current user
        this.decks = decks.filter(deck => deck.userId === (currentUserId ? Number(currentUserId) : null));
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading decks', error);
        this.loading = false;
      }
    });
  }  selectDeck(deck: Deck): void {
    this.selectedDeck = deck;
    // Just update the selected state visually
  }
  
  addCardToSelectedDeck(): void {
    if (this.selectedDeck && this.selectedDeck.id !== undefined && 
        this.selectedDeck.id !== null && this.data.card.id) {
      // Add card to the selected deck
      // Clone the deck to avoid modifying the original
      const updatedDeck: Deck = { ...this.selectedDeck };
      updatedDeck.cards = [...(updatedDeck.cards || []), Number(this.data.card.id)];
      
      this.apiService.updateDeck(Number(this.selectedDeck.id), updatedDeck).subscribe({
        next: () => {
          this.dialogRef.close({ success: true, deck: this.selectedDeck });
        },
        error: (error) => {
          console.error('Error adding card to deck', error);
          this.dialogRef.close({ success: false, error });
        }
      });
    }
  }

  createNewDeck(): void {
    this.dialogRef.close('create');
  }

  onCancelClick(): void {
    this.dialogRef.close();
  }
}
