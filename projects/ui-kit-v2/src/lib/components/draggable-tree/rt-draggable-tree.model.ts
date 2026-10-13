import { IRtTree } from '@rt-tools/ui-kit-v2/tree';

/**
 * Модель `<rt-draggable-tree>`. Узел — тот же `IRtTree.Node`, что у `rt-tree`: перетаскиваемое
 * дерево меняет только порядок, а не вид узла.
 */
export namespace IRtDraggableTree {
    /** Куда встаёт узел относительно цели: перед ней, после неё или последним внутрь. */
    export type Place = 'before' | 'after' | 'inside';

    /** Место сброса: цель и положение относительно неё. */
    export interface Drop<TValue> {
        readonly target: TValue;
        readonly place: Place;
    }

    /** Что сообщается наружу после переноса: узел, его новый родитель и место среди новых соседей. */
    export interface Moved<TValue> {
        readonly node: IRtTree.Node<TValue>;
        readonly parent: TValue | null;
        readonly index: number;
    }

    /** Итог переноса: новый массив узлов и то, что о нём сообщается. */
    export interface MoveResult<TValue> {
        readonly nodes: ReadonlyArray<IRtTree.Node<TValue>>;
        readonly moved: Moved<TValue>;
    }

    /** Запрет приложения: `false` — место не предлагается. */
    export type CanDrop<TValue> = (node: IRtTree.Node<TValue>, target: IRtTree.Node<TValue>, place: Place) => boolean;
}
