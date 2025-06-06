import { Directive, HostBinding, input, InputSignalWithTransform } from '@angular/core';
import { BooleanInput } from '@angular/cdk/coercion';

@Directive({
    selector: 'mat-icon[rtIconOutlined]',
})
export class RtIconOutlinedDirective {
    public isOutlined: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        alias: 'rtIconOutlined',
        transform: (value: BooleanInput) => {
            return Boolean(value);
        },
    });

    @HostBinding('style.fontVariationSettings')
    public get fontVariationSettings(): string {
        // eslint-disable-next-line quotes
        return this.isOutlined() ? "'FILL' 0, 'wght' 700, 'GRAD' 0, 'opsz' 48" : "'FILL' 1, 'wght' 700, 'GRAD' 0, 'opsz' 48";
    }
}
