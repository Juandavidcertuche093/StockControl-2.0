import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'orderBy'
})
export class OrderByPipe implements PipeTransform {

  transform(array: any[], field: string): any[] {
    if (!Array.isArray(array) || !field) {
      return array;
    }
    return array.sort((a, b) => a[field].localeCompare(b[field]));
  }

}
