import { Directive, HostBinding, InputSignalWithTransform, booleanAttribute, input } from '@angular/core';

@Directive({
    standalone: true,
    selector: '[rtIconOutlinedDirective]',
})
export class RtIconOutlinedDirective {
    public isOutlined: InputSignalWithTransform<unknown, boolean> = input<unknown, boolean>(false, {
        alias: 'rtIconOutlinedDirective',
        transform: booleanAttribute,
    });

    @HostBinding('style.fontVariationSettings')
    public get fontVariationSettings(): string {
        // eslint-disable-next-line quotes
        return this.isOutlined() ? "'FILL' 0, 'wght' 700, 'GRAD' 0, 'opsz' 48" : "'FILL' 1, 'wght' 700, 'GRAD' 0, 'opsz' 48";
    }
}
