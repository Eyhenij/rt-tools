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
    template: `
        @switch (part) {
            @case ('value') {
                <app-story-presets caption="Доля в обоих наборах: за краями прижимается к краю">
                    <ng-template>
                        <app-story-row slotWidth="12rem" [items]="values" [itemLabel]="valueLabel">
                            <ng-template let-value>
                                <rt-progress-bar [value]="value" />
                            </ng-template>
                        </app-story-row>
                    </ng-template>
                </app-story-presets>
            }

            @case ('mode') {
                <app-story-presets caption="Режим в обоих наборах">
                    <ng-template>
                        <app-story-row slotWidth="16rem" [items]="modes">
                            <ng-template let-mode>
                                <rt-progress-bar [mode]="mode" [value]="60" />
                            </ng-template>
                        </app-story-row>
                    </ng-template>
                </app-story-presets>
            }

            @case ('color') {
                <app-story-presets caption="Цвет в обоих наборах">
                    <ng-template>
                        <app-story-row slotWidth="10rem" [items]="colors">
                            <ng-template let-color>
                                <rt-progress-bar [value]="60" [color]="color" />
                            </ng-template>
                        </app-story-row>
                    </ng-template>
                </app-story-presets>
            }

            @case ('live') {
                <app-story-presets caption="Живая доля в обоих наборах: тики из потока, полоса идёт следом">
                    <ng-template>
                        <app-progress-bar-live />
                    </ng-template>
                </app-story-presets>
            }

            @case ('presets') {
                <app-story-presets caption="Полоса в обоих наборах">
                    <ng-template>
                        <div style="width: 16rem">
                            <rt-progress-bar [value]="60" />
                        </div>
                    </ng-template>
                </app-story-presets>
            }

            @case ('themes') {
                <app-story-presets caption="Полоса в обеих темах в обоих наборах">
                    <ng-template>
                        <app-story-themes>
                            <ng-template>
                                <div style="width: 16rem">
                                    <rt-progress-bar [value]="60" />
                                </div>
                            </ng-template>
                        </app-story-themes>
                    </ng-template>
                </app-story-presets>
            }
        }
    `,
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
