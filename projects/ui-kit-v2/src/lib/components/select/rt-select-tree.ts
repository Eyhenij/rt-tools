import { IRtSelect } from './rt-select.model';

/**
 * Дерево опций выбора из списка — общее для `rt-select` и `rt-multiselect`.
 *
 * Обе семьи раскладывают, ищут и считают дерево одинаково, поэтому это чистые функции в одном
 * месте: две копии разошлись бы на первой правке. Состояние — какие ветки раскрыты — живёт в семье,
 * здесь только расчёт по нему.
 */

type TOption<TValue> = IRtSelect.Option<TValue>;
type TRow<TValue> = IRtSelect.Row<TValue>;

function childrenOf<TValue>(option: TOption<TValue>): ReadonlyArray<TOption<TValue>> {
    return option.children ?? [];
}

function isBranch<TValue>(option: TOption<TValue>): boolean {
    return childrenOf(option).length > 0;
}

/** Список — дерево, если хоть у одной опции есть дети. Плоский список рисуется как прежде. */
export function rtTreeIsTree<TValue>(options: ReadonlyArray<TOption<TValue>>): boolean {
    return options.some((option: TOption<TValue>): boolean => isBranch(option));
}

/** Опция по значению на любой глубине. */
export function rtTreeFind<TValue>(options: ReadonlyArray<TOption<TValue>>, value: TValue): TOption<TValue> | undefined {
    for (const option of options) {
        if (option.value === value) {
            return option;
        }
        const found: TOption<TValue> | undefined = rtTreeFind(childrenOf(option), value);
        if (found) {
            return found;
        }
    }
    return undefined;
}

/**
 * Включённые листья под опцией; у самого листа — он сам. Отключённая ветка не отдаёт никого: её
 * листья выбрать нельзя, как и её саму.
 */
export function rtTreeLeaves<TValue>(option: TOption<TValue>): ReadonlyArray<TValue> {
    if (option.disabled) {
        return [];
    }
    if (!isBranch(option)) {
        return [option.value];
    }
    return childrenOf(option).flatMap((child: TOption<TValue>): ReadonlyArray<TValue> => rtTreeLeaves(child));
}

/** Сколько включённых листьев ветки выбрано. Флажок ветки выводится из этого, а не хранится. */
export function rtTreeBranchState<TValue>(option: TOption<TValue>, chosen: ReadonlyArray<TValue>): IRtSelect.TBranchState {
    const leaves: ReadonlyArray<TValue> = rtTreeLeaves(option);
    const count: number = leaves.filter((leaf: TValue): boolean => chosen.includes(leaf)).length;
    if (count === 0) {
        return 'none';
    }
    return count === leaves.length ? 'all' : 'some';
}

function holdsChosen<TValue>(option: TOption<TValue>, chosen: ReadonlyArray<TValue>): boolean {
    return childrenOf(option).some((child: TOption<TValue>): boolean => chosen.includes(child.value) || holdsChosen(child, chosen));
}

function collectOpen<TValue>(list: ReadonlyArray<TOption<TValue>>, chosen: ReadonlyArray<TValue>, open: Set<TValue>): void {
    for (const option of list) {
        if (holdsChosen(option, chosen)) {
            open.add(option.value);
            collectOpen(childrenOf(option), chosen, open);
        }
    }
}

/** Ветки, под которыми лежит выбранное значение: они раскрыты, когда список открывается. */
export function rtTreeOpenFor<TValue>(options: ReadonlyArray<TOption<TValue>>, chosen: ReadonlyArray<TValue>): ReadonlySet<TValue> {
    const open: Set<TValue> = new Set<TValue>();
    collectOpen(options, chosen, open);
    return open;
}

function matches<TValue>(option: TOption<TValue>, term: string): boolean {
    return option.label.toLowerCase().includes(term);
}

function descendantMatches<TValue>(option: TOption<TValue>, term: string): boolean {
    return childrenOf(option).some((child: TOption<TValue>): boolean => matches(child, term) || descendantMatches(child, term));
}

interface ITreeWalk<TValue> {
    readonly open: ReadonlySet<TValue>;
    readonly term: string;
    readonly rows: TRow<TValue>[];
}

interface IRowPlace<TValue> {
    readonly level: number;
    readonly parent: TValue | null;
    readonly filtered: boolean;
}

/**
 * Раскладка одной опции: кладёт её строку и отвечает, где раскладывать её детей, или `null`, если
 * их не видно. `filtered` — действует ли поисковое слово на уровень: под веткой, совпавшей самой и
 * раскрытой, дети идут все, как без поиска.
 */
function placeOption<TValue>(walk: ITreeWalk<TValue>, option: TOption<TValue>, place: IRowPlace<TValue>): IRowPlace<TValue> | null {
    const self: boolean = !place.filtered || matches(option, walk.term);
    const below: boolean = place.filtered && descendantMatches(option, walk.term);
    if (!self && !below) {
        return null;
    }
    const branch: boolean = isBranch(option);
    const openBySet: boolean = self && walk.open.has(option.value);
    const open: boolean = branch && (openBySet || below);
    walk.rows.push({ option, branch, open, level: place.level, parent: place.parent });
    return open ? { level: place.level + 1, parent: option.value, filtered: place.filtered && !openBySet } : null;
}

function walkRows<TValue>(walk: ITreeWalk<TValue>, list: ReadonlyArray<TOption<TValue>>, place: IRowPlace<TValue>): void {
    for (const option of list) {
        const childPlace: IRowPlace<TValue> | null = placeOption(walk, option, place);
        if (childPlace) {
            walkRows(walk, childrenOf(option), childPlace);
        }
    }
}

/**
 * Видимые строки по уровням. Без поискового слова раскрыты ветки из `open`. Со словом строка
 * остаётся, если совпала она сама или кто-то под ней, и путь к совпадению показан раскрытым.
 * Ветка, совпавшая сама, держит детей такими, какими они были.
 */
export function rtTreeRows<TValue>(
    options: ReadonlyArray<TOption<TValue>>,
    open: ReadonlySet<TValue>,
    rawTerm: string = ''
): ReadonlyArray<TRow<TValue>> {
    const term: string = rawTerm.toLowerCase().trim();
    const walk: ITreeWalk<TValue> = { open, term, rows: [] };
    walkRows(walk, options, { level: 0, parent: null, filtered: term.length > 0 });
    return walk.rows;
}

function sideRight<TValue>(rows: ReadonlyArray<TRow<TValue>>, row: TRow<TValue>, index: number): IRtSelect.SideKeyAnswer<TValue> {
    if (row.branch && !row.open) {
        return { toggle: row.option.value, index };
    }
    const firstChild: boolean = row.branch && rows[index + 1]?.parent === row.option.value;
    return { toggle: null, index: firstChild ? index + 1 : index };
}

function sideLeft<TValue>(rows: ReadonlyArray<TRow<TValue>>, row: TRow<TValue>, index: number): IRtSelect.SideKeyAnswer<TValue> {
    if (row.branch && row.open) {
        return { toggle: row.option.value, index };
    }
    const parentIndex: number = rows.findIndex((candidate: TRow<TValue>): boolean => candidate.option.value === row.parent);
    return { toggle: null, index: parentIndex >= 0 ? parentIndex : index };
}

/**
 * Ответ на боковую стрелку. Вправо: свёрнутая ветка раскрывается, раскрытая уводит подсветку на
 * первого ребёнка. Влево: раскрытая ветка сворачивается, иначе подсветка уходит на родителя.
 */
export function rtTreeSideKey<TValue>(rows: ReadonlyArray<TRow<TValue>>, index: number, key: string): IRtSelect.SideKeyAnswer<TValue> {
    const row: TRow<TValue> | undefined = rows[index];
    if (row && key === 'ArrowRight') {
        return sideRight(rows, row, index);
    }
    if (row && key === 'ArrowLeft') {
        return sideLeft(rows, row, index);
    }
    return { toggle: null, index };
}

/** Набор раскрытых веток с переключённой одной. */
export function rtTreeToggle<TValue>(open: ReadonlySet<TValue>, value: TValue): ReadonlySet<TValue> {
    const next: Set<TValue> = new Set<TValue>(open);
    if (next.has(value)) {
        next.delete(value);
    } else {
        next.add(value);
    }
    return next;
}
