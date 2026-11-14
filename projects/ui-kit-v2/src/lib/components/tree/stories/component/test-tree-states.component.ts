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
    template: `
        <app-story-presets caption="Свой вид пустого в обоих наборах">
            <ng-template>
                <app-story-row slotWidth="20rem" [items]="cases" [itemLabel]="caseLabel">
                    <ng-template let-item>
                        <rt-tree style="display: block; width: 100%" ariaLabel="Города" [nodes]="item.nodes" [searchTerm]="item.searchTerm">
                            @if (item.ownEmpty) {
                                <ng-template rtTreeEmpty let-term>
                                    <div [style]="slotStyle">
                                        <strong>Свой вид пустого</strong>
                                        <span [style]="slotHintStyle">Строка поиска: «{{ term }}»</span>
                                    </div>
                                </ng-template>
                            }
                        </rt-tree>
                    </ng-template>
                </app-story-row>
            </ng-template>
        </app-story-presets>
    `,
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

    /** Рамка своего шаблона: пунктир показывает, где кончается разметка приложения. */
    public readonly slotStyle: string =
        'display: grid; gap: var(--rt-space-1); margin: calc(var(--rt-space-2) + var(--rt-space-1)); padding: calc(var(--rt-space-2) + var(--rt-space-1)); border: 1px dashed var(--rt-color-border-strong); border-radius: var(--rt-radius-md); text-align: center';

    public readonly slotHintStyle: string = 'color: var(--rt-color-text-muted); font-size: var(--rt-text-sm)';

    public readonly caseLabel: (value: ITreeStateCase) => string = (value: ITreeStateCase): string => value.name;
}
