import { ChangeDetectionStrategy, Component } from '@angular/core';

import { StoryRowComponent } from '../../../../../showcase/story-row.component';
import { StoryPresetsComponent } from '../../../../../showcase/story-presets.component';
import { StoryThemesComponent } from '../../../../../showcase/story-themes.component';
import { RtSpinnerComponent } from '../../rt-spinner.component';
import { IRtSpinner } from '../../rt-spinner.model';

/** Какую матрицу рисовать: у каждой оси своя история, и выбирает её этот вход. */
export type TSpinnerMatrixPart = 'color' | 'diameter' | 'appearance' | 'plate' | 'overlay' | 'presets' | 'themes';

/** Одно сочетание оверлея в ряду истории. */
interface ISpinnerOverlayMode {
    readonly label: string;
    readonly backdrop: boolean;
    readonly plate: boolean;
    readonly appearance: IRtSpinner.Appearance;
}

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

            @case ('appearance') {
                <app-story-presets caption="Вид кольца в обоих наборах: с дорожкой и дугой без дорожки">
                    <ng-template>
                        @for (appearance of appearances; track appearance) {
                            <app-story-row [caption]="appearance" [items]="colors">
                                <ng-template let-color>
                                    <span class="app-spinner-matrix__pad" [class.app-spinner-matrix__pad--primary]="color === 'on-primary'">
                                        <rt-spinner [color]="color" [appearance]="appearance" />
                                    </span>
                                </ng-template>
                            </app-story-row>
                        }
                    </ng-template>
                </app-story-presets>
            }

            @case ('plate') {
                <app-story-presets caption="Плашка под кольцом в обоих наборах">
                    <ng-template>
                        @for (appearance of appearances; track appearance) {
                            <app-story-row [caption]="appearance" [items]="diameters" [itemLabel]="diameterLabel">
                                <ng-template let-diameter>
                                    <rt-spinner plate [diameter]="diameter" [appearance]="appearance" />
                                </ng-template>
                            </app-story-row>
                        }
                    </ng-template>
                </app-story-presets>
            }

            @case ('overlay') {
                <app-story-presets caption="Спиннер поверх блока в обоих наборах">
                    <ng-template>
                        <app-story-row [items]="overlays" [itemLabel]="overlayLabel">
                            <ng-template let-mode>
                                <div class="app-spinner-matrix__box">
                                    <p class="app-spinner-matrix__text">
                                        Список заявок обновляется. Строки под спиннером остаются на месте.
                                    </p>
                                    <rt-spinner overlay [backdrop]="mode.backdrop" [plate]="mode.plate" [appearance]="mode.appearance" />
                                </div>
                            </ng-template>
                        </app-story-row>
                    </ng-template>
                </app-story-presets>

                <p class="app-spinner-matrix__note">
                    Спиннер накрывает ближайшего позиционированного родителя — здесь это рамка с текстом. Родителя спиннер не трогает:
                    приложение ставит ему position само.
                </p>
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

        .app-spinner-matrix__box {
            position: relative;
            width: 14rem;
            height: 8rem;
            padding: 0.75rem;
            box-sizing: border-box;
            border: 1px solid var(--rt-color-border-subtle);
            border-radius: var(--rt-radius-md);
            background-color: var(--rt-color-bg-surface);
        }

        .app-spinner-matrix__text {
            margin: 0;
            color: var(--rt-color-text-primary);
            font-size: 0.8125rem;
            line-height: 1.5;
        }

        .app-spinner-matrix__note {
            max-width: 46rem;
            color: var(--rt-color-text-muted);
            font-size: 0.8125rem;
            line-height: 1.6;
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

    public readonly appearances: readonly IRtSpinner.Appearance[] = ['border', 'arc'];

    /** Сочетания оверлея: голый, с подложкой, с подложкой и плашкой, дугой на плашке. */
    public readonly overlays: readonly ISpinnerOverlayMode[] = [
        { label: 'без подложки', backdrop: false, plate: false, appearance: 'border' },
        { label: 'подложка', backdrop: true, plate: false, appearance: 'border' },
        { label: 'подложка и плашка', backdrop: true, plate: true, appearance: 'border' },
        { label: 'дуга на плашке', backdrop: true, plate: true, appearance: 'arc' },
    ];

    public readonly diameterLabel: (value: number) => string = (value: number): string => `${value}px`;

    public readonly overlayLabel: (mode: ISpinnerOverlayMode) => string = (mode: ISpinnerOverlayMode): string => mode.label;
}
