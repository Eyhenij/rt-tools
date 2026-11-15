import { ChangeDetectionStrategy, Component } from '@angular/core';

import { StoryPresetsComponent } from '../../../../../showcase/story-presets.component';
import { StoryRowComponent } from '../../../../../showcase/story-row.component';
import { IRtTree } from '../../../tree/rt-tree.model';
import { RtTreeSelectorComponent } from '../../rt-tree-selector.component';
import { RtTreeSelectorEmptyDirective } from '../../rt-tree-selector.directives';
import { TREE_SELECTOR_STORY_NODES } from './tree-selector-story-nodes';

/** Случай дерева: какие узлы, какая строка поиска и стоит ли свой шаблон. */
interface ITreeSelectorStateCase {
    readonly name: string;
    readonly nodes: ReadonlyArray<IRtTree.Node<string>>;
    readonly searchTerm: string;
    readonly ownEmpty: boolean;
}

const CASES: readonly ITreeSelectorStateCase[] = [
    { name: 'Без шаблона: строка «Нет вариантов»', nodes: [], searchTerm: '', ownEmpty: false },
    { name: 'Свой шаблон: ng-template[rtTreeSelectorEmpty], узлов нет', nodes: [], searchTerm: '', ownEmpty: true },
    { name: 'Свой шаблон: поиск без совпадений', nodes: TREE_SELECTOR_STORY_NODES, searchTerm: 'Лиссабон', ownEmpty: true },
];

/**
 * Свой вид пустого `rt-tree-selector` — по одобренному кадру. Шаблон встаёт и при пустом наборе узлов, и
 * при поиске без совпадений; в контексте — строка поиска.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-tree-selector-states',
    templateUrl: './test-tree-selector-states.component.html',
    styleUrl: './test-tree-selector-states.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtTreeSelectorComponent,

        // directives
        RtTreeSelectorEmptyDirective,

        // showcase
        StoryPresetsComponent,
        StoryRowComponent,
    ],
})
export class TestRtTreeSelectorStatesComponent {
    public readonly cases: readonly ITreeSelectorStateCase[] = CASES;

    public readonly caseLabel: (value: ITreeSelectorStateCase) => string = (value: ITreeSelectorStateCase): string => value.name;
}
