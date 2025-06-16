import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ApiService } from '../../services/api.service';
import { Card } from '../../models/card.model';
import { Keyword } from '../../models/keyword.model';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { TooltipService } from '../../services/tooltip.service';
import { KeywordTooltipDirective } from '../../directives/keyword-tooltip.directive';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-card-list',
  standalone: true,
  imports: [CommonModule, MatTooltipModule, KeywordTooltipDirective, MatDialogModule],
  templateUrl: './card-list.component.html',
  styleUrls: ['./card-list.component.scss']
})
export class CardListComponent implements OnInit, AfterViewInit {
  cards: Card[] = [];
  keywords: Keyword[] = [];
  keywordMap: Map<string, Keyword> = new Map();
  loading: boolean = true;
  error: string | null = null;
  constructor(
    private apiService: ApiService,
    private sanitizer: DomSanitizer,
    private tooltipService: TooltipService,
    private dialog: MatDialog,
    private authService: AuthService,
    private router: Router
  ) {}
    ngOnInit(): void {
    this.loading = true;
    this.error = null;
      // Cargar las keywords
    this.apiService.getAllKeywords().subscribe({
      next: (keywords: Keyword[]) => {
        this.keywords = keywords;
        console.log('Loaded keywords:', keywords);
        
        // Si no hay keywords disponibles, añadir algunas predeterminadas para testing
        if (!keywords || keywords.length === 0) {
          console.log('No se encontraron keywords, añadiendo valores por defecto para testing');
          
          // Añadir keywords predeterminadas basadas en la imagen
          const defaultKeywords = [
            { id: '1', name: 'Vulnerable', description: 'Recibe un 50% más de daño de ataques.' },
            { id: '2', name: 'Block', description: 'Reduce el daño recibido en la cantidad indicada.' }
          ];
          
          this.keywords = defaultKeywords as Keyword[];
          keywords = defaultKeywords as Keyword[];
        }
        
        // Crear un mapa para acceso rápido por nombre de keyword
        keywords.forEach(keyword => {
          this.keywordMap.set(keyword.name.toLowerCase(), keyword);
          
          // También mapear los nombres alternativos si están disponibles
          if (keyword.names && keyword.names.length) {
            keyword.names.forEach(name => {
              this.keywordMap.set(name.toLowerCase(), keyword);
            });
          }
        });
        
        console.log('Keyword map keys:', Array.from(this.keywordMap.keys()));
        console.log('Keyword map values:', Array.from(this.keywordMap.values()));
        
        // Cargar las cartas después de obtener las keywords
        this.loadCards();
      },
      error: (error: any) => {
        console.error('Error fetching keywords', error);
        
        // Aun si hay error al cargar keywords, añadir algunas predeterminadas
        const defaultKeywords = [
          { id: '1', name: 'Vulnerable', description: 'Recibe un 50% más de daño de ataques.' },
          { id: '2', name: 'Block', description: 'Reduce el daño recibido en la cantidad indicada.' }
        ];
        
        this.keywords = defaultKeywords as Keyword[];
        
        defaultKeywords.forEach(keyword => {
          this.keywordMap.set(keyword.name.toLowerCase(), keyword as Keyword);
        });
        
        // Cargar las cartas
        this.loadCards();
      }
    });
  }
  
  loadCards(): void {
    // Usar el método actualizado getAllCards que maneja el formato Spring Data REST
    this.apiService.getAllCards().subscribe({
      next: (cards: Card[]) => {
        console.log('Processed cards:', cards);
        this.cards = cards;
        
        // Procesar las descripciones para resaltar keywords
        this.processCardDescriptions();
        
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error fetching cards', error);
        this.error = 'Failed to load cards. Please try again later.';
        this.loading = false;
      }
    });
  }
  processCardDescriptions(): void {
    if (!this.cards || this.cards.length === 0) {
      console.warn('No hay cartas para procesar');
      return;
    }
    
    if (this.keywordMap.size === 0) {
      console.warn('No hay keywords mapeadas');
      return;
    }
    
    console.log('Processing card descriptions for keywords...', 
      'Cards:', this.cards.length, 
      'Keywords:', this.keywordMap.size);
    
    for (const card of this.cards) {
      if (card.description) {
        console.log(`Procesando carta: ${card.name}, descripción: ${card.description}`);
        card.keyword_description = this.highlightKeywords(card.description);
      } else {
        console.warn(`Carta sin descripción: ${card.name}`);
      }
    }
    
    // Verificar el procesamiento
    const cardsWithHighlights = this.cards.filter(c => 
      c.keyword_description !== c.description && 
      c.keyword_description !== undefined);
    
    console.log(`${cardsWithHighlights.length} cartas tienen keywords resaltadas`);
  }  highlightKeywords(text: string): SafeHtml {
    if (!text || this.keywordMap.size === 0) {
      return text;
    }
    
    console.log('Procesando texto:', text);
    
    // Lista de palabras clave específicas que queremos resaltar
    const specificKeywords = ['Vulnerable', 'Block', 'Upgrade'];
    
    // Añadir keywords específicas al mapa si no existen
    specificKeywords.forEach(keyword => {
      if (!this.keywordMap.has(keyword.toLowerCase())) {
        console.log(`Agregando keyword específica al mapa: ${keyword}`);
        let description = '';
        
        if (keyword === 'Block') {
          description = 'Until next turn, prevents damage.';
        } else if (keyword === 'Upgrade') {
          description = 'Upgrading cards makes them more powerful. Cards can only be upgraded once.';
        } else if (keyword === 'Vulnerable') {
          description = 'Recibe un 50% más de daño de ataques.';
        }
        
        this.keywordMap.set(keyword.toLowerCase(), {
          id: `auto-${keyword}`,
          name: keyword,
          description,
          names: []
        });
      }
    });
    
    // Compilar todas las keywords en un solo array (para procesarlas por longitud)
    const allKeywords = Array.from(this.keywordMap.values())
      .map(k => k.name)
      .sort((a, b) => b.length - a.length); // Procesar primero las palabras más largas
    
    console.log('Keywords a procesar:', allKeywords);
    
    // Envolver texto en un div para procesamiento
    let processedText = `<div>${text}</div>`;
    
    // Procesar cada keyword
    for (const keywordName of allKeywords) {
      const keyword = this.keywordMap.get(keywordName.toLowerCase());
      if (!keyword) continue;
      
      // Escapar caracteres especiales para la expresión regular
      const escapedKeyword = keywordName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      
      // Crear una expresión regular que detecte la palabra completa
      // Modificación para permitir seguido por ":" y con findLastIndex para evitar problemas con overlap
      const regex = new RegExp(`\\b(${escapedKeyword})\\b(?:\\s*:)?`, 'g');
        // Reemplazar cada ocurrencia con un span que tenga los atributos data-keyword y data-description
      processedText = processedText.replace(regex, (match, p1) => {
        const cleanKeyword = p1.trim(); // Obtenemos la palabra clave sin el ":"
        const isFollowedByColon = match.includes(':');
        
        // Si la palabra está seguida por un ":", incluimos la descripción
        if (isFollowedByColon) {
          return `<span class="keyword-highlight" data-tooltip="${keyword.description}">${cleanKeyword}</span>: ${keyword.description}`;
        } else {
          return `<span class="keyword-highlight" data-tooltip="${keyword.description}">${cleanKeyword}</span>`;
        }
      });
    }
    
    console.log('Texto procesado final:', processedText);
    
    // Eliminar el div externo que agregamos
    processedText = processedText.replace(/^<div>(.*)<\/div>$/s, '$1');
    
    return this.sanitizer.bypassSecurityTrustHtml(processedText);
  }  addCardToDeck(card: Card): void {
    // Check if user is logged in
    if (!this.authService.isLoggedIn()) {
      alert('Please log in to add cards to your deck');
      this.router.navigate(['/login']);
      return;
    }

    import('./deck-selection-dialog/deck-selection-dialog.component').then(m => {
      const dialogRef = this.dialog.open(m.DeckSelectionDialogComponent, {
        width: '400px',
        data: { card }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result === 'create') {
          // Navigate to create a new deck
          this.router.navigate(['/decks'], { state: { createNew: true, cardId: card.id } });
        } else if (result?.success) {
          // Success message
          alert(`Card "${card.name}" was added to deck "${result.deck.name}"`);
        }
      });
    });
  }

  ngAfterViewInit(): void {
    // El servicio de tooltips ya está inyectado y configurado automáticamente
  }
}
