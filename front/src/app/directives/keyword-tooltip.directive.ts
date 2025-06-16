import { Directive, ElementRef, AfterViewInit, OnDestroy, Inject, PLATFORM_ID, NgZone, Renderer2 } from '@angular/core';
import { MatTooltip } from '@angular/material/tooltip';
import { ViewContainerRef } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';

@Directive({
  selector: '[appKeywordTooltip]',
  standalone: true
})
export class KeywordTooltipDirective implements AfterViewInit, OnDestroy {
  private observer: MutationObserver | null = null;
  private isBrowser: boolean;

  constructor(
    private el: ElementRef, 
    private viewContainerRef: ViewContainerRef,
    private renderer: Renderer2,
    private zone: NgZone,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngAfterViewInit() {
    if (!this.isBrowser) {
      return; // No ejecutar en SSR
    }
    
    // Establecer un timeout para asegurar que el DOM esté listo
    setTimeout(() => this.setupObserver(), 0);
  }

  ngOnDestroy() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }

  private setupObserver() {
    if (!this.isBrowser) return;
    
    try {
      // Configurar un MutationObserver para detectar cambios en el DOM
      this.observer = new MutationObserver(() => this.addTooltipsToKeywords());
      
      // Observar cambios en el DOM
      this.observer.observe(this.el.nativeElement, {
        childList: true,
        subtree: true
      });
      
      // Aplicar inicialmente
      this.addTooltipsToKeywords();
    } catch (error) {
      console.error('Error setting up observer:', error);
    }
  }  private addTooltipsToKeywords() {
    if (!this.isBrowser) return;
    
    try {
      // Buscar todos los elementos con la clase keyword-highlight
      const keywordElements = this.el.nativeElement.querySelectorAll('.keyword-highlight');
      console.log(`Found ${keywordElements.length} keyword elements`);
      
      // Añadir tooltips a cada uno
      this.zone.runOutsideAngular(() => {
        keywordElements.forEach((element: HTMLElement) => {
          if (!element.hasAttribute('data-tooltip-initialized')) {
            const keyword = element.getAttribute('data-keyword');
            const description = element.getAttribute('data-description');
            
            console.log(`Processing keyword: ${keyword}, description: ${description}`);
            
            if (keyword && description) {
              // Preparar el tooltip manualmente
              this.renderer.setStyle(element, 'cursor', 'help');
              this.renderer.setStyle(element, 'position', 'relative');
              
              // Crear tooltip manual
              const tooltipDiv = this.renderer.createElement('div');
              this.renderer.addClass(tooltipDiv, 'manual-tooltip');
              this.renderer.setStyle(tooltipDiv, 'display', 'none');
              this.renderer.setStyle(tooltipDiv, 'position', 'absolute');
              this.renderer.setStyle(tooltipDiv, 'bottom', '100%');
              this.renderer.setStyle(tooltipDiv, 'left', '50%');
              this.renderer.setStyle(tooltipDiv, 'transform', 'translateX(-50%)');
              this.renderer.setStyle(tooltipDiv, 'background-color', 'rgba(0, 0, 0, 0.9)');
              this.renderer.setStyle(tooltipDiv, 'color', 'white');
              this.renderer.setStyle(tooltipDiv, 'padding', '5px 10px');
              this.renderer.setStyle(tooltipDiv, 'border-radius', '4px');
              this.renderer.setStyle(tooltipDiv, 'z-index', '1000');
              this.renderer.setStyle(tooltipDiv, 'min-width', '200px');
              this.renderer.setStyle(tooltipDiv, 'text-align', 'center');
              this.renderer.setStyle(tooltipDiv, 'border', '1px solid #f6d74a');
              
              const tooltipText = `${keyword}: ${description}`;
              this.renderer.appendChild(tooltipDiv, this.renderer.createText(tooltipText));
              this.renderer.appendChild(element, tooltipDiv);
              
              // Eventos para mostrar/ocultar tooltip
              this.renderer.listen(element, 'mouseenter', () => {
                this.renderer.setStyle(tooltipDiv, 'display', 'block');
              });
              
              this.renderer.listen(element, 'mouseleave', () => {
                this.renderer.setStyle(tooltipDiv, 'display', 'none');
              });
              
              // Marcar como inicializado
              this.renderer.setAttribute(element, 'data-tooltip-initialized', 'true');
              console.log(`Tooltip initialized for ${keyword}`);
            }
          }
        });
      });
    } catch (error) {
      console.error('Error adding tooltips:', error);
    }
  }
}
