import { ChangeDetectionStrategy, Component } from '@angular/core';

import { StoryPresetsComponent } from '../../../../../showcase/story-presets.component';
import { StoryRowComponent } from '../../../../../showcase/story-row.component';
import { RtTreeComponent } from '../../rt-tree.component';
import { RtTreeEmptyDirective } from '../../rt-tree.directives';
import { IRtTree } from '../../rt-tree.model';
import { TREE_STORY_NODES } from './tree-story-nodes';

/** Случай дерева: какие узлы, какая строка поиска и стоит ли свой шаблон. */
interface ITreeStateCase {
    readonly name: string;
    readonly nodes: ReadonlyArray<IRtTree.Node<string>>;
    readonly searchTerm: string;
    readonly ownEmpty: boolean;
}

const CASES: readonly ITreeStateCase[] = [
    { name: 'Без шаблона: строка «Нет вариантов»', nodes: [], searchTerm: '', ownEmpty: false },
    { name: 'Свой шаблон: ng-template[rtTreeEmpty], узлов нет', nodes: [], searchTerm: '', ownEmpty: true },
    { name: 'Свой шаблон: поиск без совпадений', nodes: TREE_STORY_NODES, searchTerm: 'Лиссабон', ownEmpty: true },
];

/**
 * Свой вид пустого `rt-tree` — по одобренному кадру. Шаблон встаёт и при пустом наборе узлов, и
 * при поиске без совпадений; в контексте — строка поиска.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-tree-states',
    templateUrl: './test-tree-states.component.html',
    styleUrl: './test-tree-states.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtTreeComponent,

        // directives
        RtTreeEmptyDirective,

        // showcase
        StoryPresetsComponent,
        StoryRowComponent,
    ],
})
export class TestRtTreeStatesComponent {
    public readonly cases: readonly ITreeStateCase[] = CASES;

    public readonly caseLabel: (value: ITreeStateCase) => string = (value: ITreeStateCase): string => value.name;
}
