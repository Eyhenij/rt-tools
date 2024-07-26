import { Directive, HostBinding, InputSignal, input } from '@angular/core';

@Directive({
    standalone: true,
    selector: '[rtIconOutlinedDirective]',
})
export class RtIconOutlinedDirective {
    public rtIconOutlinedDirective: InputSignal<boolean> = input<boolean>(false);

    @HostBinding('style.fontVariationSettings')
    get fontVariationSettings(): string {
        return this.rtIconOutlinedDirective() ? "'FILL' 0, 'wght' 700, 'GRAD' 0, 'opsz' 48" : "'FILL' 1, 'wght' 700, 'GRAD' 0, 'opsz' 48";
    }
}
