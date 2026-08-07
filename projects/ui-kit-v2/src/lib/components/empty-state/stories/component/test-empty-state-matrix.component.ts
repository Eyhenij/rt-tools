import { ChangeDetectionStrategy, Component } from '@angular/core';

import { StoryRowComponent } from '../../../../../showcase/story-row.component';
import { StoryThemesComponent } from '../../../../../showcase/story-themes.component';
import { RtButtonDirective } from '../../../button/rt-button.directive';
import { RtEmptyStateComponent } from '../../rt-empty-state.component';

/** Какую матрицу рисовать: у каждой оси своя история, и выбирает её этот вход. */
export type EmptyStateMatrixPart = 'parts' | 'slots' | 'themes';

/** Случай состава: какие из необязательных частей заполнены. */
interface IEmptyStatePartsCase {
    readonly name: string;
    readonly icon: 'folder' | null;
    readonly title: string;
    readonly description: string | null;
}

/**
 * Матрицы `rt-empty-state` для витрины.
 *
 * Ось здесь — состав: каждая часть необязательна, и «заглушка без единого входа» — законное
 * состояние, а не вырожденный случай. Показывать это надо рядом составов, а не сеткой: части
 * друг на друга не влияют, они просто есть или нет.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-empty-state-matrix',
    template: `
        @switch (part) {
            @case ('parts') {
                <app-story-row caption="Состав" [items]="partsCases" [itemLabel]="partsCaseLabel">
                    <ng-template let-partsCase>
                        <rt-empty-state [icon]="partsCase.icon" [title]="partsCase.title" [description]="partsCase.description" />
                    </ng-template>
                </app-story-row>
            }

            @case ('slots') {
                <app-story-row caption="Слоты проекции" [items]="slotCases">
                    <ng-template let-slotCase>
                        @switch (slotCase) {
                            @case ('без проекции') {
                                <rt-empty-state icon="folder" title="Файлов нет" description="Прикрепите первый документ" />
                            }
                            @case ('действие') {
                                <rt-empty-state icon="folder" title="Файлов нет" description="Прикрепите первый документ">
                                    <button rtButton label="Прикрепить" aria-label="Прикрепить"></button>
                                </rt-empty-state>
                            }
                            @case ('картинка и действие') {
                                <rt-empty-state title="Файлов нет" description="Прикрепите первый документ">
                                    <img rtEmptyIllustration alt="" width="96" height="72" [src]="illustration" />
                                    <button rtButton label="Прикрепить" aria-label="Прикрепить"></button>
                                </rt-empty-state>
                            }
                        }
                    </ng-template>
                </app-story-row>
            }

            @case ('themes') {
                <app-story-themes caption="Заглушка в обеих темах">
                    <ng-template>
                        <rt-empty-state icon="folder" title="Файлов нет" description="Прикрепите первый документ" />
                    </ng-template>
                </app-story-themes>
            }
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtEmptyStateComponent,

        // directives
        RtButtonDirective,

        // showcase
        StoryRowComponent,
        StoryThemesComponent,
    ],
})
export class TestRtEmptyStateMatrixComponent {
    public part: EmptyStateMatrixPart = 'parts';

    /** Картинку витрина рисует своей заглушкой: своих иллюстраций кит не везёт. */
    public readonly illustration: string =
        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 96 72'%3E%3Crect width='96' height='72' rx='8' fill='%23cbd5e1'/%3E%3C/svg%3E";

    public readonly partsCases: readonly IEmptyStatePartsCase[] = [
        { name: 'всё сразу', icon: 'folder', title: 'Файлов нет', description: 'Прикрепите первый документ' },
        { name: 'без описания', icon: 'folder', title: 'Файлов нет', description: null },
        { name: 'без иконки', icon: null, title: 'Файлов нет', description: 'Прикрепите первый документ' },
        { name: 'только заголовок', icon: null, title: 'Файлов нет', description: null },
        { name: 'без единого входа', icon: null, title: '', description: null },
    ];

    public readonly slotCases: readonly string[] = ['без проекции', 'действие', 'картинка и действие'];

    public readonly partsCaseLabel: (value: IEmptyStatePartsCase) => string = (value: IEmptyStatePartsCase): string => value.name;
}
