import { AfterViewInit, Directive, InputSignal, inject, input } from '@angular/core';
import { MatTooltip } from '@angular/material/tooltip';

@Directive({
    standalone: true,
    selector: '[rtHideTooltipDirective]',
})
export class RtHideTooltipDirective implements AfterViewInit {
    #matTooltip: MatTooltip = inject(MatTooltip);

    public element: InputSignal<HTMLElement> = input.required<HTMLElement>({
        alias: 'rtHideTooltipDirective',
    });

    public ngAfterViewInit(): void {
        const element: HTMLElement = this.element();

        if (element) {
            const observer: MutationObserver = new MutationObserver(() => this.#setTooltipState());

            observer.observe(element, {
                childList: true,
                characterData: true,
                subtree: true,
            });

            this.#setTooltipState();
        }
    }

    #setTooltipState(): void {
        this.#matTooltip.disabled = this.element()?.offsetWidth === this.element()?.scrollWidth;
    }
}
