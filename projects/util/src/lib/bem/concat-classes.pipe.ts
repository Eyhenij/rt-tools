import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'concatClasses',
    standalone: true,
})
export class ConcatClassesPipe implements PipeTransform {
    public transform<C extends string | boolean | null | undefined>(classes: (C | C[])[]): string {
        const validClassList = classes.flat().filter((className) => typeof className === 'string' && !!className.trim());
        return validClassList.join(' ');
    }
}
