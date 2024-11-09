import { Pipe, PipeTransform } from '@angular/core';

/**
 * @description Use to compare not equality to all items with provided value
 * @example
 *
 * Direct usage
 * ```ts
 *   notEqualPipe.transform(100, 1, 10, 100) // => false
 * ```
 *
 * Template usage
 *
 * ```html
 *   <div *ngIf="100 | notEqual:1:10:100">Invisible</div>
 * ```
 */
@Pipe({
    standalone: true,
    name: 'notEqual',
})
export class NotEqualPipe implements PipeTransform {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public transform(value: any, ...compares: any[]): boolean {
        return compares.reduce((notEqual: boolean, compare: boolean) => notEqual && value !== compare, true);
    }
}
