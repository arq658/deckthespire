export interface Deck {
  id?: number;
  name: string;
  description?: string;
  cards: number[]; // Array of card IDs
  relics?: number[]; // Array of relic IDs
  userId?: number; // ID of the user who owns this deck
  characterId?: number; // ID of the selected character
}
