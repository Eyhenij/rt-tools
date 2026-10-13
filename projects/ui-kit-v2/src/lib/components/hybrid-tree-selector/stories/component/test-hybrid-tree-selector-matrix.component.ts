import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

import { StoryPresetsComponent } from '../../../../../showcase/story-presets.component';
import { StoryRowComponent } from '../../../../../showcase/story-row.component';
import { StoryThemesComponent } from '../../../../../showcase/story-themes.component';
import { HYBRID_TREE_STORY_NODES } from '../../../hybrid-tree/stories/component/hybrid-tree-story-nodes';
import { IRtHybridTree } from '../../../hybrid-tree/rt-hybrid-tree.model';
import { RtTagComponent } from '../../../tag/rt-tag.component';
import { RtTreeNodeEndDirective } from '../../../tree/rt-tree.directives';
import { RtTreeSelectorUnderSearchDirective } from '../../../tree-selector/rt-tree-selector.directives';
import { RtHybridTreeSelectorComponent } from '../../rt-hybrid-tree-selector.component';

/** Какую матрицу рисовать: у каждой оси своя история, и выбирает её этот вход. */
export type THybridTreeSelectorMatrixPart = 'form' | 'search' | 'material' | 'presets' | 'themes';

/** Одна ячейка ряда: подпись и то, чем селектор в ней отличается от соседей. */
interface IHybridTreeSelectorCase {
    readonly name: string;
    readonly value: ReadonlyArray<string>;
    readonly confirm: boolean;
    readonly branchMarks: boolean;
    readonly searchTerm: string;
    readonly disabled: boolean;
    readonly selectAll: boolean;
    /** Разметка приложения под поиском и в конце строк гибридного дерева. */
    readonly slots: boolean;
}

function selectorCase(name: string, patch: Partial<IHybridTreeSelectorCase> = {}): IHybridTreeSelectorCase {
    return {
        name,
        value: ['hotel', 'ty-revenue'],
        confirm: false,
        branchMarks: true,
        searchTerm: '',
        disabled: false,
        selectAll: true,
        slots: false,
        ...patch,
    };
}

/**
 * Матрицы `rt-hybrid-tree-selector` для витрины. Панель у селектора та же, что у `rt-tree-selector`,
 * и её кнопки показаны в его матрицах; здесь — то, что приносит гибридное дерево внутри.
 *
 * Каждая матрица стоит парой половин под двумя наборами оформления, каждая ячейка — коробка своей
 * ширины и высоты: селектор берёт высоту места, куда его поставили.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-hybrid-tree-selector-matrix',
    templateUrl: './test-hybrid-tree-selector-matrix.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // angular
        NgTemplateOutlet,
        // components
        RtHybridTreeSelectorComponent,
        RtTagComponent,
        RtTreeNodeEndDirective,
        RtTreeSelectorUnderSearchDirective,
        // showcase
        StoryPresetsComponent,
        StoryRowComponent,
        StoryThemesComponent,
    ],
})
export class TestRtHybridTreeSelectorMatrixComponent {
    public part: THybridTreeSelectorMatrixPart = 'form';

    public readonly nodes: ReadonlyArray<IRtHybridTree.Node<string>> = HYBRID_TREE_STORY_NODES;

    public readonly formCases: readonly IHybridTreeSelectorCase[] = [
        selectorCase('прямая форма'),
        selectorCase('подтверждаемая: «Применить» выключено', { confirm: true }),
        selectorCase('группы без отметок', { branchMarks: false, value: ['hotel', 'segment', 'ty-rooms'] }),
        selectorCase('выключен', { confirm: true, disabled: true }),
    ];

    public readonly searchCases: readonly IHybridTreeSelectorCase[] = [
        selectorCase('«выручка» — по листу в двух группах', { searchTerm: 'выручка' }),
        selectorCase('ничего не нашлось', { searchTerm: 'нет такого' }),
    ];

    /** Вид приложения: плашка числа у групп без отметок, разметка приложения под поиском и в строках. */
    public readonly materialCases: readonly IHybridTreeSelectorCase[] = [
        selectorCase('группы без отметок, число плашкой', { branchMarks: false, value: ['hotel', 'segment', 'ty-rooms'] }),
        selectorCase('поиск «выручка», разметка приложения', { searchTerm: 'выручка', slots: true }),
    ];

    public readonly caseLabel: (value: IHybridTreeSelectorCase) => string = (value: IHybridTreeSelectorCase): string => value.name;
}
