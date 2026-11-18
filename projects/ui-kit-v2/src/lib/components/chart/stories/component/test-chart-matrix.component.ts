import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

import { StoryPresetsComponent } from '../../../../../showcase/story-presets.component';
import { StoryThemesComponent } from '../../../../../showcase/story-themes.component';
import { CHART_CASES, IChartStoryCase } from './chart.fixture';
import { TestRtChartCardComponent } from './test-chart-card.component';

/** Какую матрицу рисовать: у каждой своя история, и выбирает её этот вход. */
export type TChartMatrixPart = 'kinds' | 'empty' | 'presets' | 'themes';

/**
 * Матрицы `rt-chart` для витрины: карточки макета в его порядке и размерах, по три в ряд.
 *
 * Темы и наборы оформления показаны парой половин, и каждая половина несёт свой признак: график
 * читает палитру со своего узла. Цвета серий одни для обоих наборов, а подписи, сетка и рамка
 * карточки берут цвета ролей, которые материальный набор переписывает.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-chart-matrix',
    templateUrl: './test-chart-matrix.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // Angular
        NgTemplateOutlet,

        // components
        TestRtChartCardComponent,

        // showcase
        StoryPresetsComponent,
        StoryThemesComponent,
    ],
})
export class TestRtChartMatrixComponent {
    public part: TChartMatrixPart = 'kinds';

    public readonly all: readonly IChartStoryCase[] = CHART_CASES;

    public readonly empty: readonly IChartStoryCase[] = CHART_CASES.slice(-1);
}
