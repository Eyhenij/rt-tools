import { linkedSignal, Signal, WritableSignal } from '@angular/core';

import { ISortModel } from '@rt-tools/utils';

import { nextSort } from './rt-table-sort.logic';

/**
 * Выбранная сортировка. Заводится от входа `[sort]` и переключается заголовками:
 * таблица показывает порядок и без потребителя, который его слушает.
 */
export class RtTableSortState {
    readonly #selected: WritableSignal<ISortModel<string> | null>;

    /** Текущая сортировка: вход `[sort]` либо последнее переключение заголовком. */
    public readonly current: Signal<ISortModel<string> | null>;

    constructor(fromInput: () => ISortModel<string> | null) {
        this.#selected = linkedSignal<ISortModel<string> | null>((): ISortModel<string> | null => fromInput());
        this.current = this.#selected.asReadonly();
    }

    /** Переключает порядок по колонке: по возрастанию → по убыванию → без сортировки. */
    public toggle(propertyName: string): ISortModel<string> | null {
        const selected: ISortModel<string> | null = nextSort(this.#selected(), propertyName);
        this.#selected.set(selected);

        return selected;
    }
}
