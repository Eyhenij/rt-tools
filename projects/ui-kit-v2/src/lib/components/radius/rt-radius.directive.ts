import { computed, Directive, inject, input, InputSignal, Signal } from '@angular/core';

import { RT_RADIUS_DEFAULT, TRtRadius } from '@rt-tools/ui-kit-v2/core';

/**
 * Вход скругления, один на весь кит. Компонент с поверхностью берёт его
 * хост-директивой, и у всех он называется одинаково — `radius`.
 *
 * Шаг ложится на хост атрибутом `data-rt-radius`, а не наследуемым свойством:
 * свойство протекло бы в каждый вложенный компонент, и скруглённая карточка
 * скруглила бы все кнопки в себе. Атрибут читают только правила своего хоста.
 *
 * Пустой вход атрибута не пишет: компонент остаётся со своим скруглением по
 * умолчанию из собственных стилей.
 *
 * @example
 * ```ts
 * @Component({
 *     selector: 'rt-card',
 *     hostDirectives: [{ directive: RtRadiusDirective, inputs: ['radius'] }],
 * })
 * ```
 * ```html
 * <rt-card radius="none">…</rt-card>
 * ```
 */
@Directive({
    selector: '[rtRadius]',
    host: {
        '[attr.data-rt-radius]': 'step()',
    },
})
export class RtRadiusDirective {
    readonly #fallback: TRtRadius | null = inject(RT_RADIUS_DEFAULT, { optional: true }) ?? null;

    /** Шаг шкалы. Пусто — скругление компонента по умолчанию. */
    public readonly radius: InputSignal<TRtRadius | null | undefined> = input<TRtRadius | null | undefined>(null);

    /** Шаг на хосте: названный входом, иначе умолчание хоста, если оно задано. */
    public readonly step: Signal<TRtRadius | null> = computed((): TRtRadius | null => this.radius() ?? this.#fallback);
}
