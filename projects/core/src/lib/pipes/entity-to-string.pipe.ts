import { Pipe, PipeTransform } from '@angular/core';

import { DASH, isNumber, isString } from '@rt-tools/utils';

@Pipe({
    name: 'entityToString',
    pure: true,
})
export class EntityToStringPipe implements PipeTransform {
    public transform<T>(value: T): string {
        if (isString(value)) {
            return value;
        }

        if (isNumber(value)) {
            return value.toString();
        }

        return DASH;
    }
}
