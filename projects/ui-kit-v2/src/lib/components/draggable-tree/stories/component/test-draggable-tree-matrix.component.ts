import { ChangeDetectionStrategy, Component } from '@angular/core';

import { StoryPresetsComponent } from '../../../../../showcase/story-presets.component';
import { StoryRowComponent } from '../../../../../showcase/story-row.component';
import { IStoryState, STORY_CONTROL_STATES, storyStateLabel } from '../../../../../showcase/story-states';
import { StoryThemesComponent } from '../../../../../showcase/story-themes.component';
import { IRtIcon } from '../../../icon/rt-icon.model';
import { RtTagComponent } from '../../../tag/rt-tag.component';
import { IRtTree } from '../../../tree/rt-tree.model';
import { RtDraggableTreeComponent } from '../../rt-draggable-tree.component';
import { RtDraggableTreeNodeDirective } from '../../rt-draggable-tree.directives';
import { DRAGGABLE_TREE_STORY_NODES } from './draggable-tree-story-nodes';

/** Какую матрицу рисовать: у каждой оси своя история, и выбирает её этот вход. */
export type TDraggableTreeMatrixPart = 'content' | 'node-template' | 'states' | 'material' | 'presets' | 'themes';

/** Одна ячейка ряда: подпись и узлы дерева в ней. */
interface IDraggableTreeCase {
    readonly name: string;
    readonly nodes: ReadonlyArray<IRtTree.Node<string>>;
    /** Раскрытые ветки; без поля раскрыты все. */
    readonly open?: ReadonlyArray<string>;
    /** Признак ячейки: по нему история наводит указатель или подсвечивает строку клавишей. */
    readonly key?: string;
    readonly emptyIcon?: IRtIcon.Name;
}

const FLAT: ReadonlyArray<IRtTree.Node<string>> = [
    { label: 'Продажи', value: 'sales' },
    { label: 'Финансы', value: 'finance' },
    { label: 'Персонал', value: 'staff' },
];

/**
 * Матрицы `rt-draggable-tree` для витрины. Места сброса — состояние перетаскивания, и в неподвижном
 * кадре их нет: их показывает песочница, а обзор называет причину.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-draggable-tree-matrix',
    templateUrl: './test-draggable-tree-matrix.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtDraggableTreeComponent,
        RtDraggableTreeNodeDirective,
        RtTagComponent,
        // showcase
        StoryPresetsComponent,
        StoryRowComponent,
        StoryThemesComponent,
    ],
})
export class TestRtDraggableTreeMatrixComponent {
    public part: TDraggableTreeMatrixPart = 'content';

    public readonly nodes: ReadonlyArray<IRtTree.Node<string>> = DRAGGABLE_TREE_STORY_NODES;

    public readonly contentCases: readonly IDraggableTreeCase[] = [
        { name: 'плоский список', nodes: FLAT },
        { name: 'вложенность, пустая папка, закреплённый раздел', nodes: DRAGGABLE_TREE_STORY_NODES },
        { name: 'приложение раскрыло только «Продажи»', nodes: DRAGGABLE_TREE_STORY_NODES, open: ['sales'] },
        { name: 'пусто', nodes: [] },
    ];

    public readonly templateCases: readonly IDraggableTreeCase[] = [{ name: 'значение узла в метке', nodes: DRAGGABLE_TREE_STORY_NODES }];

    /** Вид приложения: строка под указателем с ручкой и тенью, подсвеченная клавишей, пустота со значком. */
    public readonly materialCases: readonly IDraggableTreeCase[] = [
        { name: 'указатель над «Финансами»', nodes: DRAGGABLE_TREE_STORY_NODES, key: 'hover' },
        { name: 'строка подсвечена клавишей', nodes: DRAGGABLE_TREE_STORY_NODES, key: 'highlight' },
        { name: 'пусто, значок приложения', nodes: [], emptyIcon: 'inbox' },
    ];

    public readonly states: readonly IStoryState[] = STORY_CONTROL_STATES;
    public readonly stateLabel: (value: IStoryState) => string = storyStateLabel;
    public readonly caseLabel: (value: IDraggableTreeCase) => string = (value: IDraggableTreeCase): string => value.name;
}
