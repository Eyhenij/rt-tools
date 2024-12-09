import { Directive, inject, input, InputSignal, OnDestroy, OnInit, output, OutputEmitterRef } from '@angular/core';

import { PlatformService } from '../services';
import { WINDOW } from '../tokens';

@Directive({
    selector: '[rtScrollDirective]',
})
export class RtScrollDirective implements OnInit, OnDestroy {
    readonly #windowRef: Window = inject(WINDOW);
    readonly #platformService: PlatformService = inject(PlatformService);

    public active: InputSignal<boolean> = input<boolean>(true);
    public multiplier: InputSignal<number> = input<number>(0.5);

    public readonly scrollAction: OutputEmitterRef<void> = output<void>();

    public ngOnInit(): void {
        if (this.#platformService.isPlatformBrowser) {
            this.#windowRef.addEventListener('scroll', this.scroll, true);
        }
    }

    public ngOnDestroy(): void {
        this.#windowRef.removeEventListener('scroll', this.scroll, true);
    }

    public scroll: EventListener = (event: Event): void => {
        const target: HTMLElement = event.target as HTMLElement;

        if (this.active() && target.offsetHeight + target.scrollTop >= target.scrollHeight * this.multiplier()) {
            this.scrollAction.emit();
        }
    };
}
