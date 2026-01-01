import { Pipe, PipeTransform } from '@angular/core';

import { isEmail } from '../functions';

@Pipe({
    name: 'isEmail',
})
export class IsEmailPipe implements PipeTransform {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public transform(value: any): boolean {
        return isEmail(value);
    }
}
