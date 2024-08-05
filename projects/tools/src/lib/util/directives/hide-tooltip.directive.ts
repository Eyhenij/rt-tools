import { Directive, InputSignal, InputSignalWithTransform, booleanAttribute, effect, inject, input } from '@angular/core';
import { MatTooltip } from '@angular/material/tooltip';

@Directive({
    standalone: true,
    selector: '[rtHideTooltipDirective]',
})
export class RtHideTooltipDirective {
    #matTooltip: MatTooltip = inject(MatTooltip);

    public rtHideTooltipDirective: InputSignal<HTMLElement> = input.required<HTMLElement>();
    public isTooltipShown: InputSignalWithTransform<boolean, boolean> = input<boolean, boolean>(true, {
        transform: booleanAttribute,
    });

    constructor() {
        effect(() => {
            if (this.rtHideTooltipDirective() && this.isTooltipShown()) {
                this.#isTitleCut();
            }
        });
    }

    #isTitleCut(): void {
        if (this.rtHideTooltipDirective()) {
            const titleWidth: number = this.rtHideTooltipDirective()?.offsetWidth;
            const textWidth: number = this.rtHideTooltipDirective()?.scrollWidth;

            this.#matTooltip.disabled = titleWidth === textWidth;
        }
    }
}
