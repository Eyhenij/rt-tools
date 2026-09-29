import { ChangeDetectionStrategy, Component } from '@angular/core';

import { StoryRowComponent } from '../../../../../showcase/story-row.component';
import { StoryPresetsComponent } from '../../../../../showcase/story-presets.component';
import { StoryThemesComponent } from '../../../../../showcase/story-themes.component';
import { RtSpinnerComponent } from '../../rt-spinner.component';
import { IRtSpinner } from '../../rt-spinner.model';

/** Какую матрицу рисовать: у каждой оси своя история, и выбирает её этот вход. */
export type TSpinnerMatrixPart = 'color' | 'diameter' | 'presets' | 'themes';

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
                <app-story-presets caption="Палитра в обоих наборах">
                    <ng-template>
                        <app-story-row [items]="colors">
                            <ng-template let-color>
                                <span class="app-spinner-matrix__pad" [class.app-spinner-matrix__pad--primary]="color === 'on-primary'">
                                    <rt-spinner [color]="color" />
                                </span>
                            </ng-template>
                        </app-story-row>
                    </ng-template>
                </app-story-presets>
            }

            @case ('diameter') {
                <app-story-presets caption="Диаметр в обоих наборах">
                    <ng-template>
                        <app-story-row [items]="diameters" [itemLabel]="diameterLabel">
                            <ng-template let-diameter>
                                <rt-spinner [diameter]="diameter" />
                            </ng-template>
                        </app-story-row>
                    </ng-template>
                </app-story-presets>
            }

            @case ('presets') {
                <app-story-presets caption="Палитра в обоих наборах">
                    <ng-template>
                        @for (color of colors; track color) {
                            <span class="app-spinner-matrix__pad" [class.app-spinner-matrix__pad--primary]="color === 'on-primary'">
                                <rt-spinner [color]="color" />
                            </span>
                        }
                    </ng-template>
                </app-story-presets>
            }

            @case ('themes') {
                <app-story-presets caption="Палитра в обеих темах в обоих наборах">
                    <ng-template>
                        <app-story-themes>
                            <ng-template>
                                @for (color of colors; track color) {
                                    <span class="app-spinner-matrix__pad" [class.app-spinner-matrix__pad--primary]="color === 'on-primary'">
                                        <rt-spinner [color]="color" />
                                    </span>
                                }
                            </ng-template>
                        </app-story-themes>
                    </ng-template>
                </app-story-presets>
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
        StoryPresetsComponent,
        StoryRowComponent,
        StoryThemesComponent,
    ],
})
export class TestRtSpinnerMatrixComponent {
    public part: TSpinnerMatrixPart = 'color';

    public readonly colors: readonly IRtSpinner.Color[] = ['primary', 'neutral', 'on-primary'];

    /** Диаметр — не шкала, а свободное число: берём края и пару ходовых значений. */
    public readonly diameters: readonly number[] = [16, 24, 32, 48, 64];

    public readonly diameterLabel: (value: number) => string = (value: number): string => `${value}px`;
}
