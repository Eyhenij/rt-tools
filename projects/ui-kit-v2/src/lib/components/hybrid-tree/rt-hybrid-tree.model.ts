import { IRtTree } from '../tree/rt-tree.model';

/**
 * Модель `<rt-hybrid-tree>`: узел дерева выбора с признаком группы, где выбирается один лист.
 */
export namespace IRtHybridTree {
    /** Узел гибридного дерева. `single` у ветки делает её прямые листья радио внутри группы. */
    export interface Node<TValue> extends IRtTree.Node<TValue> {
        single?: boolean;
        children?: ReadonlyArray<Node<TValue>>;
    }

    /** Как дерево считает клик: режим отметок, каскад и правило одного узла на клик без Ctrl и Cmd. */
    export interface ChooseOptions {
        readonly mode: IRtTree.Mode;
        readonly cascade: boolean;
        readonly alone: boolean;
    }
}
