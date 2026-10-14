import { ChangeDetectionStrategy, Component } from '@angular/core';

import { StoryGridComponent } from '../../../../../showcase/story-grid.component';
import { StoryPresetsComponent } from '../../../../../showcase/story-presets.component';
import { StoryRowComponent } from '../../../../../showcase/story-row.component';
import { StoryThemesComponent } from '../../../../../showcase/story-themes.component';
import { RtIconComponent } from '../../../icon/rt-icon.component';
import { RtBadgeDirective } from '../../rt-badge.directive';
import { IRtBadge } from '../../rt-badge.model';

/** Какую матрицу рисовать: у каждой оси своя история, и выбирает её этот вход. */
export type TBadgeMatrixPart = 'position' | 'color' | 'value' | 'presets' | 'themes';

/** Случай значения: что передали и как это подписать. */
interface IBadgeValueCase {
    readonly name: string;
    readonly value: IRtBadge.ValueInput;
    readonly hidden: boolean;
}

/**
 * Матрицы `rtBadge` для витрины.
 *
 * Перемножены угол и наложение — пара, у которой пузырёк меняет место по обеим осям сразу: поверх
 * угла значка и рядом с подписью. Цвет перемножен с размером: маленький пузырёк меняет кегль, и
 * читаемость надо видеть на каждой заливке.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-badge-matrix',
    template: `
        @switch (part) {
            @case ('position') {
                <app-story-presets caption="Угол × наложение в обоих наборах: поверх значка и рядом с подписью">
                    <ng-template>
                        <app-story-grid [rows]="overlaps" [columns]="positions" [rowLabel]="overlapLabel">
                            <ng-template let-overlap let-position="col">
                                <div class="app-badge-demo__cell">
                                    @if (overlap) {
                                        <rt-icon name="bell" [rtBadge]="3" [rtBadgePosition]="position" />
                                    } @else {
                                        <span
                                            class="app-badge-demo__label"
                                            [rtBadge]="12"
                                            [rtBadgeOverlap]="false"
                                            [rtBadgePosition]="position">
                                            Отели
                                        </span>
                                    }
                                </div>
                            </ng-template>
                        </app-story-grid>
                    </ng-template>
                </app-story-presets>
            }

            @case ('color') {
                <app-story-presets caption="Цвет × размер в обоих наборах">
                    <ng-template>
                        <app-story-grid [rows]="sizes" [columns]="colors">
                            <ng-template let-size let-color="col">
                                <div class="app-badge-demo__cell">
                                    <rt-icon name="bell" [rtBadge]="size === 'sm' ? 5 : 24" [rtBadgeSize]="size" [rtBadgeColor]="color" />
                                </div>
                            </ng-template>
                        </app-story-grid>
                    </ng-template>
                </app-story-presets>
            }

            @case ('value') {
                <app-story-presets caption="Значение в обоих наборах: пустое и скрытое пузырька не рисуют">
                    <ng-template>
                        <app-story-row [items]="values" [itemLabel]="valueLabel">
                            <ng-template let-valueCase>
                                <div class="app-badge-demo__cell">
                                    <span
                                        class="app-badge-demo__label"
                                        [rtBadge]="valueCase.value"
                                        [rtBadgeOverlap]="false"
                                        [rtBadgeHidden]="valueCase.hidden">
                                        Чат
                                    </span>
                                </div>
                            </ng-template>
                        </app-story-row>
                    </ng-template>
                </app-story-presets>
            }

            @case ('presets') {
                <app-story-presets caption="Пузырёк в обоих наборах">
                    <ng-template>
                        <div class="app-badge-demo__cell">
                            <rt-icon name="bell" [rtBadge]="3" />
                            <span class="app-badge-demo__label" [rtBadge]="12" [rtBadgeOverlap]="false">Отели</span>
                        </div>
                    </ng-template>
                </app-story-presets>
            }

            @case ('themes') {
                <app-story-presets caption="Пузырёк в обеих темах в обоих наборах">
                    <ng-template>
                        <app-story-themes>
                            <ng-template>
                                <div class="app-badge-demo__cell">
                                    <rt-icon name="bell" [rtBadge]="3" />
                                    <span class="app-badge-demo__label" [rtBadge]="12" [rtBadgeOverlap]="false">Отели</span>
                                    <span class="app-badge-demo__label" rtBadge="!" rtBadgeColor="danger" [rtBadgeOverlap]="false">
                                        Ошибки
                                    </span>
                                </div>
                            </ng-template>
                        </app-story-themes>
                    </ng-template>
                </app-story-presets>
            }
        }
    `,
    // native-ok: раскладка ячеек витрины — пузырёк выходит за хост, и ячейке нужен запас по краям
    styles: `
        .app-badge-demo__cell {
            display: flex;
            align-items: center;
            padding: var(--rt-space-4) var(--rt-space-8);
            gap: var(--rt-space-10);
        }

        .app-badge-demo__label {
            font-size: var(--rt-text-sm);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtIconComponent,

        // directives
        RtBadgeDirective,

        // showcase
        StoryGridComponent,
        StoryPresetsComponent,
        StoryRowComponent,
        StoryThemesComponent,
    ],
})
export class TestRtBadgeMatrixComponent {
    public part: TBadgeMatrixPart = 'position';

    public readonly overlaps: readonly boolean[] = [true, false];
    public readonly positions: readonly IRtBadge.Position[] = ['above-after', 'above-before', 'below-after', 'below-before'];
    public readonly sizes: readonly IRtBadge.Size[] = ['md', 'sm'];
    public readonly colors: readonly IRtBadge.Color[] = ['primary', 'secondary', 'info', 'success', 'warning', 'danger'];

    public readonly values: readonly IBadgeValueCase[] = [
        { name: 'число', value: 7, hidden: false },
        { name: 'ноль', value: 0, hidden: false },
        { name: 'строка 99+', value: '99+', hidden: false },
        { name: 'null — нет пузырька', value: null, hidden: false },
        { name: 'hidden — нет пузырька', value: 7, hidden: true },
    ];

    public readonly overlapLabel: (value: boolean) => string = (value: boolean): string =>
        value ? 'overlap — поверх значка' : 'рядом с подписью';

    public readonly valueLabel: (value: IBadgeValueCase) => string = (value: IBadgeValueCase): string => value.name;
}
