import { ChangeDetectionStrategy, Component } from '@angular/core';

import { StoryGridComponent } from '../../../../../showcase/story-grid.component';
import { StoryPresetsComponent } from '../../../../../showcase/story-presets.component';
import { StoryRowComponent } from '../../../../../showcase/story-row.component';
import { StoryThemesComponent } from '../../../../../showcase/story-themes.component';
import { RtLiveBadgeComponent } from '../../rt-live-badge.component';

/** Какую матрицу рисовать: у каждой оси своя история, и выбирает её этот вход. */
export type TLiveBadgeMatrixPart = 'active' | 'label' | 'presets' | 'themes';

/** Случай подписи — не значение оси, а различимая пара «что передали → что нарисовано». */
interface ILiveBadgeLabelCase {
    readonly name: string;
    readonly label: string;
}

/**
 * Матрицы `rt-live-badge` для витрины.
 *
 * Перемножены живость со счётчиком — ровно та пара, ради которой у бейджа два входа вместо
 * одного: ноль при живом потоке это данные, а оборванный поток — их отсутствие, и выглядеть
 * они обязаны по-разному. Ряд из четырёх значений эту разницу спрятал бы.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-live-badge-matrix',
    template: `
        @switch (part) {
            @case ('active') {
                <app-story-presets caption="Живость × счётчик в обоих наборах">
                    <ng-template>
                        <app-story-grid [rows]="activeStates" [columns]="counts" [rowLabel]="activeLabel" [columnLabel]="countLabel">
                            <ng-template let-active let-count="col">
                                <rt-live-badge label="Смотрят сейчас" [active]="active" [count]="count" />
                            </ng-template>
                        </app-story-grid>
                    </ng-template>
                </app-story-presets>
            }

            @case ('label') {
                <app-story-presets caption="Подпись в обоих наборах">
                    <ng-template>
                        <app-story-row [items]="labelCases" [itemLabel]="labelCaseLabel">
                            <ng-template let-labelCase>
                                <rt-live-badge [label]="labelCase.label" [count]="128" [active]="true" />
                            </ng-template>
                        </app-story-row>
                    </ng-template>
                </app-story-presets>
            }

            @case ('presets') {
                <app-story-presets caption="Живость в обоих наборах">
                    <ng-template>
                        @for (active of activeStates; track active) {
                            <rt-live-badge label="Смотрят сейчас" [count]="128" [active]="active" />
                        }
                    </ng-template>
                </app-story-presets>
            }

            @case ('themes') {
                <app-story-presets caption="Живость в обеих темах в обоих наборах">
                    <ng-template>
                        <app-story-themes>
                            <ng-template>
                                @for (active of activeStates; track active) {
                                    <rt-live-badge label="Смотрят сейчас" [count]="128" [active]="active" />
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
        RtLiveBadgeComponent,

        // showcase
        StoryGridComponent,
        StoryPresetsComponent,
        StoryRowComponent,
        StoryThemesComponent,
    ],
})
export class TestRtLiveBadgeMatrixComponent {
    public part: TLiveBadgeMatrixPart = 'active';

    public readonly activeStates: readonly boolean[] = [true, false];

    /** `null` — не отсутствие значения, а «данных нет»: бейдж рисует прочерк, а не ноль. */
    public readonly counts: readonly (number | null)[] = [null, 0, 128, 12480];

    public readonly labelCases: readonly ILiveBadgeLabelCase[] = [
        { name: 'пустая → перевод кита', label: '' },
        { name: 'своя', label: 'Смотрят сейчас' },
    ];

    public readonly activeLabel: (value: boolean) => string = (value: boolean): string => (value ? 'поток жив' : 'поток оборван');

    public readonly countLabel: (value: number | null) => string = (value: number | null): string =>
        value === null ? 'данных нет' : String(value);

    public readonly labelCaseLabel: (value: ILiveBadgeLabelCase) => string = (value: ILiveBadgeLabelCase): string => value.name;
}
