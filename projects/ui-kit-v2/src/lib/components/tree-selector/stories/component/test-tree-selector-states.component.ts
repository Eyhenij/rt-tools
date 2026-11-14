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
    template: `
        <app-story-presets caption="Свой вид пустого в обоих наборах">
            <ng-template>
                <app-story-row slotWidth="21.25rem" [items]="cases" [itemLabel]="caseLabel">
                    <ng-template let-item>
                        <rt-tree-selector
                            style="display: block; width: 100%"
                            label="Гостиницы"
                            ariaLabel="Гостиницы"
                            confirm
                            expandControls
                            clearable
                            revertable
                            multiToggle
                            [nodes]="item.nodes"
                            [searchTerm]="item.searchTerm">
                            @if (item.ownEmpty) {
                                <ng-template rtTreeSelectorEmpty let-term>
                                    <div [style]="slotStyle">
                                        <strong>Свой вид пустого</strong>
                                        <span [style]="slotHintStyle">Строка поиска: «{{ term }}»</span>
                                    </div>
                                </ng-template>
                            }
                        </rt-tree-selector>
                    </ng-template>
                </app-story-row>
            </ng-template>
        </app-story-presets>
    `,
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

    /** Рамка своего шаблона: пунктир показывает, где кончается разметка приложения. */
    public readonly slotStyle: string =
        'display: grid; gap: var(--rt-space-1); margin: calc(var(--rt-space-2) + var(--rt-space-1)); padding: calc(var(--rt-space-2) + var(--rt-space-1)); border: 1px dashed var(--rt-color-border-strong); border-radius: var(--rt-radius-md); text-align: center';

    public readonly slotHintStyle: string = 'color: var(--rt-color-text-muted); font-size: var(--rt-text-sm)';

    public readonly caseLabel: (value: ITreeSelectorStateCase) => string = (value: ITreeSelectorStateCase): string => value.name;
}
