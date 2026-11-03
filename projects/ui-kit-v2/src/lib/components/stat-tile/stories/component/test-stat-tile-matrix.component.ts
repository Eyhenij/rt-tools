import { ChangeDetectionStrategy, Component } from '@angular/core';

import { StoryRowComponent } from '../../../../../showcase/story-row.component';
import { StoryPresetsComponent } from '../../../../../showcase/story-presets.component';
import { StoryThemesComponent } from '../../../../../showcase/story-themes.component';
import { RtStatTileComponent } from '../../rt-stat-tile.component';
import { IRtStatTile } from '../../rt-stat-tile.model';

/** Подпись изменения — одна на все ячейки матрицы. */
const DELTA_LABEL: string = 'к прошлой неделе';

/** Подпись годового сравнения. */
const YEAR_LABEL: string = 'к прошлому году';

/** Какую матрицу рисовать: у каждой оси своя история, и выбирает её этот вход. */
export type TStatTileMatrixPart = 'delta' | 'baseline' | 'parts' | 'unit' | 'growth' | 'presets' | 'themes';

/** Случай изменения — подпись для ряда и само значение входа. */
interface IStatTileDeltaCase {
    readonly name: string;
    readonly delta: IRtStatTile.Delta | null;
}

/** Случай двух строк изменения: единица у каждой своя, признак «рост хуже» — на плитке. */
interface IStatTileRowsCase {
    readonly name: string;
    readonly label: string;
    readonly value: string;
    readonly growthIsWorse: boolean;
    readonly deltaPrimary: IRtStatTile.Delta | null;
    readonly deltaSecondary: IRtStatTile.Delta | null;
}

/** Случай состава плитки: какие из необязательных частей заполнены. */
interface IStatTilePartsCase {
    readonly name: string;
    readonly secondary: string | null;
    readonly hint: string | null;
    readonly deltaSecondary: IRtStatTile.Delta | null;
}

/**
 * Матрицы `rt-stat-tile` для витрины.
 *
 * Главная ось — знак изменения: он выводится из числа, и у него четыре различимых исхода,
 * включая два разных «ничего»: `null` не рисует изменение вовсе, а ноль рисует «без
 * изменений». Пустая плашка на месте первого читалась бы как второй.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-stat-tile-matrix',
    template: `
        @switch (part) {
            @case ('delta') {
                <app-story-presets caption="Изменение в обоих наборах">
                    <ng-template>
                        <app-story-row [items]="deltaCases" [itemLabel]="deltaCaseLabel">
                            <ng-template let-deltaCase>
                                <rt-stat-tile label="Визиты" value="1 240" [deltaPrimary]="deltaCase.delta" />
                            </ng-template>
                        </app-story-row>
                    </ng-template>
                </app-story-presets>
            }

            @case ('baseline') {
                <app-story-presets caption="База сравнения в обоих наборах">
                    <ng-template>
                        <app-story-row [items]="baselineCases" [itemLabel]="deltaCaseLabel">
                            <ng-template let-deltaCase>
                                <rt-stat-tile label="Визиты" value="1 240" [deltaPrimary]="deltaCase.delta" />
                            </ng-template>
                        </app-story-row>
                    </ng-template>
                </app-story-presets>
            }

            @case ('parts') {
                <app-story-presets caption="Необязательные части в обоих наборах">
                    <ng-template>
                        <app-story-row [items]="partsCases" [itemLabel]="partsCaseLabel">
                            <ng-template let-partsCase>
                                <rt-stat-tile
                                    label="Визиты"
                                    value="1 240"
                                    [secondary]="partsCase.secondary"
                                    [hint]="partsCase.hint"
                                    [deltaPrimary]="growth"
                                    [deltaSecondary]="partsCase.deltaSecondary" />
                            </ng-template>
                        </app-story-row>
                    </ng-template>
                </app-story-presets>
            }

            @case ('unit') {
                <app-story-presets caption="Единица изменения в обоих наборах">
                    <ng-template>
                        <app-story-row [items]="unitCases" [itemLabel]="rowsCaseLabel">
                            <ng-template let-rowsCase>
                                <rt-stat-tile
                                    [label]="rowsCase.label"
                                    [value]="rowsCase.value"
                                    [growthIsWorse]="rowsCase.growthIsWorse"
                                    [deltaPrimary]="rowsCase.deltaPrimary"
                                    [deltaSecondary]="rowsCase.deltaSecondary" />
                            </ng-template>
                        </app-story-row>
                    </ng-template>
                </app-story-presets>
            }

            @case ('growth') {
                <app-story-presets caption="Рост лучше и рост хуже в обоих наборах">
                    <ng-template>
                        <app-story-row [items]="growthCases" [itemLabel]="rowsCaseLabel">
                            <ng-template let-rowsCase>
                                <rt-stat-tile
                                    [label]="rowsCase.label"
                                    [value]="rowsCase.value"
                                    [growthIsWorse]="rowsCase.growthIsWorse"
                                    [deltaPrimary]="rowsCase.deltaPrimary"
                                    [deltaSecondary]="rowsCase.deltaSecondary" />
                            </ng-template>
                        </app-story-row>
                    </ng-template>
                </app-story-presets>
            }

            @case ('presets') {
                <app-story-presets caption="Знак изменения в обоих наборах">
                    <ng-template>
                        @for (deltaCase of deltaCases; track deltaCase.name) {
                            <rt-stat-tile label="Визиты" value="1 240" [deltaPrimary]="deltaCase.delta" />
                        }
                    </ng-template>
                </app-story-presets>
            }

            @case ('themes') {
                <app-story-presets caption="Знак изменения в обеих темах в обоих наборах">
                    <ng-template>
                        <app-story-themes>
                            <ng-template>
                                @for (deltaCase of deltaCases; track deltaCase.name) {
                                    <rt-stat-tile label="Визиты" value="1 240" [deltaPrimary]="deltaCase.delta" />
                                }
                                @for (rowsCase of themeGrowthCases; track rowsCase.name) {
                                    <rt-stat-tile
                                        [label]="rowsCase.label"
                                        [value]="rowsCase.value"
                                        [growthIsWorse]="rowsCase.growthIsWorse"
                                        [deltaPrimary]="rowsCase.deltaPrimary"
                                        [deltaSecondary]="rowsCase.deltaSecondary" />
                                }
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
        RtStatTileComponent,

        // showcase
        StoryPresetsComponent,
        StoryRowComponent,
        StoryThemesComponent,
    ],
})
export class TestRtStatTileMatrixComponent {
    public part: TStatTileMatrixPart = 'delta';

    public readonly growth: IRtStatTile.Delta = { percent: 12.5, label: DELTA_LABEL };

    /** Четыре исхода знака, включая два разных «ничего»: `null` и ноль. */
    public readonly deltaCases: readonly IStatTileDeltaCase[] = [
        { name: 'рост', delta: { percent: 12.5, label: DELTA_LABEL } },
        { name: 'падение', delta: { percent: -8.4, label: DELTA_LABEL } },
        { name: 'без изменений', delta: { percent: 0, label: DELTA_LABEL } },
        { name: 'сравнить не с чем', delta: { percent: null, label: DELTA_LABEL } },
        { name: 'изменения нет вовсе', delta: null },
    ];

    public readonly baselineCases: readonly IStatTileDeltaCase[] = [
        { name: 'без базы', delta: { percent: 12.5, label: DELTA_LABEL } },
        { name: 'с базой', delta: { percent: 12.5, label: DELTA_LABEL, baseline: '1 100' } },
    ];

    public readonly partsCases: readonly IStatTilePartsCase[] = [
        { name: 'только значение', secondary: null, hint: null, deltaSecondary: null },
        { name: 'подзаголовок', secondary: 'из них 300 новых', hint: null, deltaSecondary: null },
        { name: 'подсказка', secondary: null, hint: 'Считается по уникальным', deltaSecondary: null },
        {
            name: 'второе изменение',
            secondary: null,
            hint: null,
            deltaSecondary: { percent: 8, label: 'к прошлому году' },
        },
    ];

    /** Единица у каждой строки своя: доли пишутся в пунктах, суммы — в процентах. */
    public readonly unitCases: readonly IStatTileRowsCase[] = [
        {
            name: 'проценты',
            label: 'Выручка',
            value: '1 240 000 ₽',
            growthIsWorse: false,
            deltaPrimary: { percent: 12.5, label: DELTA_LABEL, baseline: '1 102 000 ₽' },
            deltaSecondary: { percent: 8, label: YEAR_LABEL },
        },
        {
            name: 'пункты, рост',
            label: 'Занятость',
            value: '78 %',
            growthIsWorse: false,
            deltaPrimary: { percent: 10, unit: 'points', label: DELTA_LABEL, baseline: '68 %' },
            deltaSecondary: { percent: 4, unit: 'points', label: YEAR_LABEL },
        },
        {
            name: 'пункты, падение',
            label: 'Занятость',
            value: '61 %',
            growthIsWorse: false,
            deltaPrimary: { percent: -7, unit: 'points', label: DELTA_LABEL, baseline: '68 %' },
            deltaSecondary: { percent: -2.5, unit: 'points', label: YEAR_LABEL },
        },
        {
            name: 'пункты, ноль',
            label: 'Занятость',
            value: '50 %',
            growthIsWorse: false,
            deltaPrimary: { percent: 0, unit: 'points', label: DELTA_LABEL, baseline: '50 %' },
            deltaSecondary: { percent: 0, unit: 'points', label: YEAR_LABEL },
        },
        {
            name: 'разные единицы',
            label: 'Занятость',
            value: '78 %',
            growthIsWorse: false,
            deltaPrimary: { percent: 10, unit: 'points', label: DELTA_LABEL, baseline: '68 %' },
            deltaSecondary: { percent: 17, label: YEAR_LABEL },
        },
        {
            name: 'база неизвестна',
            label: 'Занятость',
            value: '78 %',
            growthIsWorse: false,
            deltaPrimary: { percent: null, unit: 'points', label: DELTA_LABEL },
            deltaSecondary: { percent: null, unit: 'points', label: YEAR_LABEL },
        },
    ];

    /** Цвет говорит, хорошо ли изменение, а стрелка — только знак числа. */
    public readonly growthCases: readonly IStatTileRowsCase[] = [
        {
            name: 'рост лучше',
            label: 'Бронирования',
            value: '42',
            growthIsWorse: false,
            deltaPrimary: { percent: 40, label: DELTA_LABEL, baseline: '30' },
            deltaSecondary: { percent: 17, label: YEAR_LABEL },
        },
        {
            name: 'рост хуже, рост',
            label: 'Отмены',
            value: '14',
            growthIsWorse: true,
            deltaPrimary: { percent: 40, label: DELTA_LABEL, baseline: '10' },
            deltaSecondary: { percent: 17, label: YEAR_LABEL },
        },
        {
            name: 'рост хуже, падение',
            label: 'Потерянная выручка',
            value: '65 000 ₽',
            growthIsWorse: true,
            deltaPrimary: { percent: -35, label: DELTA_LABEL, baseline: '100 000 ₽' },
            deltaSecondary: { percent: -12, label: YEAR_LABEL },
        },
        {
            name: 'рост хуже, пункты',
            label: 'Доля отмен',
            value: '18 %',
            growthIsWorse: true,
            deltaPrimary: { percent: 6, unit: 'points', label: DELTA_LABEL, baseline: '12 %' },
            deltaSecondary: { percent: -2, unit: 'points', label: YEAR_LABEL },
        },
        {
            name: 'рост хуже, ноль',
            label: 'Отмены',
            value: '10',
            growthIsWorse: true,
            deltaPrimary: { percent: 0, label: DELTA_LABEL, baseline: '10' },
            deltaSecondary: { percent: 0, label: YEAR_LABEL },
        },
    ];

    /** В тёмной теме — оба смысла роста рядом. */
    public readonly themeGrowthCases: readonly IStatTileRowsCase[] = this.growthCases.slice(1, 3);

    public readonly rowsCaseLabel: (value: IStatTileRowsCase) => string = (value: IStatTileRowsCase): string => value.name;

    public readonly deltaCaseLabel: (value: IStatTileDeltaCase) => string = (value: IStatTileDeltaCase): string => value.name;

    public readonly partsCaseLabel: (value: IStatTilePartsCase) => string = (value: IStatTilePartsCase): string => value.name;
}
