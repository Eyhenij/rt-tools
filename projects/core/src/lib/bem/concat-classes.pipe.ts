import { Pipe, PipeTransform } from '@angular/core';

/** Что разметка кладёт в список классов: имя, условие или пустоту. */
export type TClassValue = string | boolean | null | undefined;

@Pipe({
    name: 'concatClasses',
})
export class ConcatClassesPipe implements PipeTransform {
    public transform<C extends TClassValue>(classes: (C | C[])[]): string {
        // `flat()` на дженерике даёт условный тип, читать который здесь нечем и незачем: список
        // классов всегда однороден, и приведение к нему одноступенчатое.
        const flatClasses: TClassValue[] = classes.flat();

        return flatClasses.filter((className: TClassValue): boolean => typeof className === 'string' && !!className.trim()).join(' ');
    }
}
