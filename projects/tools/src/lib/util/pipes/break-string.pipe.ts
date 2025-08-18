import { Pipe, PipeTransform } from '@angular/core';

import { DASH } from '../const';
import { isNil, isString } from '../functions';
import { Nullable } from '../interfaces/nullable.type';

@Pipe({
    name: 'breakString',
})
export class BreakStringPipe implements PipeTransform {
    public transform(value: Nullable<string>): string {
        if (isNil(value)) {
            return DASH;
        }

        if (value && isString(value)) {
            if (/\s/.test(value) || /^[A-Z0-9\s]+$/.test(value) || /\d/.test(value) || /[^\w\s]/.test(value)) {
                return value;
            }

            return value.split(/(?=[A-Z])/).join(' ');
        }

        return value.toString();
    }
}
