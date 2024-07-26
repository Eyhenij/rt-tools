import { afterRender, Directive, input, InputSignal } from '@angular/core';

import { Nullable } from '../interfaces';

@Directive({
    standalone: true,
    selector: '[rtScrollToElement]',
})
export class RtScrollToElementDirective {
    public rtScrollToElement: InputSignal<string | number> = input.required<string | number>();

    constructor() {
        afterRender(() => {
            this.#scrollToTarget();
        });
    }

    #scrollToTarget(): void {
        if (this.rtScrollToElement()) {
            const targetId: string | number = this.rtScrollToElement();
            const targetElement: Nullable<HTMLElement> = document.getElementById(targetId.toString());
            targetElement?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }
}
