import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

import { StoryPresetsComponent } from '../../../../../showcase/story-presets.component';
import { StoryRowComponent } from '../../../../../showcase/story-row.component';
import { StoryThemesComponent } from '../../../../../showcase/story-themes.component';
import { HYBRID_TREE_STORY_NODES } from '../../../hybrid-tree/stories/component/hybrid-tree-story-nodes';
import { IRtHybridTree } from '../../../hybrid-tree/rt-hybrid-tree.model';
import { RtHybridTreeSelectorComponent } from '../../rt-hybrid-tree-selector.component';

/** Какую матрицу рисовать: у каждой оси своя история, и выбирает её этот вход. */
export type THybridTreeSelectorMatrixPart = 'form' | 'search' | 'presets' | 'themes';

/** Одна ячейка ряда: подпись и то, чем селектор в ней отличается от соседей. */
interface IHybridTreeSelectorCase {
    readonly name: string;
    readonly value: ReadonlyArray<string>;
    readonly confirm: boolean;
    readonly branchMarks: boolean;
    readonly searchTerm: string;
}

function selectorCase(name: string, patch: Partial<IHybridTreeSelectorCase> = {}): IHybridTreeSelectorCase {
    return { name, value: ['hotel', 'ty-revenue'], confirm: false, branchMarks: true, searchTerm: '', ...patch };
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
    ];

    public readonly searchCases: readonly IHybridTreeSelectorCase[] = [
        selectorCase('«выручка» — по листу в двух группах', { searchTerm: 'выручка' }),
        selectorCase('ничего не нашлось', { searchTerm: 'нет такого' }),
    ];

    public readonly caseLabel: (value: IHybridTreeSelectorCase) => string = (value: IHybridTreeSelectorCase): string => value.name;
}
