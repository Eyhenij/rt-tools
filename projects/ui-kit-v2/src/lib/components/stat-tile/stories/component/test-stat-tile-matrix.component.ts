import { ChangeDetectionStrategy, Component } from '@angular/core';

import { StoryRowComponent } from '../../../../../showcase/story-row.component';
import { StoryPresetsComponent } from '../../../../../showcase/story-presets.component';
import { StoryThemesComponent } from '../../../../../showcase/story-themes.component';
import { RtStatTileComponent } from '../../rt-stat-tile.component';
import { IRtStatTile } from '../../rt-stat-tile.model';

/** Подпись изменения — одна на все ячейки матрицы. */
const DELTA_LABEL: string = 'к прошлой неделе';

/** Какую матрицу рисовать: у каждой оси своя история, и выбирает её этот вход. */
export type TStatTileMatrixPart = 'delta' | 'baseline' | 'parts' | 'presets' | 'themes';

/** Случай изменения — подпись для ряда и само значение входа. */
interface IStatTileDeltaCase {
    readonly name: string;
    readonly delta: IRtStatTile.Delta | null;
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

    public readonly deltaCaseLabel: (value: IStatTileDeltaCase) => string = (value: IStatTileDeltaCase): string => value.name;

    public readonly partsCaseLabel: (value: IStatTilePartsCase) => string = (value: IStatTilePartsCase): string => value.name;
}
