import {
    CdkCell,
    CdkCellDef,
    CdkColumnDef,
    CdkHeaderCell,
    CdkHeaderCellDef,
    CdkHeaderRow,
    CdkHeaderRowDef,
    CdkRow,
    CdkRowDef,
} from '@angular/cdk/table';
import { ChangeDetectionStrategy, Component } from '@angular/core';

import { ISortModel, EListSortOrder } from '@rt-tools/utils';

import { StoryRowComponent } from '../../../../../showcase/story-row.component';
import { StoryThemesComponent } from '../../../../../showcase/story-themes.component';
import { RtTableCardDirective } from '../../rt-table-card.directive';
import { RtTableComponent } from '../../rt-table.component';
import { IRtTable } from '../../rt-table.model';

/** Текст пустой таблицы — один на все ячейки матрицы. */
const EMPTY_MESSAGE: string = 'Договоров пока нет';

/** Какую матрицу рисовать: у каждой оси своя история, и выбирает её этот вход. */
export type TTableMatrixPart = 'density' | 'loading' | 'sort' | 'empty' | 'clickable' | 'cards' | 'themes';

/** Строка витрины: то, что показывают ячейки. */
interface ITableRow {
    readonly id: number;
    readonly title: string;
    readonly city: string;
    readonly sum: string;
}

const ROWS: readonly ITableRow[] = [
    { id: 1, title: 'Договор №2024-118', city: 'Москва', sum: '148 000 ₽' },
    { id: 2, title: 'Договор №2024-119', city: 'Санкт-Петербург', sum: '92 400 ₽' },
    { id: 3, title: 'Договор №2024-120', city: 'Новосибирск', sum: '61 000 ₽' },
];

const COLUMNS: readonly string[] = ['title', 'city', 'sum'];

const COLUMNS_CONFIG: readonly IRtTable.ColumnConfig[] = [
    { key: 'title', label: 'Договор', locked: true, sortable: true },
    { key: 'city', label: 'Город', sortable: true },
    { key: 'sum', label: 'Сумма' },
];

/**
 * Матрицы состояний `rt-table` для витрины.
 *
 * Колонки объявляются директивами таблицы, а не входом-набором, поэтому каждая ячейка матрицы
 * несёт свою копию разметки: одну таблицу в несколько ячеек не поставить.
 *
 * Показаны те оси, что меняют вид: **`loading` и `fetching` — разные состояния**. Первая
 * загрузка подменяет строки заглушками, догрузка оставляет показанное на месте — иначе таблица
 * мигала бы при каждой смене страницы, и порознь эти два не различить.
 *
 * Карточки в матрицу не выведены отдельной осью намеренно: **карточки — это другая разметка**,
 * и компонент сам решает по ширине показа, что показать. Увидеть их можно только на узком
 * кадре, о чём сказано в обзоре.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-table-matrix',
    template: `
        @switch (part) {
            @case ('density') {
                <app-story-row caption="Плотность строк" [items]="densities" [itemLabel]="densityLabel">
                    <ng-template let-density>
                        <table rt-table ariaLabel="Договоры" [dataSource]="rows" [columns]="columns" [density]="density">
                            <ng-container cdkColumnDef="title">
                                <th *cdkHeaderCellDef cdk-header-cell>Договор</th>
                                <td *cdkCellDef="let row" cdk-cell>{{ row.title }}</td>
                            </ng-container>
                            <ng-container cdkColumnDef="city">
                                <th *cdkHeaderCellDef cdk-header-cell>Город</th>
                                <td *cdkCellDef="let row" cdk-cell>{{ row.city }}</td>
                            </ng-container>
                            <ng-container cdkColumnDef="sum">
                                <th *cdkHeaderCellDef cdk-header-cell>Сумма</th>
                                <td *cdkCellDef="let row" cdk-cell>{{ row.sum }}</td>
                            </ng-container>
                            <tr *cdkHeaderRowDef="columns" cdk-header-row></tr>
                            <tr *cdkRowDef="let row; columns: columns" cdk-row></tr>
                        </table>
                    </ng-template>
                </app-story-row>
            }

            @case ('loading') {
                <app-story-row caption="Загрузка и догрузка" [items]="loadingCases" [itemLabel]="loadingLabel">
                    <ng-template let-item>
                        <table
                            rt-table
                            ariaLabel="Договоры"
                            [dataSource]="item.first ? [] : rows"
                            [columns]="columns"
                            [loading]="item.loading"
                            [fetching]="item.fetching"
                            [skeletonRows]="3">
                            <ng-container cdkColumnDef="title">
                                <th *cdkHeaderCellDef cdk-header-cell>Договор</th>
                                <td *cdkCellDef="let row" cdk-cell>{{ row.title }}</td>
                            </ng-container>
                            <ng-container cdkColumnDef="city">
                                <th *cdkHeaderCellDef cdk-header-cell>Город</th>
                                <td *cdkCellDef="let row" cdk-cell>{{ row.city }}</td>
                            </ng-container>
                            <ng-container cdkColumnDef="sum">
                                <th *cdkHeaderCellDef cdk-header-cell>Сумма</th>
                                <td *cdkCellDef="let row" cdk-cell>{{ row.sum }}</td>
                            </ng-container>
                            <tr *cdkHeaderRowDef="columns" cdk-header-row></tr>
                            <tr *cdkRowDef="let row; columns: columns" cdk-row></tr>
                        </table>
                    </ng-template>
                </app-story-row>
            }

            @case ('sort') {
                <app-story-row caption="Порядок строк" [items]="sorts" [itemLabel]="sortLabel">
                    <ng-template let-item>
                        <table
                            rt-table
                            ariaLabel="Договоры"
                            [dataSource]="rows"
                            [columns]="columns"
                            [columnsConfig]="columnsConfig"
                            [sort]="item.sort">
                            <ng-container cdkColumnDef="title">
                                <th *cdkHeaderCellDef cdk-header-cell>Договор</th>
                                <td *cdkCellDef="let row" cdk-cell>{{ row.title }}</td>
                            </ng-container>
                            <ng-container cdkColumnDef="city">
                                <th *cdkHeaderCellDef cdk-header-cell>Город</th>
                                <td *cdkCellDef="let row" cdk-cell>{{ row.city }}</td>
                            </ng-container>
                            <ng-container cdkColumnDef="sum">
                                <th *cdkHeaderCellDef cdk-header-cell>Сумма</th>
                                <td *cdkCellDef="let row" cdk-cell>{{ row.sum }}</td>
                            </ng-container>
                            <tr *cdkHeaderRowDef="columns" cdk-header-row></tr>
                            <tr *cdkRowDef="let row; columns: columns" cdk-row></tr>
                        </table>
                    </ng-template>
                </app-story-row>
            }

            @case ('empty') {
                <app-story-row caption="Пустая таблица" [items]="empties" [itemLabel]="emptyLabel">
                    <ng-template let-item>
                        <table
                            rt-table
                            ariaLabel="Договоры"
                            [dataSource]="noRows"
                            [columns]="columns"
                            [emptyMessage]="item.message"
                            [emptyIcon]="item.icon"
                            [emptyDescription]="item.description">
                            <ng-container cdkColumnDef="title">
                                <th *cdkHeaderCellDef cdk-header-cell>Договор</th>
                                <td *cdkCellDef="let row" cdk-cell>{{ row.title }}</td>
                            </ng-container>
                            <ng-container cdkColumnDef="city">
                                <th *cdkHeaderCellDef cdk-header-cell>Город</th>
                                <td *cdkCellDef="let row" cdk-cell>{{ row.city }}</td>
                            </ng-container>
                            <ng-container cdkColumnDef="sum">
                                <th *cdkHeaderCellDef cdk-header-cell>Сумма</th>
                                <td *cdkCellDef="let row" cdk-cell>{{ row.sum }}</td>
                            </ng-container>
                            <tr *cdkHeaderRowDef="columns" cdk-header-row></tr>
                            <tr *cdkRowDef="let row; columns: columns" cdk-row></tr>
                        </table>
                    </ng-template>
                </app-story-row>
            }

            @case ('clickable') {
                <app-story-row caption="Нажимаемые строки" [items]="clickables" [itemLabel]="clickableLabel">
                    <ng-template let-value>
                        <table rt-table ariaLabel="Договоры" [dataSource]="rows" [columns]="columns" [clickable]="value">
                            <ng-container cdkColumnDef="title">
                                <th *cdkHeaderCellDef cdk-header-cell>Договор</th>
                                <td *cdkCellDef="let row" cdk-cell>{{ row.title }}</td>
                            </ng-container>
                            <ng-container cdkColumnDef="city">
                                <th *cdkHeaderCellDef cdk-header-cell>Город</th>
                                <td *cdkCellDef="let row" cdk-cell>{{ row.city }}</td>
                            </ng-container>
                            <ng-container cdkColumnDef="sum">
                                <th *cdkHeaderCellDef cdk-header-cell>Сумма</th>
                                <td *cdkCellDef="let row" cdk-cell>{{ row.sum }}</td>
                            </ng-container>
                            <tr *cdkHeaderRowDef="columns" cdk-header-row></tr>
                            <tr *cdkRowDef="let row; columns: columns" cdk-row></tr>
                        </table>
                    </ng-template>
                </app-story-row>
            }

            @case ('cards') {
                <app-story-row caption="Карточка узкого показа — видно только на узком кадре" [items]="cardCases" [itemLabel]="cardLabel">
                    <ng-template let-item>
                        @if (item.own) {
                            <table rt-table ariaLabel="Договоры" [dataSource]="rows" [columns]="columns" [columnsConfig]="columnsConfig">
                                <ng-container cdkColumnDef="title">
                                    <th *cdkHeaderCellDef cdk-header-cell>Договор</th>
                                    <td *cdkCellDef="let row" cdk-cell>{{ row.title }}</td>
                                </ng-container>
                                <ng-container cdkColumnDef="city">
                                    <th *cdkHeaderCellDef cdk-header-cell>Город</th>
                                    <td *cdkCellDef="let row" cdk-cell>{{ row.city }}</td>
                                </ng-container>
                                <ng-container cdkColumnDef="sum">
                                    <th *cdkHeaderCellDef cdk-header-cell>Сумма</th>
                                    <td *cdkCellDef="let row" cdk-cell>{{ row.sum }}</td>
                                </ng-container>
                                <ng-template rtTableCard let-row [rtTableCardRowType]="rows">
                                    <strong>{{ row.title }}</strong>
                                    <div>{{ row.city }} · {{ row.sum }}</div>
                                </ng-template>
                                <tr *cdkHeaderRowDef="columns" cdk-header-row></tr>
                                <tr *cdkRowDef="let row; columns: columns" cdk-row></tr>
                            </table>
                        } @else {
                            <table rt-table ariaLabel="Договоры" [dataSource]="rows" [columns]="columns" [columnsConfig]="columnsConfig">
                                <ng-container cdkColumnDef="title">
                                    <th *cdkHeaderCellDef cdk-header-cell>Договор</th>
                                    <td *cdkCellDef="let row" cdk-cell>{{ row.title }}</td>
                                </ng-container>
                                <ng-container cdkColumnDef="city">
                                    <th *cdkHeaderCellDef cdk-header-cell>Город</th>
                                    <td *cdkCellDef="let row" cdk-cell>{{ row.city }}</td>
                                </ng-container>
                                <ng-container cdkColumnDef="sum">
                                    <th *cdkHeaderCellDef cdk-header-cell>Сумма</th>
                                    <td *cdkCellDef="let row" cdk-cell>{{ row.sum }}</td>
                                </ng-container>
                                <tr *cdkHeaderRowDef="columns" cdk-header-row></tr>
                                <tr *cdkRowDef="let row; columns: columns" cdk-row></tr>
                            </table>
                        }
                    </ng-template>
                </app-story-row>
            }

            @case ('themes') {
                <app-story-themes caption="Таблица в обеих темах">
                    <ng-template>
                        <table rt-table ariaLabel="Договоры" [dataSource]="rows" [columns]="columns" [columnsConfig]="columnsConfig">
                            <ng-container cdkColumnDef="title">
                                <th *cdkHeaderCellDef cdk-header-cell>Договор</th>
                                <td *cdkCellDef="let row" cdk-cell>{{ row.title }}</td>
                            </ng-container>
                            <ng-container cdkColumnDef="city">
                                <th *cdkHeaderCellDef cdk-header-cell>Город</th>
                                <td *cdkCellDef="let row" cdk-cell>{{ row.city }}</td>
                            </ng-container>
                            <ng-container cdkColumnDef="sum">
                                <th *cdkHeaderCellDef cdk-header-cell>Сумма</th>
                                <td *cdkCellDef="let row" cdk-cell>{{ row.sum }}</td>
                            </ng-container>
                            <tr *cdkHeaderRowDef="columns" cdk-header-row></tr>
                            <tr *cdkRowDef="let row; columns: columns" cdk-row></tr>
                        </table>
                    </ng-template>
                </app-story-themes>
            }
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtTableComponent,
        RtTableCardDirective,

        // cdk table
        CdkCell,
        CdkCellDef,
        CdkColumnDef,
        CdkHeaderCell,
        CdkHeaderCellDef,
        CdkHeaderRow,
        CdkHeaderRowDef,
        CdkRow,
        CdkRowDef,

        // showcase
        StoryRowComponent,
        StoryThemesComponent,
    ],
})
export class TestRtTableMatrixComponent {
    public part: TTableMatrixPart = 'density';

    public readonly rows: readonly ITableRow[] = ROWS;
    public readonly noRows: readonly ITableRow[] = [];
    public readonly columns: readonly string[] = COLUMNS;
    public readonly columnsConfig: readonly IRtTable.ColumnConfig[] = COLUMNS_CONFIG;

    public readonly densities: readonly IRtTable.Density[] = ['default', 'compact'];
    public readonly clickables: readonly boolean[] = [false, true];

    /** Первая загрузка подменяет строки заглушками; догрузка оставляет показанное на месте. */
    public readonly loadingCases: readonly { name: string; loading: boolean; fetching: boolean; first: boolean }[] = [
        { name: 'данные на месте', loading: false, fetching: false, first: false },
        { name: 'первая загрузка — заглушки', loading: true, fetching: false, first: true },
        { name: 'догрузка — строки остаются', loading: false, fetching: true, first: false },
    ];

    public readonly sorts: readonly { name: string; sort: ISortModel<string> | null }[] = [
        { name: 'без порядка', sort: null },
        { name: 'по возрастанию', sort: { propertyName: 'city', sortDirection: EListSortOrder.ASC } },
        { name: 'по убыванию', sort: { propertyName: 'city', sortDirection: EListSortOrder.DESC } },
    ];

    public readonly empties: readonly { name: string; message: string; icon: 'inbox' | null; description: string | null }[] = [
        { name: 'переведённый текст', message: '', icon: 'inbox', description: null },
        { name: 'свой текст', message: EMPTY_MESSAGE, icon: 'inbox', description: null },
        { name: 'текст и пояснение', message: EMPTY_MESSAGE, icon: 'inbox', description: 'Создайте первый — он появится здесь.' },
        { name: 'без иконки', message: EMPTY_MESSAGE, icon: null, description: null },
    ];

    /** Своя карточка против авто-карточки: на широком кадре обе ячейки — обычная таблица. */
    public readonly cardCases: readonly { name: string; own: boolean }[] = [
        { name: 'авто-карточка по колонкам', own: false },
        { name: 'своя разметка карточки', own: true },
    ];

    public readonly densityLabel: (value: IRtTable.Density) => string = (value: IRtTable.Density): string =>
        value === 'compact' ? 'compact — плотные строки' : 'default';

    public readonly loadingLabel: (value: { name: string }) => string = (value: { name: string }): string => value.name;

    public readonly sortLabel: (value: { name: string }) => string = (value: { name: string }): string => value.name;

    public readonly emptyLabel: (value: { name: string }) => string = (value: { name: string }): string => value.name;

    public readonly cardLabel: (value: { name: string }) => string = (value: { name: string }): string => value.name;

    public readonly clickableLabel: (value: boolean) => string = (value: boolean): string =>
        value ? 'clickable — строка отзывается' : 'обычная';
}
