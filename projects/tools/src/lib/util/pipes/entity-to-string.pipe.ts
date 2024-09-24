import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    standalone: true,
    name: 'entityToString',
})
export class EntityToStringPipe implements PipeTransform {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public transform(value: any): string {
        if (typeof value === 'string') {
            return value;
        } else if (typeof value === 'number') {
            return value.toString();
        } else {
            return '';
        }
    }
}
