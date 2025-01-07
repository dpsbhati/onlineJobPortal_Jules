import { Directive, HostListener, ElementRef } from '@angular/core';

@Directive({
  selector: '[appNumberFormatter]',
})
export class NumberFormatterDirective {
  private regex: RegExp = new RegExp(/^\d+$/);

  constructor(private el: ElementRef) {}

  @HostListener('input', ['$event'])
  onInputChange(event: Event): void {
    const input = this.el.nativeElement;
    const value = input.value.replace(/,/g, ''); // Remove commas for formatting
    if (!this.regex.test(value) && value !== '') {
      input.value = input.value.slice(0, -1); // Remove invalid character
      return;
    }
    input.value = this.formatNumber(value);
  }

  private formatNumber(value: string): string {
    return value.replace(/\B(?=(\d{3})+(?!\d))/g, ','); // Add commas
  }
}
