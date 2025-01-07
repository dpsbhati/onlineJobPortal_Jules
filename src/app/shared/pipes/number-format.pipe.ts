import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'numberFormat',
  standalone: true
})
export class NumberFormatPipe implements PipeTransform {
  transform(value: number | string): string {
    if (!value) return '';
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return num.toLocaleString('en-IN');
  }
}
