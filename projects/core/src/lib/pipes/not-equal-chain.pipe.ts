import { Pipe, PipeTransform } from '@angular/core';

/**
 * @description Use to access to the deep object state for comparison
 * @example
 *  {a: {b: true}} | equalChain:'a':'b':false => true
 */
@Pipe({
    name: 'notEqualChain',
})
export class NotEqualChainPipe implements PipeTransform {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public transform(obj: object, ...args: any[]): boolean {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const compared: any = args.pop();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return Boolean(obj) && args.reduce((inner: any, arg: string) => inner[arg], obj) !== compared;
    }
}
