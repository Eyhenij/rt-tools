import { Pipe, PipeTransform } from '@angular/core';

import { Nullable } from '../interfaces';

@Pipe({
    standalone: true,
    name: 'rtCapitalizePipe',
})
export class RtCapitalizePipe implements PipeTransform {
    public transform(value: Nullable<string>): Nullable<string> {
        if (!value) {
            return value;
        }
        return value.replace(/\b\w/g, (char: string) => char.toUpperCase());
    }
}
