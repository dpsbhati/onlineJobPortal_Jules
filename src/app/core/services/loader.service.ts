import { Injectable } from '@angular/core';
import { Renderer2, RendererFactory2 } from '@angular/core';
@Injectable({
  providedIn: 'root'
})
export class LoaderService {
  private spinnerOverlay: HTMLElement | null = null;
  private renderer: Renderer2;

  constructor(private rendererFactory: RendererFactory2) {
    this.renderer = this.rendererFactory.createRenderer(null, null);
  }

  show(): void {
    if (!this.spinnerOverlay) {
      this.spinnerOverlay = this.renderer.createElement('div');
      this.renderer.addClass(this.spinnerOverlay, 'spinner-overlay');
  
      // Create a custom spinner div
      const spinner = this.renderer.createElement('div');
      this.renderer.addClass(spinner, 'custom-spinner');
  
      this.renderer.appendChild(this.spinnerOverlay, spinner);
      this.renderer.appendChild(document.body, this.spinnerOverlay);
    }
  }
  
  hide(): void {
    if (this.spinnerOverlay) {
      // Remove overlay from DOM
      this.renderer.removeChild(document.body, this.spinnerOverlay);
      this.spinnerOverlay = null;
    }
  }
}
