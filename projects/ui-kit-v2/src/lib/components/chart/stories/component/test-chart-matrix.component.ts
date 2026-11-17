import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

import { StoryThemesComponent } from '../../../../../showcase/story-themes.component';
import { CHART_CASES, IChartStoryCase } from './chart.fixture';
import { TestRtChartCardComponent } from './test-chart-card.component';

/** Какую матрицу рисовать: у каждой своя история, и выбирает её этот вход. */
export type TChartMatrixPart = 'kinds' | 'empty' | 'themes';

/**
 * Матрицы `rt-chart` для витрины: карточки макета в его порядке и размерах, по три в ряд.
 *
 * Темы показаны парой половин, и каждая половина несёт свой признак темы: график читает палитру
 * со своего узла. Пары наборов оформления нет: у графика нет свойств, которые переписывает набор, —
 * цвета серий и подписей одни для обоих наборов.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-chart-matrix',
    template: `
        <ng-template #cards let-items>
            <div style="display: grid; grid-template-columns: repeat(3, 360px); gap: 16px">
                @for (item of items; track item.name) {
                    <app-chart-card [item]="item" [attr.data-case]="item.name" />
                }
            </div>
        </ng-template>

        @switch (part) {
            @case ('kinds') {
                <div data-story-root style="display: inline-block">
                    <ng-container *ngTemplateOutlet="cards; context: { $implicit: all }" />
                </div>
            }
            @case ('empty') {
                <div data-story-root style="display: inline-block">
                    <ng-container *ngTemplateOutlet="cards; context: { $implicit: empty }" />
                </div>
            }
            @case ('themes') {
                <app-story-themes>
                    <ng-template>
                        <ng-container *ngTemplateOutlet="cards; context: { $implicit: all }" />
                    </ng-template>
                </app-story-themes>
            }
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // Angular
        NgTemplateOutlet,

        // components
        TestRtChartCardComponent,

        // showcase
        StoryThemesComponent,
    ],
})
export class TestRtChartMatrixComponent {
    public part: TChartMatrixPart = 'kinds';

    public readonly all: readonly IChartStoryCase[] = CHART_CASES;

    public readonly empty: readonly IChartStoryCase[] = CHART_CASES.slice(-1);
}
