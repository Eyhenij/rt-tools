import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'ternary',
})
export class TernaryPipe implements PipeTransform {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public transform(value: any, option1: any, option2: any): any {
        return Boolean(value) ? option1 : option2;
    }
}
