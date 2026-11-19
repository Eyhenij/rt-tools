import { rtTreeLeaves } from '@rt-tools/ui-kit-v2/core';
import { IRtSelect } from '@rt-tools/ui-kit-v2/select';

/**
 * Вид мультиселекта. `list` — флажки в списке и чипы в поле, как прежде. `toggles` — переключатели
 * в строках, строка «Показать все» над ними, а поле пишет сводку: «Все», «N из M» или подсказку.
 */
export type TRtMultiselectLook = 'list' | 'toggles';

/** Сводка выбора для поля вида `toggles`: включено всё, часть или ничего. */
export interface IRtMultiselectSummary {
    readonly state: 'all' | 'some' | 'none';
    readonly count: number;
    readonly total: number;
}

/** Все значения, которые можно включить: включённые листья каждой опции, ветки разворачиваются. */
export function rtMultiselectAllValues<TValue>(options: ReadonlyArray<IRtSelect.Option<TValue>>): ReadonlyArray<TValue> {
    return options.flatMap((option: IRtSelect.Option<TValue>): ReadonlyArray<TValue> => rtTreeLeaves(option));
}

/** Сколько из возможных значений включено. Значение вне списка не считается: его нет в строках. */
export function rtMultiselectSummary<TValue>(all: ReadonlyArray<TValue>, chosen: ReadonlyArray<TValue>): IRtMultiselectSummary {
    const count: number = all.filter((value: TValue): boolean => chosen.includes(value)).length;
    const total: number = all.length;
    if (count === 0) {
        return { count, total, state: 'none' };
    }
    return { count, total, state: count === total ? 'all' : 'some' };
}
