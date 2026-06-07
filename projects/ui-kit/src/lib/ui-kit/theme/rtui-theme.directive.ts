import { Directive, input, InputSignal } from '@angular/core';

import { RtThemeType } from './rtui-theme.types';

/**
 * Local theme context (GMT `data-theme` analogue).
 *
 * Sets `data-rt-theme` on the host, re-scoping all adaptive `--rt-*` tokens
 * inside the subtree through `color-scheme` + `light-dark()`:
 *
 * ```html
 * <!-- dark promo card inside a light page -->
 * <section [rtTheme]="'dark'">…</section>
 * ```
 *
 * Note: `color` is inherited as a resolved value — re-apply text tokens
 * on elements inside the context (e.g. `color: var(--rt-text-base-primary)`).
 */
@Directive({
    standalone: true,
    selector: '[rtTheme]',
    host: {
        '[attr.data-rt-theme]': 'rtTheme() || null',
    },
})
export class RtThemeDirective {
    public readonly rtTheme: InputSignal<RtThemeType | ''> = input<RtThemeType | ''>('');
}
