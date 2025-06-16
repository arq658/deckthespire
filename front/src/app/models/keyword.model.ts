export interface KeywordResponse {
  // Original format expected by some methods
  data?: {
    id: string;
    type: string;
    attributes: Keyword;
  };
  // Spring Data REST format
  _embedded?: {
    keywords: Keyword[];
  };
}

export interface Keyword {
  id?: string;
  name: string;
  description: string;
  names: string[];
  _links?: {
    self: {
      href: string;
    };
    keyword?: {
      href: string;
    };
  };
}
