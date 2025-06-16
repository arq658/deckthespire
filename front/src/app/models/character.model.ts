export interface Character {
  id?: number;
  name: string;
  description: string;
  startingHp: number;
  startingDeck: string[];
  startingRelic: string;
}
