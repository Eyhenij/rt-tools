import { ChangeDetectionStrategy, Component } from '@angular/core';

import { StoryRowComponent } from '../../../../../showcase/story-row.component';
import { StoryThemesComponent } from '../../../../../showcase/story-themes.component';
import { RtBarListComponent } from '../../rt-bar-list.component';
import { IRtBarList } from '../../rt-bar-list.model';

/** Какую матрицу рисовать: у каждой оси своя история, и выбирает её этот вход. */
export type TBarListMatrixPart = 'share' | 'meta' | 'length' | 'empty' | 'themes';

/** Случай списка: имя для подписи ячейки и сами строки. */
interface IBarListCase {
    readonly name: string;
    readonly rows: readonly IRtBarList.Row[];
}

const ROWS: readonly IRtBarList.Row[] = [
    { id: 'moscow', title: 'Москва', meta: '412 заявок', value: '52%', sharePercent: 52 },
    { id: 'spb', title: 'Санкт-Петербург', meta: '198 заявок', value: '25%', sharePercent: 25 },
    { id: 'nsk', title: 'Новосибирск', meta: '96 заявок', value: '12%', sharePercent: 12 },
    { id: 'other', title: 'Остальные', meta: '87 заявок', value: '11%', sharePercent: 11 },
];

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
                <app-story-row caption="Доля полосы" slotWidth="20rem" [items]="shares" [itemLabel]="caseLabel">
                    <ng-template let-item>
                        <rt-bar-list title="Заявки по городам" [rows]="item.rows" />
                    </ng-template>
                </app-story-row>
            }

            @case ('meta') {
                <app-story-row caption="Приписка и вид значения" slotWidth="20rem" [items]="metas" [itemLabel]="caseLabel">
                    <ng-template let-item>
                        <rt-bar-list title="Заявки по городам" [rows]="item.rows" />
                    </ng-template>
                </app-story-row>
            }

            @case ('length') {
                <app-story-row caption="Длина набора" slotWidth="20rem" [items]="lengths" [itemLabel]="caseLabel">
                    <ng-template let-item>
                        <rt-bar-list title="Заявки по городам" [rows]="item.rows" />
                    </ng-template>
                </app-story-row>
            }

            @case ('empty') {
                <app-story-row caption="Пустой набор" slotWidth="20rem" [items]="empties">
                    <ng-template let-empty>
                        @switch (empty) {
                            @case ('переведённый текст') {
                                <rt-bar-list title="Заявки по городам" [rows]="none" />
                            }
                            @case ('свой текст') {
                                <rt-bar-list title="Заявки по городам" emptyText="За выбранный период заявок не было" [rows]="none" />
                            }
                        }
                    </ng-template>
                </app-story-row>
            }

            @case ('themes') {
                <app-story-themes caption="Список в обеих темах">
                    <ng-template>
                        <div style="width: 20rem">
                            <rt-bar-list title="Заявки по городам" [rows]="rows" />
                        </div>
                    </ng-template>
                </app-story-themes>
            }
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtBarListComponent,

        // showcase
        StoryRowComponent,
        StoryThemesComponent,
    ],
})
export class TestRtBarListMatrixComponent {
    public part: TBarListMatrixPart = 'share';

    public readonly rows: readonly IRtBarList.Row[] = ROWS;
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
        { name: 'убывающий ряд', rows: ROWS },
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
        { name: 'с припиской', rows: ROWS.slice(0, 2) },
        { name: 'без приписки', rows: ROWS.slice(0, 2).map(withoutMeta) },
        {
            name: 'длинное название',
            rows: [{ id: 'long', title: 'Заявки из отдалённых районов области', meta: '4 заявки', value: '1%', sharePercent: 1 }],
        },
    ];

    public readonly lengths: readonly IBarListCase[] = [
        { name: 'одна строка', rows: ROWS.slice(0, 1) },
        { name: 'четыре строки', rows: ROWS },
    ];

    public readonly empties: readonly string[] = ['переведённый текст', 'свой текст'];

    public readonly caseLabel: (value: IBarListCase) => string = (value: IBarListCase): string => value.name;
}
