export interface RelicResponse {
  // Original format expected by some methods
  data?: {
    id: string;
    type: string;
    attributes: Relic;
  };
  // Spring Data REST format
  _embedded?: {
    relics: Relic[];
  };
}

export interface Relic {
  id?: string;
  name: string;
  tier: string;
  pool: string;
  description: string;
  flavor_text: string;
  image: string;
  _links?: {
    self: {
      href: string;
    };
    relic?: {
      href: string;
    };
  };
}
