import { Pipe, PipeTransform } from '@angular/core';

import { DASH } from '../const';
import { isNil, isString } from '../functions';
import { Nullable } from '../interfaces/nullable.type';

@Pipe({
    standalone: true,
    name: 'breakString',
})
export class BreakStringPipe implements PipeTransform {
    public transform(value: Nullable<string>): string {
        if (isNil(value)) {
            return DASH;
        }

        if (value && isString(value)) {
            return value.split(/(?=[A-Z])/).join(' ');
        }

        return value.toString();
    }
}
