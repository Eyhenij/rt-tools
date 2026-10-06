import { ChangeDetectionStrategy, Component } from '@angular/core';

import { StoryPresetsComponent } from '../../../../../showcase/story-presets.component';
import { StoryRowComponent } from '../../../../../showcase/story-row.component';
import { IStoryState, STORY_CONTROL_STATES, storyStateLabel } from '../../../../../showcase/story-states';
import { StoryThemesComponent } from '../../../../../showcase/story-themes.component';
import { RtTagComponent } from '../../../tag/rt-tag.component';
import { RtTreeComponent } from '../../rt-tree.component';
import { RtTreeNodeEndDirective } from '../../rt-tree.directives';
import { IRtTree } from '../../rt-tree.model';
import { TREE_STORY_NODES } from './tree-story-nodes';

/** Какую матрицу рисовать: у каждой оси своя история, и выбирает её этот вход. */
export type TTreeMatrixPart = 'mode' | 'cascade' | 'select-all' | 'search' | 'empty' | 'node-end' | 'states' | 'presets' | 'themes';

/** Одна ячейка ряда: подпись и то, чем дерево в ней отличается от соседей. */
interface ITreeCase {
    readonly name: string;
    readonly mode: IRtTree.Mode;
    readonly cascade: boolean;
    readonly value: ReadonlyArray<string>;
    readonly searchTerm: string;
    readonly nodes: ReadonlyArray<IRtTree.Node<string>>;
}

function treeCase(name: string, patch: Partial<ITreeCase> = {}): ITreeCase {
    return { name, mode: 'multiple', cascade: true, value: ['msk', 'msq'], searchTerm: '', nodes: TREE_STORY_NODES, ...patch };
}

/**
 * Матрицы `rt-tree` для витрины.
 *
 * Каждая матрица стоит парой половин под двумя наборами оформления: набор перекрашивает фон
 * выбранной и подсвеченной строки, и на одной оси это видно не хуже, чем на другой.
 *
 * Выбор задан заранее так, чтобы в каждой ячейке были видны все отметки: выбранный лист, ветка с
 * частью выбранного, выключенный лист и раскрытые ветки над выбранным. Ширина ячейки названа
 * явно: дерево занимает ширину своего места, а ячейка ряда своей не даёт.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-tree-matrix',
    template: `
        @switch (part) {
            @case ('mode') {
                <app-story-presets>
                    <ng-template>
                        <app-story-row caption="Режим отметок" [items]="modeCases" [itemLabel]="caseLabel">
                            <ng-template let-c>
                                <rt-tree style="width: 280px" [ariaLabel]="c.name" [nodes]="c.nodes" [mode]="c.mode" [value]="c.value" />
                            </ng-template>
                        </app-story-row>
                    </ng-template>
                </app-story-presets>
            }

            @case ('cascade') {
                <app-story-presets>
                    <ng-template>
                        <app-story-row caption="Каскад: выбран «Центр» и «Минск»" [items]="cascadeCases" [itemLabel]="caseLabel">
                            <ng-template let-c>
                                <rt-tree
                                    style="width: 280px"
                                    [ariaLabel]="c.name"
                                    [nodes]="c.nodes"
                                    [cascade]="c.cascade"
                                    [value]="c.value" />
                            </ng-template>
                        </app-story-row>
                    </ng-template>
                </app-story-presets>
            }

            @case ('select-all') {
                <app-story-presets>
                    <ng-template>
                        <app-story-row caption="«Выбрать всё»: ничего, часть, всё" [items]="selectAllCases" [itemLabel]="caseLabel">
                            <ng-template let-c>
                                <rt-tree
                                    style="width: 280px"
                                    [ariaLabel]="c.name"
                                    [nodes]="c.nodes"
                                    [showSelectAll]="true"
                                    [value]="c.value" />
                            </ng-template>
                        </app-story-row>
                    </ng-template>
                </app-story-presets>
            }

            @case ('search') {
                <app-story-presets>
                    <ng-template>
                        <app-story-row
                            caption="Поиск: путь к совпадению раскрыт, совпадение выделено"
                            [items]="searchCases"
                            [itemLabel]="caseLabel">
                            <ng-template let-c>
                                <rt-tree
                                    style="width: 280px"
                                    [ariaLabel]="c.name"
                                    [nodes]="c.nodes"
                                    [searchTerm]="c.searchTerm"
                                    [value]="c.value" />
                            </ng-template>
                        </app-story-row>
                    </ng-template>
                </app-story-presets>
            }

            @case ('empty') {
                <app-story-presets>
                    <ng-template>
                        <app-story-row caption="Пустое дерево" [items]="emptyCases" [itemLabel]="caseLabel">
                            <ng-template let-c>
                                <rt-tree style="width: 280px" [ariaLabel]="c.name" [nodes]="c.nodes" [searchTerm]="c.searchTerm" />
                            </ng-template>
                        </app-story-row>
                    </ng-template>
                </app-story-presets>
            }

            @case ('node-end') {
                <app-story-presets>
                    <ng-template>
                        <app-story-row caption="Разметка приложения в конце строки" [items]="nodeEndCases" [itemLabel]="caseLabel">
                            <ng-template let-c>
                                <rt-tree style="width: 320px" [ariaLabel]="c.name" [nodes]="c.nodes" [value]="c.value">
                                    <ng-template rtTreeNodeEnd let-node>
                                        <rt-tag size="sm" severity="info" [value]="node.value" />
                                    </ng-template>
                                </rt-tree>
                            </ng-template>
                        </app-story-row>
                    </ng-template>
                </app-story-presets>
            }

            @case ('states') {
                <app-story-presets>
                    <ng-template>
                        <app-story-row caption="Взаимодействие с деревом" [items]="states" [itemLabel]="stateLabel">
                            <ng-template let-state>
                                <rt-tree
                                    style="width: 280px"
                                    ariaLabel="Состояние"
                                    [attr.data-story-state]="state.state"
                                    [nodes]="nodes"
                                    [value]="defaultValue" />
                            </ng-template>
                        </app-story-row>
                    </ng-template>
                </app-story-presets>
            }

            @case ('presets') {
                <app-story-presets caption="Дерево в обоих наборах">
                    <ng-template>
                        <rt-tree style="width: 280px" ariaLabel="Регионы" [nodes]="nodes" [showSelectAll]="true" [value]="defaultValue" />
                        <rt-tree style="width: 280px" ariaLabel="Регионы" mode="single" [nodes]="nodes" [value]="singleValue" />
                    </ng-template>
                </app-story-presets>
            }

            @case ('themes') {
                <app-story-themes caption="Дерево в обеих темах">
                    <ng-template>
                        <rt-tree style="width: 280px" ariaLabel="Регионы" [nodes]="nodes" [showSelectAll]="true" [value]="defaultValue" />
                        <rt-tree style="width: 280px" ariaLabel="Поиск" searchTerm="мин" [nodes]="nodes" />
                    </ng-template>
                </app-story-themes>
            }
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtTagComponent,
        RtTreeComponent,
        RtTreeNodeEndDirective,
        // showcase
        StoryPresetsComponent,
        StoryRowComponent,
        StoryThemesComponent,
    ],
})
export class TestRtTreeMatrixComponent {
    public part: TTreeMatrixPart = 'mode';

    public readonly nodes: ReadonlyArray<IRtTree.Node<string>> = TREE_STORY_NODES;
    public readonly defaultValue: ReadonlyArray<string> = ['msk', 'msq'];
    public readonly singleValue: ReadonlyArray<string> = ['tvr'];

    public readonly modeCases: readonly ITreeCase[] = [
        treeCase('флажки — multiple'),
        treeCase('радио — single', { mode: 'single', value: ['tvr'] }),
        treeCase('без отметок — none', { mode: 'none', value: ['tvr'] }),
    ];

    public readonly cascadeCases: readonly ITreeCase[] = [
        treeCase('каскад включён', { value: ['msk', 'tvr', 'msq'] }),
        treeCase('каскад выключен', { cascade: false, value: ['ru-c', 'msq'] }),
    ];

    public readonly selectAllCases: readonly ITreeCase[] = [
        treeCase('ничего', { value: [] }),
        treeCase('часть'),
        treeCase('всё', { value: ['msk', 'tvr', 'kzn', 'msq', 'gna', 'evn'] }),
    ];

    public readonly searchCases: readonly ITreeCase[] = [
        treeCase('«мин» — лист второго уровня', { searchTerm: 'мин', value: [] }),
        treeCase('«ст» — описание и подпись', { searchTerm: 'ст', value: [] }),
    ];

    public readonly emptyCases: readonly ITreeCase[] = [
        treeCase('поиск ничего не нашёл', { searchTerm: 'нет такого' }),
        treeCase('узлов нет', { nodes: [] }),
    ];

    public readonly nodeEndCases: readonly ITreeCase[] = [treeCase('значение узла в метке')];

    public readonly states: readonly IStoryState[] = STORY_CONTROL_STATES;
    public readonly stateLabel: (value: IStoryState) => string = storyStateLabel;
    public readonly caseLabel: (value: ITreeCase) => string = (value: ITreeCase): string => value.name;
}
