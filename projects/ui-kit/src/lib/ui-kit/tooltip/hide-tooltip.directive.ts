import { AfterViewInit, booleanAttribute, Directive, effect, inject, input, InputSignal, InputSignalWithTransform } from '@angular/core';
import { MatTooltip } from '@angular/material/tooltip';

@Directive({
    selector: '[rtHideTooltipDirective]',
})
export class RtHideTooltipDirective implements AfterViewInit {
    #matTooltip: MatTooltip = inject(MatTooltip);

    /** Current HTMLElement */
    public element: InputSignal<HTMLElement> = input.required<HTMLElement>({
        alias: 'rtHideTooltipDirective',
    });
    /** Indicates is tooltip shown */
    public isTooltipShown: InputSignalWithTransform<boolean, boolean> = input.required<boolean, boolean>({
        transform: booleanAttribute,
    });

    /** Set tooltip state by 'isTooltipShown' */
    constructor() {
        effect(() => {
            if (this.isTooltipShown()) {
                this.#setTooltipState();
            } else {
                this.#matTooltip.disabled = true;
            }
        });
    }

    public ngAfterViewInit(): void {
        const element: HTMLElement = this.element();

        /** Set tooltip state when HTMLElement changed */
        if (element) {
            const observer: MutationObserver = new MutationObserver(() => {
                if (this.isTooltipShown()) {
                    this.#setTooltipState();
                }
            });

            observer.observe(element, {
                childList: true,
                characterData: true,
                subtree: true,
            });

            if (this.isTooltipShown()) {
                this.#setTooltipState();
            }
        }
    }

    /** Set tooltip state by container and content width */
    #setTooltipState(): void {
        this.#matTooltip.disabled = this.element()?.offsetWidth === this.element()?.scrollWidth;
    }
}
