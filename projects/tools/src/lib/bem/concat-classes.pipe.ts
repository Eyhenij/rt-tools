import { Pipe, PipeTransform } from '@angular/core';

import { isString } from '../util';

@Pipe({
    name: 'concatClasses',
})
export class ConcatClassesPipe implements PipeTransform {
    public transform<C extends string | boolean | null | undefined>(classes: (C | C[])[]): string {
        // eslint-disable-next-line
        const validClassList = classes.flat().filter((className) => isString(className) && !!className.trim());
        return validClassList.join(' ');
    }
}
