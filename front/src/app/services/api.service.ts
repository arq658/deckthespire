import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, of } from 'rxjs';
import { Card, CardResponse } from '../models/card.model';
import { Relic, RelicResponse } from '../models/relic.model';
import { Keyword, KeywordResponse } from '../models/keyword.model';
import { Deck } from '../models/deck.model';
import { Character } from '../models/character.model';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = '/api';
  constructor(private http: HttpClient) { }
  
  // Método para obtener los datos crudos de las cartas
  getCardsRaw(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/cards`);
  }
  
  // Card endpoints
  getAllCards(): Observable<Card[]> {
    return this.http.get<any>(`${this.baseUrl}/cards`)
      .pipe(
        map(response => {
          // Handle Spring Data REST format (_embedded.cards)
          if (response && response._embedded && response._embedded.cards) {
            return response._embedded.cards;
          }
          // Handle legacy format (data array)
          else if (response && response.data) {
            return response.data.map((item: any) => {
              if (item.attributes) {
                return { ...item.attributes, id: item.id };
              } else {
                return item;
              }
            });
          }
          // Fallback for unexpected format
          console.error('Unexpected API response format:', response);
          return [];
        }),
        catchError(error => {
          console.error('Error fetching cards:', error);
          return of([]);
        })
      );
  }
  getCard(id: number): Observable<Card> {
    return this.http.get<Card>(`${this.baseUrl}/cards/${id}`)
      .pipe(
        map(response => {
          // If it's already in the Card format (Spring Data REST)
          if (response && response.name) {
            return response;
          }
          // Legacy format with data.attributes structure
          else if ((response as any).data?.attributes) {
            return (response as any).data.attributes;
          }
          console.error('Unexpected card response format:', response);
          throw new Error('Failed to parse card data');
        }),
        catchError(error => {
          console.error(`Error fetching card ${id}:`, error);
          throw error;
        })
      );
  }
  
  // Relic endpoints
  getAllRelics(): Observable<Relic[]> {
    return this.http.get<any>(`${this.baseUrl}/relics`)
      .pipe(
        map(response => {
          // Handle Spring Data REST format (_embedded.relics)
          if (response && response._embedded && response._embedded.relics) {
            return response._embedded.relics;
          }
          // Handle legacy format (data array)
          else if (response && response.data) {
            return response.data.map((item: any) => {
              if (item.attributes) {
                return { ...item.attributes, id: item.id };
              } else {
                return item;
              }
            });
          }
          // Fallback for unexpected format
          console.error('Unexpected API response format:', response);
          return [];
        }),
        catchError(error => {
          console.error('Error fetching relics:', error);
          return of([]);
        })
      );
  }
  getRelic(id: number): Observable<Relic> {
    return this.http.get<Relic>(`${this.baseUrl}/relics/${id}`)
      .pipe(
        map(response => {
          // If it's already in the Relic format (Spring Data REST)
          if (response && response.name) {
            return response;
          }
          // Legacy format with data.attributes structure
          else if ((response as any).data?.attributes) {
            return (response as any).data.attributes;
          }
          console.error('Unexpected relic response format:', response);
          throw new Error('Failed to parse relic data');
        }),
        catchError(error => {
          console.error(`Error fetching relic ${id}:`, error);
          throw error;
        })
      );
  }
  
  // Keyword endpoints
  getAllKeywords(): Observable<Keyword[]> {
    return this.http.get<any>(`${this.baseUrl}/keywords`)
      .pipe(
        map(response => {
          // Handle Spring Data REST format (_embedded.keywords)
          if (response && response._embedded && response._embedded.keywords) {
            return response._embedded.keywords;
          }
          // Handle legacy format (data array)
          else if (response && response.data) {
            return response.data.map((item: any) => {
              if (item.attributes) {
                return { ...item.attributes, id: item.id };
              } else {
                return item;
              }
            });
          }
          // Fallback for unexpected format
          console.error('Unexpected API response format:', response);
          return [];
        }),
        catchError(error => {
          console.error('Error fetching keywords:', error);
          return of([]);
        })
      );
  }
  getKeyword(id: number): Observable<Keyword> {
    return this.http.get<Keyword>(`${this.baseUrl}/keywords/${id}`)
      .pipe(
        map(response => {
          // If it's already in the Keyword format (Spring Data REST)
          if (response && response.name) {
            return response;
          }
          // Legacy format with data.attributes structure
          else if ((response as any).data?.attributes) {
            return (response as any).data.attributes;
          }
          console.error('Unexpected keyword response format:', response);
          throw new Error('Failed to parse keyword data');
        }),
        catchError(error => {
          console.error(`Error fetching keyword ${id}:`, error);
          throw error;
        })
      );
  }

  // Deck endpoints (custom for your app)
  getAllDecks(): Observable<Deck[]> {
    return this.http.get<any>(`${this.baseUrl}/decks`)
      .pipe(
        map(response => {
          // Handle Spring Data REST format (_embedded.decks)
          if (response && response._embedded && response._embedded.decks) {
            return response._embedded.decks;
          }
          return response as Deck[];
        }),
        catchError(error => {
          console.error('Error fetching decks:', error);
          return of([]);
        })
      );
  }

  getDeck(id: number): Observable<Deck> {
    return this.http.get<Deck>(`${this.baseUrl}/decks/${id}`);
  }

  createDeck(deck: Deck): Observable<Deck> {
    return this.http.post<Deck>(`${this.baseUrl}/decks`, deck);
  }

  updateDeck(id: number, deck: Deck): Observable<Deck> {
    return this.http.put<Deck>(`${this.baseUrl}/decks/${id}`, deck);
  }

  deleteDeck(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/decks/${id}`);
  }

  // Character endpoints
  getAllCharacters(): Observable<Character[]> {
    return this.http.get<Character[]>(`${this.baseUrl}/characters`);
  }

  getCharacter(id: number): Observable<Character> {
    return this.http.get<Character>(`${this.baseUrl}/characters/${id}`);
  }
}
