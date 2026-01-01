import { Directive, HostListener, inject, input, InputSignal } from '@angular/core';
import { Router } from '@angular/router';

import { Nullable } from '../interfaces';
import { PlatformService } from '../services';
import { WINDOW } from '../tokens';

@Directive({
    selector: '[rtNavigationDirective]',
    providers: [PlatformService],
})
export class RtNavigationDirective {
    readonly #router: Router = inject(Router);
    readonly #windowRef: Window = inject(WINDOW);
    readonly #platformService: PlatformService = inject(PlatformService);

    public link: InputSignal<Nullable<string>> = input.required({ alias: 'rtNavigationDirective' });

    @HostListener('click', ['$event'])
    public onClick(event: MouseEvent): void {
        if (this.link()) {
            if (this.#platformService.isPlatformBrowser && (event.ctrlKey || event.metaKey)) {
                this.#windowRef.open(this.link() as string);
            } else {
                void this.#router.navigate([this.link()]);
            }
        }
    }
}
