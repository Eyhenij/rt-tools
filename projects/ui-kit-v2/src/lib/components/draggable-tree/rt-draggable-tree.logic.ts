import { IRtTree } from '@rt-tools/ui-kit-v2/tree';
import { IRtDraggableTree } from './rt-draggable-tree.model';

type TNode<TValue> = IRtTree.Node<TValue>;
type TNodes<TValue> = ReadonlyArray<TNode<TValue>>;

/** Где узел лежит: его соседи, место среди них и значение родителя. */
interface ILocation<TValue> {
    readonly node: TNode<TValue>;
    readonly siblings: TNodes<TValue>;
    readonly index: number;
    readonly parent: TValue | null;
}

/** Контейнер — узел с массивом детей, даже пустым: он принимает узлы внутрь. */
function isContainer<TValue>(node: TNode<TValue>): boolean {
    return Array.isArray(node.children);
}

function locate<TValue>(nodes: TNodes<TValue>, value: TValue, parent: TValue | null = null): ILocation<TValue> | null {
    for (let index: number = 0; index < nodes.length; index++) {
        const node: TNode<TValue> = nodes[index];
        if (node.value === value) {
            return { siblings: nodes, node, index, parent };
        }
        const found: ILocation<TValue> | null = locate(node.children ?? [], value, node.value);
        if (found) {
            return found;
        }
    }
    return null;
}

function holds<TValue>(node: TNode<TValue>, value: TValue): boolean {
    return (node.children ?? []).some((child: TNode<TValue>): boolean => child.value === value || holds(child, value));
}

function without<TValue>(nodes: TNodes<TValue>, value: TValue): TNodes<TValue> {
    return nodes
        .filter((node: TNode<TValue>): boolean => node.value !== value)
        .map((node: TNode<TValue>): TNode<TValue> =>
            node.children && holds(node, value) ? { ...node, children: without(node.children, value) } : node
        );
}

function inserted<TValue>(nodes: TNodes<TValue>, moving: TNode<TValue>, drop: IRtDraggableTree.Drop<TValue>): TNodes<TValue> {
    const at: number = nodes.findIndex((node: TNode<TValue>): boolean => node.value === drop.target);
    if (at >= 0 && drop.place !== 'inside') {
        const index: number = drop.place === 'before' ? at : at + 1;
        return [...nodes.slice(0, index), moving, ...nodes.slice(index)];
    }
    return nodes.map((node: TNode<TValue>): TNode<TValue> => {
        if (node.value === drop.target && drop.place === 'inside') {
            return { ...node, children: [...(node.children ?? []), moving] };
        }
        if (node.children && holds(node, drop.target)) {
            return { ...node, children: inserted(node.children, moving, drop) };
        }
        return node;
    });
}

function siblingPlace<TValue>(here: ILocation<TValue>, step: number): IRtDraggableTree.Drop<TValue> | null {
    const next: TNode<TValue> | undefined = here.siblings[here.index + step];
    return next ? { target: next.value, place: step < 0 ? 'before' : 'after' } : null;
}

function levelPlace<TValue>(here: ILocation<TValue>, out: boolean): IRtDraggableTree.Drop<TValue> | null {
    if (out) {
        return here.parent === null ? null : { target: here.parent, place: 'after' };
    }
    const above: TNode<TValue> | undefined = here.siblings[here.index - 1];
    return above && isContainer(above) ? { target: above.value, place: 'inside' } : null;
}

/**
 * Место сброса по третям высоты строки: верхняя — перед целью, нижняя — после, средняя — внутрь.
 * Средняя треть листа места не даёт: внутрь принимает только контейнер.
 */
export function rtDragPlace<TValue>(target: TNode<TValue>, top: number, height: number, pointer: number): IRtDraggableTree.Place | null {
    const third: number = height / 3;
    const offset: number = pointer - top;
    if (offset < third) {
        return 'before';
    }
    if (offset > 2 * third) {
        return 'after';
    }
    return isContainer(target) ? 'inside' : null;
}

/**
 * Можно ли поставить узел на место: не на себя, не в своё поддерево, внутрь — только в контейнер, и
 * если приложение не запретило.
 */
export function rtDragAllowed<TValue>(
    nodes: TNodes<TValue>,
    value: TValue,
    drop: IRtDraggableTree.Drop<TValue>,
    canDrop: IRtDraggableTree.CanDrop<TValue> | null = null
): boolean {
    const moving: ILocation<TValue> | null = locate(nodes, value);
    const target: ILocation<TValue> | null = locate(nodes, drop.target);
    if (!moving || !target || drop.target === value || holds(moving.node, drop.target)) {
        return false;
    }
    if (drop.place === 'inside' && !isContainer(target.node)) {
        return false;
    }
    return canDrop ? canDrop(moving.node, target.node, drop.place) : true;
}

/** Переносит узел вместе с поддеревом. Узлы на входе не меняются: ветки на пути строятся заново. */
export function rtDragMove<TValue>(
    nodes: TNodes<TValue>,
    value: TValue,
    drop: IRtDraggableTree.Drop<TValue>
): IRtDraggableTree.MoveResult<TValue> | null {
    const moving: ILocation<TValue> | null = locate(nodes, value);
    if (!moving || !rtDragAllowed(nodes, value, drop)) {
        return null;
    }
    const next: TNodes<TValue> = inserted(without(nodes, value), moving.node, drop);
    const landed: ILocation<TValue> | null = locate(next, value);
    if (!landed) {
        return null;
    }
    return { nodes: next, moved: { node: moving.node, parent: landed.parent, index: landed.index } };
}

/**
 * Место для переноса клавишей с Alt. Вверх и вниз — среди соседей, влево — сразу после своей ветки,
 * вправо — последним в контейнер, стоящий прямо над узлом. Двигаться некуда — `null`.
 */
export function rtDragKeyPlace<TValue>(nodes: TNodes<TValue>, value: TValue, key: string): IRtDraggableTree.Drop<TValue> | null {
    const here: ILocation<TValue> | null = locate(nodes, value);
    if (!here) {
        return null;
    }
    if (key === 'ArrowUp' || key === 'ArrowDown') {
        return siblingPlace(here, key === 'ArrowUp' ? -1 : 1);
    }
    if (key === 'ArrowLeft' || key === 'ArrowRight') {
        return levelPlace(here, key === 'ArrowLeft');
    }
    return null;
}
