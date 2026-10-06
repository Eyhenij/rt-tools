import { IRtTree } from '../tree/rt-tree.model';
import { rtDragAllowed, rtDragKeyPlace, rtDragMove, rtDragPlace } from './rt-draggable-tree.logic';
import { IRtDraggableTree } from './rt-draggable-tree.model';

type TNodes = ReadonlyArray<IRtTree.Node<string>>;

const LEAF: IRtTree.Node<string> = { label: 'Лист', value: 'leaf' };
const INNER: IRtTree.Node<string> = { label: 'Внутренняя', value: 'inner', children: [] };
const FOLDER: IRtTree.Node<string> = {
    label: 'Папка',
    value: 'folder',
    children: [{ label: 'Первый', value: 'one' }, { label: 'Второй', value: 'two' }, INNER],
};
const TREE: TNodes = [{ label: 'Начало', value: 'start' }, FOLDER, LEAF];

function valuesOf(nodes: TNodes): string[] {
    return nodes.map((node: IRtTree.Node<string>): string => node.value);
}

describe('rt-draggable-tree logic', (): void => {
    it('SC-UKV-654 — место сброса по третям строки, а у листа середина места не даёт', (): void => {
        expect(rtDragPlace(FOLDER, 100, 30, 105)).toBe('before');
        expect(rtDragPlace(FOLDER, 100, 30, 115)).toBe('inside');
        expect(rtDragPlace(FOLDER, 100, 30, 125)).toBe('after');
        expect(rtDragPlace(LEAF, 100, 30, 115)).toBeNull();
    });

    it('SC-UKV-655 — перенос даёт новый массив, а узлы на входе остаются прежними', (): void => {
        const before: string = JSON.stringify(TREE);

        const result: IRtDraggableTree.MoveResult<string> | null = rtDragMove(TREE, 'one', { target: 'folder', place: 'after' });

        expect(result).not.toBeNull();
        expect(valuesOf(result?.nodes ?? [])).toEqual(['start', 'folder', 'one', 'leaf']);
        expect(valuesOf(result?.nodes[1].children ?? [])).toEqual(['two', 'inner']);
        expect(result?.moved).toEqual({ node: FOLDER.children?.[0], parent: null, index: 2 });
        expect(JSON.stringify(TREE)).toBe(before);
        expect(result?.nodes).not.toBe(TREE);
    });

    it('SC-UKV-656 — узел внутрь контейнера встаёт последним', (): void => {
        const result: IRtDraggableTree.MoveResult<string> | null = rtDragMove(TREE, 'leaf', { target: 'folder', place: 'inside' });

        expect(valuesOf(result?.nodes ?? [])).toEqual(['start', 'folder']);
        expect(valuesOf(result?.nodes[1].children ?? [])).toEqual(['one', 'two', 'inner', 'leaf']);
        expect(result?.moved.parent).toBe('folder');
        expect(result?.moved.index).toBe(3);
    });

    it('SC-UKV-657 — узел не уходит в своё поддерево ни местом, ни клавишей', (): void => {
        expect(rtDragAllowed(TREE, 'folder', { target: 'inner', place: 'inside' })).toBe(false);
        expect(rtDragAllowed(TREE, 'folder', { target: 'one', place: 'before' })).toBe(false);
        expect(rtDragMove(TREE, 'folder', { target: 'inner', place: 'inside' })).toBeNull();
        expect(rtDragAllowed(TREE, 'leaf', { target: 'leaf', place: 'before' })).toBe(false);
    });

    it('SC-UKV-658 — приложение запрещает место через canDrop', (): void => {
        const noInside: IRtDraggableTree.CanDrop<string> = (
            _node: IRtTree.Node<string>,
            _target: IRtTree.Node<string>,
            place: IRtDraggableTree.Place
        ): boolean => place !== 'inside';

        expect(rtDragAllowed(TREE, 'leaf', { target: 'folder', place: 'inside' }, noInside)).toBe(false);
        expect(rtDragAllowed(TREE, 'leaf', { target: 'folder', place: 'before' }, noInside)).toBe(true);
    });

    it('клавиши с Alt дают место среди соседей и между уровнями', (): void => {
        expect(rtDragKeyPlace(TREE, 'start', 'ArrowUp')).toBeNull();
        expect(rtDragKeyPlace(TREE, 'leaf', 'ArrowUp')).toEqual({ target: 'folder', place: 'before' });
        expect(rtDragKeyPlace(TREE, 'two', 'ArrowLeft')).toEqual({ target: 'folder', place: 'after' });
        expect(rtDragKeyPlace(TREE, 'leaf', 'ArrowRight')).toEqual({ target: 'folder', place: 'inside' });
        expect(rtDragKeyPlace(TREE, 'start', 'ArrowLeft')).toBeNull();
        expect(rtDragKeyPlace(TREE, 'one', 'ArrowRight')).toBeNull();
    });
});
