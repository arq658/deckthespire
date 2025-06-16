import { Injectable, Renderer2, RendererFactory2, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class TooltipService {
  private renderer: Renderer2;
  private tooltipElement: HTMLElement | null = null;
  
  constructor(
    rendererFactory: RendererFactory2,
    @Inject(DOCUMENT) private document: Document
  ) {
    this.renderer = rendererFactory.createRenderer(null, null);
    this.createTooltipElement();
    this.setupGlobalListeners();
  }
  
  private createTooltipElement(): void {
    // Crear el elemento tooltip una sola vez
    this.tooltipElement = this.renderer.createElement('div');
    this.renderer.addClass(this.tooltipElement, 'global-tooltip');
    this.renderer.setStyle(this.tooltipElement, 'display', 'none');
    
    if (this.document.body) {
      this.renderer.appendChild(this.document.body, this.tooltipElement);
    }
  }
  
  private setupGlobalListeners(): void {
    if (typeof window !== 'undefined') {
      // Manejar el movimiento del mouse para todos los elementos con data-tooltip
      this.renderer.listen('document', 'mouseover', (event: MouseEvent) => {
        const target = event.target as HTMLElement;
        if (!target) return;
        
        // Buscar el elemento más cercano con data-tooltip
        const tooltipElement = this.findTooltipElement(target);
        if (tooltipElement && tooltipElement.hasAttribute('data-tooltip')) {
          const tooltipText = tooltipElement.getAttribute('data-tooltip');
          if (tooltipText) {
            this.showTooltip(tooltipText, tooltipElement, event);
          }
        }
      });
      
      // Ocultar tooltip cuando el mouse sale
      this.renderer.listen('document', 'mouseout', (event: MouseEvent) => {
        const target = event.target as HTMLElement;
        if (!target) return;
        
        const tooltipElement = this.findTooltipElement(target);
        if (tooltipElement && tooltipElement.hasAttribute('data-tooltip')) {
          this.hideTooltip();
        }
      });
    }
  }
  
  private findTooltipElement(element: HTMLElement): HTMLElement | null {
    if (!element) return null;
    
    // Check if the current element has data-tooltip
    if (element.hasAttribute('data-tooltip')) {
      return element;
    }
    
    // Check if any parent element has data-tooltip
    let parent = element.parentElement;
    while (parent) {
      if (parent.hasAttribute('data-tooltip')) {
        return parent;
      }
      parent = parent.parentElement;
    }
    
    return null;
  }
  
  private showTooltip(text: string, element: HTMLElement, event: MouseEvent): void {
    if (!this.tooltipElement) return;
    
    // Actualizar el contenido
    this.renderer.setProperty(this.tooltipElement, 'innerHTML', text);
    
    // Mostrar el tooltip
    this.renderer.setStyle(this.tooltipElement, 'display', 'block');
    
    // Calcular posición
    const rect = element.getBoundingClientRect();
    const tooltipRect = this.tooltipElement.getBoundingClientRect();
    
    // Posición por defecto (encima del elemento)
    let top = rect.top - tooltipRect.height - 10;
    let left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
    
    // Asegurarse de que no se salga de la ventana
    if (top < 0) {
      // Si no cabe arriba, mostrar abajo
      top = rect.bottom + 10;
    }
    
    if (left < 0) {
      left = 0;
    } else if (left + tooltipRect.width > window.innerWidth) {
      left = window.innerWidth - tooltipRect.width;
    }
    
    // Aplicar posición
    this.renderer.setStyle(this.tooltipElement, 'top', `${top}px`);
    this.renderer.setStyle(this.tooltipElement, 'left', `${left}px`);
  }
  
  private hideTooltip(): void {
    if (this.tooltipElement) {
      this.renderer.setStyle(this.tooltipElement, 'display', 'none');
    }
  }
}
