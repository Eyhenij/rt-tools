import { Directive, effect, input, InputSignal, InputSignalWithTransform } from '@angular/core';
import { Nullable } from '@rt-tools/core';

import { transformArrayInput } from '../functions';

@Directive({
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
