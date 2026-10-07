import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

import { StoryPresetsComponent } from '../../../../../showcase/story-presets.component';
import { StoryRowComponent } from '../../../../../showcase/story-row.component';
import { StoryThemesComponent } from '../../../../../showcase/story-themes.component';
import { RtHybridTreeComponent } from '../../rt-hybrid-tree.component';
import { IRtHybridTree } from '../../rt-hybrid-tree.model';
import { HYBRID_TREE_STORY_NODES } from './hybrid-tree-story-nodes';

/** Какую матрицу рисовать: у каждой оси своя история, и выбирает её этот вход. */
export type THybridTreeMatrixPart = 'single' | 'marks' | 'select-all' | 'presets' | 'themes';

/** Одна ячейка ряда: подпись и то, чем дерево в ней отличается от соседей. */
interface IHybridTreeCase {
    readonly name: string;
    readonly value: ReadonlyArray<string>;
    readonly branchMarks: boolean;
    readonly showSelectAll: boolean;
}

function treeCase(name: string, patch: Partial<IHybridTreeCase> = {}): IHybridTreeCase {
    return { name, value: [], branchMarks: true, showSelectAll: false, ...patch };
}

/**
 * Матрицы `rt-hybrid-tree` для витрины.
 *
 * Каждая матрица стоит парой половин под двумя наборами оформления. Ветки над выбранным раскрыты
 * при появлении, поэтому выбор в ячейке и решает, какие группы видны раскрытыми.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-hybrid-tree-matrix',
    templateUrl: './test-hybrid-tree-matrix.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // angular
        NgTemplateOutlet,
        // components
        RtHybridTreeComponent,
        // showcase
        StoryPresetsComponent,
        StoryRowComponent,
        StoryThemesComponent,
    ],
})
export class TestRtHybridTreeMatrixComponent {
    public part: THybridTreeMatrixPart = 'single';

    public readonly nodes: ReadonlyArray<IRtHybridTree.Node<string>> = HYBRID_TREE_STORY_NODES;

    public readonly singleCases: readonly IHybridTreeCase[] = [
        treeCase('ничего не выбрано'),
        treeCase('лист одной группы', { value: ['hotel', 'ty-rooms'] }),
        treeCase('по листу в двух группах', { value: ['ty-revenue', 'ly-rooms'] }),
    ];

    public readonly markCases: readonly IHybridTreeCase[] = [
        treeCase('отметки у групп', { value: ['hotel', 'segment', 'ty-rooms'] }),
        treeCase('число выбранного без отметок', { value: ['hotel', 'segment', 'ty-rooms'], branchMarks: false }),
    ];

    public readonly selectAllCases: readonly IHybridTreeCase[] = [
        treeCase('ничего', { showSelectAll: true, value: ['ty-rooms'] }),
        treeCase('часть', { showSelectAll: true, value: ['hotel', 'ty-rooms'] }),
        treeCase('все свободные листья', { showSelectAll: true, value: ['hotel', 'segment', 'channel', 'ty-rooms'] }),
    ];

    public readonly caseLabel: (value: IHybridTreeCase) => string = (value: IHybridTreeCase): string => value.name;
}
