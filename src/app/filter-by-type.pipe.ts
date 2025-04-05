import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterByType',
  standalone: true
})
export class FilterByTypePipe implements PipeTransform {
  transform(seats: { id: string; type: string; price: number }[], type: string): { id: string; type: string; price: number }[] {
    return seats.filter(seat => seat.type === type);
  }
}