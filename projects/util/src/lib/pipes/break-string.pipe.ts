import { Pipe, PipeTransform } from '@angular/core';
import { Nullable } from '../interfaces';


@Pipe({
    standalone: true,
    name: 'breakString'
})
export class BreakStringPipe implements PipeTransform {
    public transform(value: Nullable<string>): string {
        if (value && typeof value === 'string') {
            return value.split(/(?=[A-Z])/).join(' ');
        } else if (value === null || value === undefined) {
            return '';
        } else {
            return value.toString();
        }
    }
}
