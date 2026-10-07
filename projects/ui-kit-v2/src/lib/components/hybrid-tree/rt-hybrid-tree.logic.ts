import { rtTreeLeaves } from '@rt-tools/ui-kit-v2/select';
import { rtTreeAloneBase, rtTreeChoose, rtTreeChooseAlone, rtTreeMark, rtTreeVisibleLeaves } from '@rt-tools/ui-kit-v2/tree';
import { IRtTree } from '@rt-tools/ui-kit-v2/tree';
import { IRtHybridTree } from './rt-hybrid-tree.model';

/**
 * Расчёт выбора `rt-hybrid-tree` — чистые функции над неизменяемыми узлами.
 *
 * Всё, что у гибридного дерева общее с `rt-tree`, считает модуль `rt-tree`: здесь только правила
 * группы, где выбирается один лист. Её листья не набираются «выбрать всё» и каскадом ветки, а
 * выбор одного снимает соседей по группе. Каждая функция отвечает новым массивом выбора.
 */

type TNode<TValue> = IRtHybridTree.Node<TValue>;

function childrenOf<TValue>(node: TNode<TValue>): ReadonlyArray<TNode<TValue>> {
    return node.children ?? [];
}

function isBranch<TValue>(node: TNode<TValue>): boolean {
    return childrenOf(node).length > 0;
}

/** Ветка, в которой выбирается один прямой лист. */
export function rtHybridTreeIsSingleGroup<TValue>(node: TNode<TValue>): boolean {
    return !!node.single && isBranch(node);
}

function without<TValue>(value: ReadonlyArray<TValue>, drop: ReadonlyArray<TValue>): ReadonlyArray<TValue> {
    return value.filter((item: TValue): boolean => !drop.includes(item));
}

function withAll<TValue>(value: ReadonlyArray<TValue>, add: ReadonlyArray<TValue>): ReadonlyArray<TValue> {
    return [...value, ...add.filter((item: TValue): boolean => !value.includes(item))];
}

/** Прямые листья группы — и включённые, и выключенные. */
function directLeaves<TValue>(group: TNode<TValue>): ReadonlyArray<TNode<TValue>> {
    return childrenOf(group).filter((child: TNode<TValue>): boolean => !isBranch(child));
}

/** Все листья под узлом, выключенные тоже: счёт выбранного видит и их. */
function allLeaves<TValue>(node: TNode<TValue>): ReadonlyArray<TValue> {
    return isBranch(node) ? childrenOf(node).flatMap((child: TNode<TValue>): ReadonlyArray<TValue> => allLeaves(child)) : [node.value];
}

function collectSingles<TValue>(nodes: ReadonlyArray<TNode<TValue>>, into: Set<TValue>): void {
    nodes.forEach((node: TNode<TValue>): void => {
        if (rtHybridTreeIsSingleGroup(node)) {
            directLeaves(node).forEach((leaf: TNode<TValue>): void => {
                into.add(leaf.value);
            });
        }
        collectSingles(childrenOf(node), into);
    });
}

/** Листья групп, где выбирается один: их не набирают ни «выбрать всё», ни каскад ветки. */
export function rtHybridTreeSingleLeaves<TValue>(nodes: ReadonlyArray<TNode<TValue>>): ReadonlySet<TValue> {
    const singles: Set<TValue> = new Set<TValue>();
    collectSingles(nodes, singles);
    return singles;
}

/** Группа «один лист», прямым листом которой стоит значение. */
export function rtHybridTreeGroupOf<TValue>(nodes: ReadonlyArray<TNode<TValue>>, value: TValue): TNode<TValue> | null {
    for (const node of nodes) {
        if (rtHybridTreeIsSingleGroup(node) && directLeaves(node).some((leaf: TNode<TValue>): boolean => leaf.value === value)) {
            return node;
        }
        const found: TNode<TValue> | null = rtHybridTreeGroupOf(childrenOf(node), value);
        if (found) {
            return found;
        }
    }
    return null;
}

function freeLeaves<TValue>(node: TNode<TValue>, singles: ReadonlySet<TValue>): ReadonlyArray<TValue> {
    return rtTreeLeaves(node).filter((leaf: TValue): boolean => !singles.has(leaf));
}

/**
 * Отметка строки. Группа «один лист» отмечена, пока выбран любой её лист. Прочая ветка в каскаде
 * отмечена по своим свободным листьям; без выбранных свободных — частью, пока под ней что-то выбрано.
 */
export function rtHybridTreeMark<TValue>(
    node: TNode<TValue>,
    value: ReadonlyArray<TValue>,
    cascade: boolean,
    singles: ReadonlySet<TValue>
): IRtTree.Mark {
    if (rtHybridTreeIsSingleGroup(node)) {
        return directLeaves(node).some((leaf: TNode<TValue>): boolean => value.includes(leaf.value)) ? 'all' : 'none';
    }
    if (!cascade || !isBranch(node)) {
        return rtTreeMark(node, value, cascade);
    }
    const free: ReadonlyArray<TValue> = freeLeaves(node, singles);
    const count: number = free.filter((leaf: TValue): boolean => value.includes(leaf)).length;
    if (count > 0) {
        return count === free.length ? 'all' : 'some';
    }
    return allLeaves(node).some((leaf: TValue): boolean => value.includes(leaf)) ? 'some' : 'none';
}

/** Клик по листу группы «один лист»: лист выбирается вместо соседей, выбранный снимается. */
function chooseSingleLeaf<TValue>(group: TNode<TValue>, leaf: TValue, value: ReadonlyArray<TValue>): ReadonlyArray<TValue> {
    if (value.includes(leaf)) {
        return without(value, [leaf]);
    }
    const siblings: ReadonlyArray<TValue> = directLeaves(group)
        .filter((child: TNode<TValue>): boolean => !child.disabled && child.value !== leaf)
        .map((child: TNode<TValue>): TValue => child.value);
    return withAll(without(value, siblings), [leaf]);
}

/** Радио группы «один лист»: снимает выбор группы или выбирает её первый включённый лист. */
function chooseSingleGroup<TValue>(group: TNode<TValue>, value: ReadonlyArray<TValue>): ReadonlyArray<TValue> {
    const enabled: ReadonlyArray<TValue> = directLeaves(group)
        .filter((child: TNode<TValue>): boolean => !child.disabled)
        .map((child: TNode<TValue>): TValue => child.value);
    if (directLeaves(group).some((child: TNode<TValue>): boolean => value.includes(child.value))) {
        return without(value, enabled);
    }
    return enabled.length > 0 ? withAll(value, [enabled[0]]) : value;
}

/** Каскад ветки: добавляет свободные листья, а когда добавлять нечего — снимает все, листья групп «один лист» тоже. */
function chooseBranch<TValue>(node: TNode<TValue>, value: ReadonlyArray<TValue>, singles: ReadonlySet<TValue>): ReadonlyArray<TValue> {
    const free: ReadonlyArray<TValue> = freeLeaves(node, singles);
    if (free.length === 0 || rtHybridTreeMark(node, value, true, singles) === 'all') {
        return without(value, rtTreeLeaves(node));
    }
    return withAll(value, free);
}

/** Выбор после клика в режиме флажков, без правила одного узла на клик. */
function chooseMultiple<TValue>(
    nodes: ReadonlyArray<TNode<TValue>>,
    node: TNode<TValue>,
    value: ReadonlyArray<TValue>,
    cascade: boolean,
    singles: ReadonlySet<TValue>
): ReadonlyArray<TValue> {
    if (rtHybridTreeIsSingleGroup(node)) {
        return chooseSingleGroup(node, value);
    }
    const group: TNode<TValue> | null = singles.has(node.value) ? rtHybridTreeGroupOf(nodes, node.value) : null;
    if (group) {
        return chooseSingleLeaf(group, node.value, value);
    }
    if (cascade && isBranch(node)) {
        return chooseBranch(node, value, singles);
    }
    return rtTreeChoose(node, value, 'multiple', cascade);
}

/**
 * Выбор после клика по узлу. В режиме флажков действуют правила групп «один лист»: клик без Ctrl и
 * Cmd в исключающем режиме оставляет свободный узел одним, а лист группы «один лист» выбор вне
 * группы не трогает. Остальные режимы считает `rt-tree`.
 */
export function rtHybridTreeChoose<TValue>(
    nodes: ReadonlyArray<TNode<TValue>>,
    node: TNode<TValue>,
    value: ReadonlyArray<TValue>,
    options: IRtHybridTree.ChooseOptions
): ReadonlyArray<TValue> {
    if (node.disabled) {
        return value;
    }
    if (options.mode !== 'multiple') {
        return rtTreeChoose(node, value, options.mode, options.cascade);
    }
    const singles: ReadonlySet<TValue> = rtHybridTreeSingleLeaves(nodes);
    if (!options.alone || singles.has(node.value)) {
        return chooseMultiple(nodes, node, value, options.cascade, singles);
    }
    if (singles.size === 0) {
        return rtTreeChooseAlone(nodes, node, value, options.cascade);
    }
    return chooseMultiple(nodes, node, rtTreeAloneBase(nodes, node, value), options.cascade, singles);
}

/** Отметка «выбрать всё» по свободным листьям видимых строк. */
export function rtHybridTreeSelectAllMark<TValue>(
    rows: ReadonlyArray<IRtTree.Row<TValue>>,
    value: ReadonlyArray<TValue>,
    singles: ReadonlySet<TValue>
): IRtTree.Mark {
    const free: ReadonlyArray<TValue> = rtTreeVisibleLeaves(rows).filter((leaf: TValue): boolean => !singles.has(leaf));
    const count: number = free.filter((leaf: TValue): boolean => value.includes(leaf)).length;
    if (count === 0) {
        return 'none';
    }
    return count === free.length ? 'all' : 'some';
}

/**
 * Выбор после клика по «выбрать всё»: свободные листья видимых строк добавляются, листья групп
 * «один лист» остаются как были. Когда выбраны все свободные — снимаются все видимые листья.
 */
export function rtHybridTreeSelectAll<TValue>(
    rows: ReadonlyArray<IRtTree.Row<TValue>>,
    value: ReadonlyArray<TValue>,
    singles: ReadonlySet<TValue>
): ReadonlyArray<TValue> {
    const leaves: ReadonlyArray<TValue> = rtTreeVisibleLeaves(rows);
    if (rtHybridTreeSelectAllMark(rows, value, singles) === 'all') {
        return without(value, leaves);
    }
    return withAll(
        value,
        leaves.filter((leaf: TValue): boolean => !singles.has(leaf))
    );
}

/** Сколько листьев под узлом выбрано. У листа счёта нет. */
export function rtHybridTreeChosenCount<TValue>(node: TNode<TValue>, value: ReadonlyArray<TValue>): number {
    if (!isBranch(node)) {
        return 0;
    }
    return allLeaves(node).filter((leaf: TValue): boolean => value.includes(leaf)).length;
}
