import { Directive, input, InputSignalWithTransform } from '@angular/core';
import { BooleanInput } from '@angular/cdk/coercion';

@Directive({
    selector: 'mat-icon[rtIconOutlined]',
    host: {
        '[style.fontVariationSettings]': 'fontVariationSettings',
    },
})
export class RtIconOutlinedDirective {
    public isOutlined: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        alias: 'rtIconOutlined',
        transform: (value: BooleanInput) => Boolean(value),
    });

    public get fontVariationSettings(): string {
        return this.isOutlined() ? "'FILL' 0, 'wght' 700, 'GRAD' 0, 'opsz' 48" : "'FILL' 1, 'wght' 700, 'GRAD' 0, 'opsz' 48";
    }
}
