import { IRtTree } from '../tree/rt-tree.model';

type TNode<TValue> = IRtTree.Node<TValue>;

/** Слова строки поиска в нижнем регистре, без пустых. */
export function rtTreeSelectorWords(term: string): ReadonlyArray<string> {
    return term
        .toLowerCase()
        .split(/\s+/)
        .filter((word: string): boolean => word !== '');
}

function nodeText<TValue>(node: TNode<TValue>): string {
    const badges: string = (node.badges ?? []).map((badge: IRtTree.Badge): string => badge.text).join(' ');
    return `${node.label} ${node.description ?? ''} ${badges}`.toLowerCase();
}

function keepMatching<TValue>(nodes: ReadonlyArray<TNode<TValue>>, words: ReadonlyArray<string>): TNode<TValue>[] {
    return nodes.reduce((kept: TNode<TValue>[], node: TNode<TValue>): TNode<TValue>[] => {
        const text: string = nodeText(node);
        if (words.every((word: string): boolean => text.includes(word))) {
            kept.push(node);
            return kept;
        }
        const inside: TNode<TValue>[] = keepMatching(node.children ?? [], words);
        if (inside.length > 0) {
            kept.push({ ...node, children: inside });
        }
        return kept;
    }, []);
}

/**
 * Узлы, в которых нашлось каждое слово поиска — в подписи, описании или метках. Совпавшая ветка
 * остаётся со всем поддеревом: без детей она выглядела бы листом. Несовпавшая ветка остаётся путём к
 * совпавшим внизу. Узлы не правятся: отобранная ветка — новый объект.
 */
export function rtTreeSelectorFilter<TValue>(nodes: ReadonlyArray<TNode<TValue>>, term: string): ReadonlyArray<TNode<TValue>> {
    const words: ReadonlyArray<string> = rtTreeSelectorWords(term);
    if (words.length === 0) {
        return nodes;
    }
    return keepMatching(nodes, words);
}

/** Выключенные узлы дерева на любой глубине. */
function disabledValues<TValue>(nodes: ReadonlyArray<TNode<TValue>>, into: Set<TValue>): Set<TValue> {
    nodes.forEach((node: TNode<TValue>): void => {
        if (node.disabled) {
            into.add(node.value);
        }
        disabledValues(node.children ?? [], into);
    });
    return into;
}

/** Выбор после «Очистить»: остаются только выключенные узлы — снять их человек не может. */
export function rtTreeSelectorClear<TValue>(nodes: ReadonlyArray<TNode<TValue>>, choice: ReadonlyArray<TValue>): ReadonlyArray<TValue> {
    const disabled: Set<TValue> = disabledValues(nodes, new Set<TValue>());
    return choice.filter((value: TValue): boolean => disabled.has(value));
}

/** Равны ли два выбора без учёта порядка. */
export function rtTreeSelectorSame<TValue>(a: ReadonlyArray<TValue>, b: ReadonlyArray<TValue>): boolean {
    const left: Set<TValue> = new Set<TValue>(a);
    const right: Set<TValue> = new Set<TValue>(b);
    return left.size === right.size && [...left].every((value: TValue): boolean => right.has(value));
}

/** Включено ли «Применить»: черновик отличается от выбора и не пуст там, где пустой выбор запрещён. */
export function rtTreeSelectorCanApply<TValue>(
    draft: ReadonlyArray<TValue>,
    choice: ReadonlyArray<TValue>,
    emptyAllowed: boolean
): boolean {
    if (!emptyAllowed && draft.length === 0) {
        return false;
    }
    return !rtTreeSelectorSame(draft, choice);
}
