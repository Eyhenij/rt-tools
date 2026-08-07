import { ChangeDetectionStrategy, Component } from '@angular/core';

import { StoryRowComponent } from '../../../../../showcase/story-row.component';
import { StoryThemesComponent } from '../../../../../showcase/story-themes.component';
import { RtSpinnerComponent } from '../../rt-spinner.component';
import { IRtSpinner } from '../../rt-spinner.model';

/** Какую матрицу рисовать: у каждой оси своя история, и выбирает её этот вход. */
export type SpinnerMatrixPart = 'color' | 'diameter' | 'themes';

/**
 * Матрицы `rt-spinner` для витрины.
 *
 * Палитра показана каждая на своей подложке: `on-primary` белый и на светлой странице
 * не виден вовсе — ряд из трёх колец на общем фоне показал бы два кольца и пустоту.
 * Диаметр от палитры не зависит и идёт отдельным рядом.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-spinner-matrix',
    template: `
        @switch (part) {
            @case ('color') {
                <app-story-row caption="Палитра" [items]="colors">
                    <ng-template let-color>
                        <span class="app-spinner-matrix__pad" [class.app-spinner-matrix__pad--primary]="color === 'on-primary'">
                            <rt-spinner [color]="color" />
                        </span>
                    </ng-template>
                </app-story-row>
            }

            @case ('diameter') {
                <app-story-row caption="Диаметр" [items]="diameters" [itemLabel]="diameterLabel">
                    <ng-template let-diameter>
                        <rt-spinner [diameter]="diameter" />
                    </ng-template>
                </app-story-row>
            }

            @case ('themes') {
                <app-story-themes caption="Палитра в обеих темах">
                    <ng-template>
                        @for (color of colors; track color) {
                            <span class="app-spinner-matrix__pad" [class.app-spinner-matrix__pad--primary]="color === 'on-primary'">
                                <rt-spinner [color]="color" />
                            </span>
                        }
                    </ng-template>
                </app-story-themes>
            }
        }
    `,
    styles: `
        .app-spinner-matrix__pad {
            display: inline-flex;
            padding: 0.75rem;
            border-radius: var(--rt-radius-md);
        }

        .app-spinner-matrix__pad--primary {
            background-color: var(--rt-color-action-primary);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtSpinnerComponent,

        // showcase
        StoryRowComponent,
        StoryThemesComponent,
    ],
})
export class TestRtSpinnerMatrixComponent {
    public part: SpinnerMatrixPart = 'color';

    public readonly colors: readonly IRtSpinner.Color[] = ['primary', 'neutral', 'on-primary'];

    /** Диаметр — не шкала, а свободное число: берём края и пару ходовых значений. */
    public readonly diameters: readonly number[] = [16, 24, 32, 48, 64];

    public readonly diameterLabel: (value: number) => string = (value: number): string => `${value}px`;
}
