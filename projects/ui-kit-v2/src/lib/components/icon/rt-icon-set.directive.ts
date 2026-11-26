import { computed, Directive, forwardRef, inject, input, InputSignal, Signal } from '@angular/core';

import { RT_ICON_SET_ATTRIBUTE } from './rt-icon.const';
import { IRtIconSetScope, RT_ICON_SET_SCOPE, RtIconSetService } from './rt-icon-set.service';

/**
 * Набор значков части страницы. Он сильнее выбора `use()` и признака material в разметке.
 *
 * ```html
 * <section rtIconSet="material">…</section>
 * ```
 */
@Directive({
    selector: '[rtIconSet]',
    providers: [{ provide: RT_ICON_SET_SCOPE, useExisting: forwardRef(() => RtIconSetDirective) }],
    host: {
        [`[attr.${RT_ICON_SET_ATTRIBUTE}]`]: 'set()',
    },
})
export class RtIconSetDirective implements IRtIconSetScope {
    readonly #service: RtIconSetService = inject(RtIconSetService);
    readonly #outer: IRtIconSetScope | null = inject(RT_ICON_SET_SCOPE, { optional: true, skipSelf: true });

    /** Имя набора. Пустое значение оставляет набор внешней части. */
    public readonly rtIconSet: InputSignal<string | null> = input.required<string | null>();

    public readonly set: Signal<string | null> = computed((): string | null => {
        const own: string | null = this.rtIconSet();

        return own ? this.#service.known(own) : (this.#outer?.set() ?? null);
    });
}
