import { Directive, InputSignal, InputSignalWithTransform, effect, input } from '@angular/core';

import { transformArrayInput } from '../functions';
import { Nullable } from '../interfaces';

@Directive({
    standalone: true,
    selector: '[rtScrollToElement]',
})
export class RtScrollToElementDirective {
    public rtScrollToElement: InputSignal<string | number> = input.required<string | number>();
    public elements: InputSignalWithTransform<unknown[], unknown[]> = input.required<unknown[], unknown[]>({
        transform: (value: unknown[]) => transformArrayInput(value),
    });

    constructor() {
        effect(() => {
            if (this.elements()?.length && this.rtScrollToElement()) {
                this.#scrollToTarget();
            }
        });
    }

    #scrollToTarget(): void {
        const targetId: string | number = this.rtScrollToElement();
        const targetElement: Nullable<HTMLElement> = document.getElementById(targetId.toString());
        targetElement?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}
