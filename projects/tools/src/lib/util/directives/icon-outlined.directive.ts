import { booleanAttribute, Directive, HostBinding, input, InputSignalWithTransform } from '@angular/core';
import { BooleanInput } from '@angular/cdk/coercion';

@Directive({
    selector: '[rtIconOutlinedDirective]',
})
export class RtIconOutlinedDirective {
    public isOutlined: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        alias: 'rtIconOutlinedDirective',
        transform: booleanAttribute,
    });

    @HostBinding('style.fontVariationSettings')
    public get fontVariationSettings(): string {
        // eslint-disable-next-line quotes
        return this.isOutlined() ? "'FILL' 0, 'wght' 700, 'GRAD' 0, 'opsz' 48" : "'FILL' 1, 'wght' 700, 'GRAD' 0, 'opsz' 48";
    }
}
