import { ChangeDetectionStrategy, Component } from '@angular/core';

import { StoryPresetsComponent } from '../../../../../showcase/story-presets.component';
import { StoryRowComponent } from '../../../../../showcase/story-row.component';
import { StoryThemesComponent } from '../../../../../showcase/story-themes.component';
import { RtProgressBarComponent } from '../../rt-progress-bar.component';
import { IRtProgressBar } from '../../rt-progress-bar.model';
import { TestRtProgressBarLiveComponent } from './test-progress-bar-live.component';

/** Какую матрицу рисовать: у каждой оси своя история, и выбирает её этот вход. */
export type TProgressBarMatrixPart = 'value' | 'mode' | 'color' | 'live' | 'presets' | 'themes';

/**
 * Матрицы `rt-progress-bar` для витрины.
 *
 * Доля показана с краями — меньше нуля и больше ста прижимаются к краю. Режим без доли — бегущий
 * отрезок: кадр снимает одно его положение, движение видно вживую. Живая доля из потока — своей
 * историей с кнопкой запуска.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-progress-bar-matrix',
    templateUrl: './test-progress-bar-matrix.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtProgressBarComponent,

        // showcase
        StoryPresetsComponent,
        StoryRowComponent,
        StoryThemesComponent,
        TestRtProgressBarLiveComponent,
    ],
})
export class TestRtProgressBarMatrixComponent {
    public part: TProgressBarMatrixPart = 'value';

    public readonly values: readonly number[] = [-10, 0, 25, 60, 100, 130];
    public readonly modes: readonly IRtProgressBar.Mode[] = ['determinate', 'indeterminate'];
    public readonly colors: readonly IRtProgressBar.Color[] = ['primary', 'secondary', 'info', 'success', 'warning', 'danger'];

    public readonly valueLabel: (value: number) => string = (value: number): string => `${value}%`;
}
