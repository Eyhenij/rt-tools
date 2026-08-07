import { ChangeDetectionStrategy, Component } from '@angular/core';

import { StoryRowComponent } from '../../../../../showcase/story-row.component';
import { StoryThemesComponent } from '../../../../../showcase/story-themes.component';
import { RtStatTileComponent } from '../../rt-stat-tile.component';
import { IRtStatTile } from '../../rt-stat-tile.model';

/** Какую матрицу рисовать: у каждой оси своя история, и выбирает её этот вход. */
export type StatTileMatrixPart = 'delta' | 'baseline' | 'parts' | 'themes';

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
                <app-story-row caption="Изменение" [items]="deltaCases" [itemLabel]="deltaCaseLabel">
                    <ng-template let-deltaCase>
                        <rt-stat-tile label="Визиты" value="1 240" [deltaPrimary]="deltaCase.delta" />
                    </ng-template>
                </app-story-row>
            }

            @case ('baseline') {
                <app-story-row caption="База сравнения" [items]="baselineCases" [itemLabel]="deltaCaseLabel">
                    <ng-template let-deltaCase>
                        <rt-stat-tile label="Визиты" value="1 240" [deltaPrimary]="deltaCase.delta" />
                    </ng-template>
                </app-story-row>
            }

            @case ('parts') {
                <app-story-row caption="Необязательные части" [items]="partsCases" [itemLabel]="partsCaseLabel">
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
            }

            @case ('themes') {
                <app-story-themes caption="Знак изменения в обеих темах">
                    <ng-template>
                        @for (deltaCase of deltaCases; track deltaCase.name) {
                            <rt-stat-tile label="Визиты" value="1 240" [deltaPrimary]="deltaCase.delta" />
                        }
                    </ng-template>
                </app-story-themes>
            }
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtStatTileComponent,

        // showcase
        StoryRowComponent,
        StoryThemesComponent,
    ],
})
export class TestRtStatTileMatrixComponent {
    public part: StatTileMatrixPart = 'delta';

    public readonly growth: IRtStatTile.Delta = { percent: 12.5, label: 'к прошлой неделе' };

    /** Четыре исхода знака, включая два разных «ничего»: `null` и ноль. */
    public readonly deltaCases: readonly IStatTileDeltaCase[] = [
        { name: 'рост', delta: { percent: 12.5, label: 'к прошлой неделе' } },
        { name: 'падение', delta: { percent: -8.4, label: 'к прошлой неделе' } },
        { name: 'без изменений', delta: { percent: 0, label: 'к прошлой неделе' } },
        { name: 'сравнить не с чем', delta: { percent: null, label: 'к прошлой неделе' } },
        { name: 'изменения нет вовсе', delta: null },
    ];

    public readonly baselineCases: readonly IStatTileDeltaCase[] = [
        { name: 'без базы', delta: { percent: 12.5, label: 'к прошлой неделе' } },
        { name: 'с базой', delta: { percent: 12.5, label: 'к прошлой неделе', baseline: '1 100' } },
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
