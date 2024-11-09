import { Pipe, PipeTransform } from '@angular/core';

/**
 * @description Use to compare equality to any of items with provided value
 * @example
 *
 * Direct usage
 * ```ts
 *   equalPipe.transform(100, 1, 10, 100) // => true
 * ```
 *
 * Template usage
 *
 * ```html
 *   <div *ngIf="100 | equal:1:10:100">Visible</div>
 * ```
 */
@Pipe({
    standalone: true,
    name: 'equal',
})
export class EqualPipe implements PipeTransform {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public transform(value: any, ...compares: any[]): boolean {
        return compares.reduce((equal: boolean, compare: boolean) => equal || value === compare, false);
    }
}
