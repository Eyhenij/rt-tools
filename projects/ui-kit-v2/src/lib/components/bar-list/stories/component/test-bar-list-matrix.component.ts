import { ChangeDetectionStrategy, Component } from '@angular/core';

import { StoryRowComponent } from '../../../../../showcase/story-row.component';
import { StoryPresetsComponent } from '../../../../../showcase/story-presets.component';
import { StoryThemesComponent } from '../../../../../showcase/story-themes.component';
import { RtBarListComponent } from '../../rt-bar-list.component';
import { IRtBarList } from '../../rt-bar-list.model';
import { BAR_LIST_ROWS } from './bar-list.fixture';

/** Какую матрицу рисовать: у каждой оси своя история, и выбирает её этот вход. */
export type TBarListMatrixPart = 'share' | 'meta' | 'length' | 'empty' | 'presets' | 'themes';

/** Случай списка: имя для подписи ячейки и сами строки. */
interface IBarListCase {
    readonly name: string;
    readonly rows: readonly IRtBarList.Row[];
}

/**
 * Матрицы состояний `rt-bar-list` для витрины.
 *
 * Главная ось — доля полосы, и показывать её надо крайними значениями: **`value` и
 * `sharePercent` разные вещи**. Первое рисуется текстом справа и бывает чем угодно — «52%»,
 * «1 240 ₽», «12 шт.», — второе задаёт ширину полосы. Считать проценты компонент не умеет, и
 * ряд с расходящейся парой это показывает прямо.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
/** Строка без приписки: ключа `meta` в ней нет вовсе, а не пустое значение. */
function withoutMeta(row: IRtBarList.Row): IRtBarList.Row {
    return { id: row.id, title: row.title, value: row.value, sharePercent: row.sharePercent };
}

@Component({
    selector: 'app-bar-list-matrix',
    template: `
        @switch (part) {
            @case ('share') {
                <app-story-presets caption="Доля полосы в обоих наборах">
                    <ng-template>
                        <app-story-row slotWidth="20rem" [items]="shares" [itemLabel]="caseLabel">
                            <ng-template let-item>
                                <rt-bar-list title="Заявки по городам" [rows]="item.rows" />
                            </ng-template>
                        </app-story-row>
                    </ng-template>
                </app-story-presets>
            }

            @case ('meta') {
                <app-story-presets caption="Приписка и вид значения в обоих наборах">
                    <ng-template>
                        <app-story-row slotWidth="20rem" [items]="metas" [itemLabel]="caseLabel">
                            <ng-template let-item>
                                <rt-bar-list title="Заявки по городам" [rows]="item.rows" />
                            </ng-template>
                        </app-story-row>
                    </ng-template>
                </app-story-presets>
            }

            @case ('length') {
                <app-story-presets caption="Длина набора в обоих наборах">
                    <ng-template>
                        <app-story-row slotWidth="20rem" [items]="lengths" [itemLabel]="caseLabel">
                            <ng-template let-item>
                                <rt-bar-list title="Заявки по городам" [rows]="item.rows" />
                            </ng-template>
                        </app-story-row>
                    </ng-template>
                </app-story-presets>
            }

            @case ('empty') {
                <app-story-presets caption="Пустой набор в обоих наборах">
                    <ng-template>
                        <app-story-row slotWidth="20rem" [items]="empties">
                            <ng-template let-empty>
                                @switch (empty) {
                                    @case ('переведённый текст') {
                                        <rt-bar-list title="Заявки по городам" [rows]="none" />
                                    }
                                    @case ('свой текст') {
                                        <rt-bar-list
                                            title="Заявки по городам"
                                            emptyText="За выбранный период заявок не было"
                                            [rows]="none" />
                                    }
                                }
                            </ng-template>
                        </app-story-row>
                    </ng-template>
                </app-story-presets>
            }

            @case ('presets') {
                <app-story-presets caption="Список в обоих наборах">
                    <ng-template>
                        <div style="width: 20rem">
                            <rt-bar-list title="Заявки по городам" [rows]="rows" />
                        </div>
                    </ng-template>
                </app-story-presets>
            }

            @case ('themes') {
                <app-story-presets caption="Список в обеих темах в обоих наборах">
                    <ng-template>
                        <app-story-themes>
                            <ng-template>
                                <div style="width: 20rem">
                                    <rt-bar-list title="Заявки по городам" [rows]="rows" />
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
        RtBarListComponent,

        // showcase
        StoryPresetsComponent,
        StoryRowComponent,
        StoryThemesComponent,
    ],
})
export class TestRtBarListMatrixComponent {
    public part: TBarListMatrixPart = 'share';

    public readonly rows: readonly IRtBarList.Row[] = BAR_LIST_ROWS;
    public readonly none: readonly IRtBarList.Row[] = [];

    /** Доля показана краями: нулевая полоса, полная и расходящаяся с подписью. */
    public readonly shares: readonly IBarListCase[] = [
        {
            name: 'от нуля до ста',
            rows: [
                { id: 'zero', title: 'Ноль', value: '0%', sharePercent: 0 },
                { id: 'half', title: 'Половина', value: '50%', sharePercent: 50 },
                { id: 'full', title: 'Всё', value: '100%', sharePercent: 100 },
            ],
        },
        { name: 'убывающий ряд', rows: BAR_LIST_ROWS },
        {
            name: 'подпись не равна доле',
            rows: [
                { id: 'sum', title: 'Выручка', value: '1 240 ₽', sharePercent: 72 },
                { id: 'count', title: 'Отгрузки', value: '12 шт.', sharePercent: 28 },
            ],
        },
    ];

    /** Приписка рисуется, только когда передана. */
    public readonly metas: readonly IBarListCase[] = [
        { name: 'с припиской', rows: BAR_LIST_ROWS.slice(0, 2) },
        { name: 'без приписки', rows: BAR_LIST_ROWS.slice(0, 2).map(withoutMeta) },
        {
            name: 'длинное название',
            rows: [{ id: 'long', title: 'Заявки из отдалённых районов области', meta: '4 заявки', value: '1%', sharePercent: 1 }],
        },
    ];

    public readonly lengths: readonly IBarListCase[] = [
        { name: 'одна строка', rows: BAR_LIST_ROWS.slice(0, 1) },
        { name: 'четыре строки', rows: BAR_LIST_ROWS },
    ];

    public readonly empties: readonly string[] = ['переведённый текст', 'свой текст'];

    public readonly caseLabel: (value: IBarListCase) => string = (value: IBarListCase): string => value.name;
}
