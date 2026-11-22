import { computed, Signal } from '@angular/core';

import { TRtKitLabelParams, rtKitLabel } from '@rt-tools/ui-kit-v2/core';
import { IRtSelect } from '@rt-tools/ui-kit-v2/select';

import {
    IRtMultiselectSummary,
    rtMultiselectAllValues,
    rtMultiselectCanReset,
    rtMultiselectKept,
    rtMultiselectSummary,
    rtMultiselectToggleAllNext,
} from './rt-multiselect-toggles.logic';

/** Что вид `toggles` читает у мультиселекта. Функции, а не сигналы: входы поля объявлены после вида. */
export interface IRtMultiselectTogglesSource<TValue> {
    readonly options: () => ReadonlyArray<IRtSelect.Option<TValue>>;
    readonly value: () => ReadonlyArray<TValue>;
    /** Сводка «всё включено»: `allLabel` поля или слово кита. */
    readonly allText: () => string;
    /** Сводка «ничего не включено»: подсказка поля. */
    readonly placeholder: () => string;
}

/**
 * Вид `toggles` мультиселекта: что можно включить, сводка выбора, её подпись в поле и значения после
 * «Показать все» и «Сбросить». Создаётся в инициализаторе поля компонента: подпись «N из M» берёт
 * переводчик кита через `inject`.
 */
export class RtMultiselectTogglesView<TValue> {
    readonly #source: IRtMultiselectTogglesSource<TValue>;
    readonly #countOf: Signal<string>;

    /** Все значения, которые можно включить, — для «Показать все» и для сводки «N из M». */
    public readonly all: Signal<ReadonlyArray<TValue>>;
    /** Есть ли что сбрасывать: отключённые и неизвестные значения «Сбросить» не снимает. */
    public readonly canReset: Signal<boolean>;
    public readonly summary: Signal<IRtMultiselectSummary>;
    /** Сводка в поле: всё включено — `allText`, часть — «N из M», ничего — подсказка. */
    public readonly text: Signal<string>;

    constructor(source: IRtMultiselectTogglesSource<TValue>) {
        this.#source = source;
        this.all = computed((): ReadonlyArray<TValue> => rtMultiselectAllValues(source.options()));
        this.canReset = computed((): boolean => rtMultiselectCanReset(this.all(), source.value()));
        this.summary = computed((): IRtMultiselectSummary => rtMultiselectSummary(this.all(), source.value()));
        this.#countOf = rtKitLabel(
            'uiCountOf',
            computed((): TRtKitLabelParams => ({ count: this.summary().count, total: this.summary().total }))
        );
        this.text = computed((): string => {
            switch (this.summary().state) {
                case 'all':
                    return source.allText();
                case 'some':
                    return this.#countOf();
                default:
                    return source.placeholder();
            }
        });
    }

    /** Значение после «Сбросить»: остаются только отключённые и не входящие в список. */
    public resetNext(): ReadonlyArray<TValue> {
        return rtMultiselectKept(this.all(), this.#source.value());
    }

    /** Значение после «Показать все»: включено всё — снимает всё, иначе включает всё, что можно. */
    public toggleAllNext(): ReadonlyArray<TValue> {
        return rtMultiselectToggleAllNext(this.all(), this.#source.value());
    }
}
