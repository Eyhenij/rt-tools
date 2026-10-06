import { rtTreeBranchState, rtTreeLeaves } from '../select/rt-select-tree';
import { splitSideMenuTitle } from '../side-menu/rt-side-menu.logic';
import { IRtTree } from './rt-tree.model';

/**
 * Расчёт выбора `rt-tree` — чистые функции над неизменяемыми узлами.
 *
 * Строки, листья и отметки ветвей считает модуль дерева выбора из списка: здесь только то, чего у
 * выбора из списка нет — режим отметок, выключенный каскад и «выбрать всё». Узлы не меняются
 * никогда: каждая функция отвечает новым массивом выбора.
 */

type TNode<TValue> = IRtTree.Node<TValue>;

function isBranch<TValue>(node: TNode<TValue>): boolean {
    return (node.children ?? []).length > 0;
}

function without<TValue>(value: ReadonlyArray<TValue>, drop: ReadonlyArray<TValue>): ReadonlyArray<TValue> {
    return value.filter((item: TValue): boolean => !drop.includes(item));
}

function withAll<TValue>(value: ReadonlyArray<TValue>, add: ReadonlyArray<TValue>): ReadonlyArray<TValue> {
    return [...value, ...add.filter((item: TValue): boolean => !value.includes(item))];
}

/**
 * Отметка строки. В каскаде ветка отмечена по своим листьям; без каскада и у листа — по тому,
 * лежит ли в выборе сам узел.
 */
export function rtTreeMark<TValue>(node: TNode<TValue>, value: ReadonlyArray<TValue>, cascade: boolean): IRtTree.Mark {
    if (cascade && isBranch(node)) {
        return rtTreeBranchState(node, value);
    }
    return value.includes(node.value) ? 'all' : 'none';
}

/**
 * Выбор после клика по узлу. Выключенный узел выбор не меняет. Одиночный режим держит один узел и
 * не снимает его повторным кликом. В каскаде ветка добавляет свои включённые листья или снимает
 * их, когда выбраны все; выключенные листья остаются как были.
 */
export function rtTreeChoose<TValue>(
    node: TNode<TValue>,
    value: ReadonlyArray<TValue>,
    mode: IRtTree.Mode,
    cascade: boolean
): ReadonlyArray<TValue> {
    if (node.disabled || mode === 'none') {
        return value;
    }
    if (mode === 'single') {
        return [node.value];
    }
    if (cascade && isBranch(node)) {
        const leaves: ReadonlyArray<TValue> = rtTreeLeaves(node);
        return rtTreeBranchState(node, value) === 'all' ? without(value, leaves) : withAll(value, leaves);
    }
    return value.includes(node.value) ? without(value, [node.value]) : withAll(value, [node.value]);
}

/**
 * Включённые листья видимых строк. Раскрытая ветка отдаёт листья своими строками ниже, свёрнутая —
 * всеми листьями под собой: они видимы через неё.
 */
function visibleLeaves<TValue>(rows: ReadonlyArray<IRtTree.Row<TValue>>): ReadonlyArray<TValue> {
    return rows.flatMap((row: IRtTree.Row<TValue>): ReadonlyArray<TValue> => (row.branch && row.open ? [] : rtTreeLeaves(row.option)));
}

/** Отметка «выбрать всё» по включённым листьям видимых строк. */
export function rtTreeSelectAllMark<TValue>(rows: ReadonlyArray<IRtTree.Row<TValue>>, value: ReadonlyArray<TValue>): IRtTree.Mark {
    const leaves: ReadonlyArray<TValue> = visibleLeaves(rows);
    const count: number = leaves.filter((leaf: TValue): boolean => value.includes(leaf)).length;
    if (count === 0) {
        return 'none';
    }
    return count === leaves.length ? 'all' : 'some';
}

/**
 * Выбор после клика по «выбрать всё»: включённые листья видимых строк добавляются, а когда выбраны
 * все — снимаются. Выключенные листья `rtTreeLeaves` не отдаёт, поэтому их состояние не меняется.
 */
export function rtTreeSelectAll<TValue>(rows: ReadonlyArray<IRtTree.Row<TValue>>, value: ReadonlyArray<TValue>): ReadonlyArray<TValue> {
    const leaves: ReadonlyArray<TValue> = visibleLeaves(rows);
    return rtTreeSelectAllMark(rows, value) === 'all' ? without(value, leaves) : withAll(value, leaves);
}

/** Подпись и описание узла, разрезанные по найденному слову тем же резом, что у поиска меню. */
export function rtTreeLabelParts<TValue>(node: TNode<TValue>, term: string): IRtTree.LabelParts {
    return {
        label: splitSideMenuTitle(node.label, term),
        description: splitSideMenuTitle(node.description ?? '', term),
    };
}
