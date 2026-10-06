import { Directive, effect, EmbeddedViewRef, inject, input, InputSignal, TemplateRef, ViewContainerRef } from '@angular/core';
import { TPermission } from '@rt-tools/auth-contract';

import { RtAuthService } from './auth.service';
import { TRtPermissionRequirement } from './requirement';

/**
 * Shows the block only to a caller with the rights. One right is written as a string, several —
 * with the word whether all or any are needed. The block follows the rights: a refreshed token
 * that brings or takes a right shows or hides it without a reload.
 *
 * ```html
 * <a *rtIfPermission="'orders:write'">New order</a>
 * <section *rtIfPermission="{ some: ['orders:read', 'orders:write'] }">…</section>
 * ```
 */
@Directive({ selector: '[rtIfPermission]' })
export class RtIfPermissionDirective {
    readonly #auth: RtAuthService = inject(RtAuthService);
    readonly #template: TemplateRef<unknown> = inject(TemplateRef);
    readonly #container: ViewContainerRef = inject(ViewContainerRef);
    #view: EmbeddedViewRef<unknown> | null = null;

    public readonly rtIfPermission: InputSignal<TPermission | TRtPermissionRequirement> = input.required<
        TPermission | TRtPermissionRequirement
    >();

    constructor() {
        effect((): void => {
            const value: TPermission | TRtPermissionRequirement = this.rtIfPermission();
            const shown: boolean = this.#auth.meets(typeof value === 'string' ? { every: [value] } : value);
            if (shown === (this.#view !== null)) {
                return;
            }
            if (shown) {
                this.#view = this.#container.createEmbeddedView(this.#template);
            } else {
                this.#container.clear();
                this.#view = null;
            }
        });
    }
}
