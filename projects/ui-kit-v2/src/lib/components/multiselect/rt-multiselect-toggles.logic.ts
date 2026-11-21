import { rtTreeFind, rtTreeLeaves } from '@rt-tools/ui-kit-v2/core';
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

/**
 * Значения, которых «Показать все» и «Сбросить» не касаются: отключённые и не входящие в список.
 * Человек их не выбирал в строках, и снять их тут нечем — они остаются в значении формы как были.
 */
export function rtMultiselectKept<TValue>(all: ReadonlyArray<TValue>, chosen: ReadonlyArray<TValue>): ReadonlyArray<TValue> {
    return chosen.filter((value: TValue): boolean => !all.includes(value));
}

/** Значение после «Показать все»: включено всё — остаются только нетронутые, иначе к выбранному добавляется всё. */
export function rtMultiselectToggleAllNext<TValue>(all: ReadonlyArray<TValue>, chosen: ReadonlyArray<TValue>): ReadonlyArray<TValue> {
    if (rtMultiselectSummary(all, chosen).state === 'all') {
        return rtMultiselectKept(all, chosen);
    }
    return [...chosen, ...all.filter((value: TValue): boolean => !chosen.includes(value))];
}

/** Есть ли что сбрасывать: хотя бы одно значение из тех, что можно включить и выключить. */
export function rtMultiselectCanReset<TValue>(all: ReadonlyArray<TValue>, chosen: ReadonlyArray<TValue>): boolean {
    return chosen.some((value: TValue): boolean => all.includes(value));
}

/**
 * Сколько выбранных значений есть среди опций, отключённые опции тоже считаются: их строки на экране
 * видны отмеченными. Значение вне списка строки не имеет и в счёт «Выбрано: N» не идёт.
 */
export function rtMultiselectKnownCount<TValue>(options: ReadonlyArray<IRtSelect.Option<TValue>>, chosen: ReadonlyArray<TValue>): number {
    return chosen.filter((value: TValue): boolean => rtTreeFind(options, value) !== undefined).length;
}
