import { SafeHtml } from '@angular/platform-browser';

export interface CardResponse {
  // Original format expected by some methods
  data?: {
    id: string;
    type: string;
    attributes: Card;
  };
  // Spring Data REST format
  _embedded?: {
    cards: Card[];
  };
}

export interface Card {
  id?: string;
  name: string;
  color: string;
  rarity: string;
  card_type: string;
  cost: number;
  description: string;
  keyword_description: string | SafeHtml;
  image: string;
  _links?: {
    self: {
      href: string;
    };
    card?: {
      href: string;
    };
  };
}
