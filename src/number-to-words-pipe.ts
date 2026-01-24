import { Pipe, PipeTransform } from '@angular/core';
import { ToWords } from 'to-words';

@Pipe({
  name: 'numberToWords',
  standalone: true,
})
export class NumberToWordsPipe implements PipeTransform {

 private toWords = new ToWords({
    localeCode: 'en-IN',
    converterOptions: {
      currency: true,
      ignoreDecimal: true,
      ignoreZeroCurrency: false,
    },
  });

   transform(value: number): string {
    if (value === null || value === undefined || isNaN(value)) {
      return '';
    }

    return this.toWords.convert(Math.floor(value)); 
  }

}
