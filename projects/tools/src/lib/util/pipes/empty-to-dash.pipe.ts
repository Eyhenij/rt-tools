import { Pipe, PipeTransform } from '@angular/core';

import { emptyToDash } from '../functions';

@Pipe({
    standalone: true,
    name: 'emptyToDash',
    pure: true,
})
export class EmptyToDashPipe implements PipeTransform {
    public transform<T>(value: T | null | undefined): T | string {
        return emptyToDash(value);
    }
}
