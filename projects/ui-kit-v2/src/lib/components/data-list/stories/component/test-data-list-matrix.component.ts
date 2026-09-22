import { ChangeDetectionStrategy, Component } from '@angular/core';

import { EFilterOperatorType, IFilterModel, IPageModel } from '@rt-tools/utils';

import { StoryPresetsComponent } from '../../../../../showcase/story-presets.component';
import { StoryRowComponent } from '../../../../../showcase/story-row.component';
import { StoryThemesComponent } from '../../../../../showcase/story-themes.component';
import { IRtDataTable } from '../../../data-table/rt-data-table.model';
import {
    ITestDataTableRow,
    TEST_DATA_TABLE_FILTER_COLUMNS,
    TEST_DATA_TABLE_ROWS,
    TEST_DATA_TABLE_SHORT_COLUMNS,
} from '../../../data-table/stories/component/test-data-table.rows';
import { TestRtDataListCellComponent } from './test-data-list-cell.component';
import { TestRtDataListSettingsComponent } from './test-data-list-settings.component';

/** Какую матрицу рисовать: у каждой оси своя история, и выбирает её этот вход. */
export type TDataListMatrixPart = 'loading' | 'placeholder' | 'pagination' | 'filters' | 'selection' | 'settings' | 'presets' | 'themes';

/** Случай оси загрузки: первая загрузка и дозагрузка порознь не различаются. */
interface ILoadingCase {
    readonly name: string;
    readonly loading: boolean;
    readonly fetching: boolean;
    readonly empty: boolean;
}

/** Случай оси полосы страниц: полосы нет, пока всё помещается на самую маленькую страницу. */
interface IPageCase {
    readonly name: string;
    readonly page: IPageModel;
}

/** Случай оси заглушки: пустой список и пустой ответ на заданное условие — разные вещи. */
interface IPlaceholderCase {
    readonly name: string;
    readonly filters: Array<IFilterModel<'title' | 'city'>>;
}

const LOADING_CASES: readonly ILoadingCase[] = [
    { name: 'записи на месте', loading: false, fetching: false, empty: false },
    { name: 'первая загрузка — вместо списка крутилка', loading: true, fetching: false, empty: true },
    { name: 'дозагрузка — строки остаются под крутилкой', loading: false, fetching: true, empty: false },
];

const PAGE_CASES: readonly IPageCase[] = [
    { name: 'всё помещается — полосы страниц нет', page: { pageNumber: 1, pageSize: 10, totalCount: 3, hasPrev: false, hasNext: false } },
    { name: 'три страницы — виден весь ряд', page: { pageNumber: 1, pageSize: 10, totalCount: 27, hasPrev: false, hasNext: true } },
    {
        name: 'много страниц — разрывы вокруг нынешней',
        page: { pageNumber: 9, pageSize: 10, totalCount: 300, hasPrev: true, hasNext: true },
    },
];

const PLACEHOLDER_CASES: readonly IPlaceholderCase[] = [
    { name: 'ни строк, ни условий — заглушка', filters: [] },
    {
        name: 'условие задано, ответ пуст — таблица со строкой отбора',
        filters: [{ propertyName: 'city', operatorType: EFilterOperatorType.EQUALS, value: 'Мурманск' }],
    },
];

const SELECTION_CASES: readonly { readonly name: string; readonly selectAll: boolean; readonly multiple: boolean }[] = [
    { name: '«отметить все» в полосе действий', selectAll: true, multiple: true },
    { name: '«отметить все» скрыто — на его месте счётчик', selectAll: false, multiple: true },
    { name: 'выбор по одной — радиокнопки в строках', selectAll: false, multiple: false },
];

const PAGE_ONE: IPageModel = { pageNumber: 1, pageSize: 10, totalCount: 27, hasPrev: false, hasNext: true };

/**
 * Матрицы состояний `rt-data-list` для витрины.
 *
 * Каждая ячейка несёт свою службу настроек и свой ключ хранения: состав колонок список делит с
 * таблицей и берёт его у службы, а одна служба на весь показ дала бы всем ячейкам один состав.
 *
 * Панель настройки колонок стоит в кадре прямо, а не открывается нажатием: она живёт в наложении
 * поверх страницы, и в кадре ячейки её разметки не видно вовсе.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-data-list-matrix',
    template: `
        @switch (part) {
            @case ('loading') {
                <app-story-presets caption="Загрузка и дозагрузка в обоих наборах">
                    <ng-template>
                        <app-story-row [items]="loadingCases" [itemLabel]="caseLabel">
                            <ng-template let-item>
                                <app-data-list-cell
                                    [storageKey]="'story-list-loading-' + item.name"
                                    [columns]="columns"
                                    [rows]="item.empty ? noRows : rows"
                                    [page]="pageOne"
                                    [loading]="item.loading"
                                    [fetching]="item.fetching" />
                            </ng-template>
                        </app-story-row>
                    </ng-template>
                </app-story-presets>
            }

            @case ('placeholder') {
                <app-story-presets caption="Пустой список и пустой ответ на условие в обоих наборах">
                    <ng-template>
                        <app-story-row [items]="placeholderCases" [itemLabel]="caseLabel">
                            <ng-template let-item>
                                <app-data-list-cell
                                    [storageKey]="'story-list-placeholder-' + item.name"
                                    [columns]="filterColumns"
                                    [rows]="noRows"
                                    [page]="pageOne"
                                    [filters]="item.filters"
                                    [filtersShown]="true" />
                            </ng-template>
                        </app-story-row>
                    </ng-template>
                </app-story-presets>
            }

            @case ('pagination') {
                <app-story-presets caption="Полоса страниц в обоих наборах">
                    <ng-template>
                        <app-story-row [items]="pageCases" [itemLabel]="caseLabel">
                            <ng-template let-item>
                                <app-data-list-cell
                                    [storageKey]="'story-list-pages-' + item.name"
                                    [columns]="columns"
                                    [rows]="rows"
                                    [page]="item.page" />
                            </ng-template>
                        </app-story-row>
                    </ng-template>
                </app-story-presets>
            }

            @case ('filters') {
                <app-story-presets caption="Строка отбора и снятие отбора в обоих наборах">
                    <ng-template>
                        <app-data-list-cell
                            storageKey="story-list-filters"
                            [columns]="filterColumns"
                            [rows]="rows"
                            [page]="pageOne"
                            [filtersShown]="true"
                            [filters]="setFilters" />
                    </ng-template>
                </app-story-presets>
            }

            @case ('selection') {
                <app-story-presets caption="Выбор записей в обоих наборах">
                    <ng-template>
                        <app-story-row [items]="selectionCases" [itemLabel]="caseLabel">
                            <ng-template let-item>
                                <app-data-list-cell
                                    [storageKey]="'story-list-selection-' + item.name"
                                    [columns]="columns"
                                    [rows]="rows"
                                    [page]="pageOne"
                                    [selectAllShown]="item.selectAll"
                                    [multiSelect]="item.multiple" />
                            </ng-template>
                        </app-story-row>
                    </ng-template>
                </app-story-presets>
            }

            @case ('settings') {
                <app-story-presets caption="Панель настройки колонок в обоих наборах">
                    <ng-template>
                        <app-data-list-settings />
                    </ng-template>
                </app-story-presets>
            }

            @case ('presets') {
                <app-story-presets caption="Список в обоих наборах">
                    <ng-template>
                        <app-data-list-cell storageKey="story-list-presets" [columns]="columns" [rows]="rows" [page]="pageOne" />
                    </ng-template>
                </app-story-presets>
            }

            @case ('themes') {
                <app-story-presets caption="Список в обеих темах в обоих наборах">
                    <ng-template>
                        <app-story-themes>
                            <ng-template>
                                <app-data-list-cell storageKey="story-list-themes" [columns]="columns" [rows]="rows" [page]="pageOne" />
                            </ng-template>
                        </app-story-themes>
                    </ng-template>
                </app-story-presets>
            }
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // showcase
        StoryPresetsComponent,
        StoryRowComponent,
        StoryThemesComponent,
        TestRtDataListCellComponent,
        TestRtDataListSettingsComponent,
    ],
})
export class TestRtDataListMatrixComponent {
    public part: TDataListMatrixPart = 'loading';

    public readonly rows: ITestDataTableRow[] = TEST_DATA_TABLE_ROWS;
    public readonly noRows: ITestDataTableRow[] = [];
    public readonly columns: Array<IRtDataTable.Column<ITestDataTableRow>> = TEST_DATA_TABLE_SHORT_COLUMNS;
    public readonly filterColumns: Array<IRtDataTable.Column<ITestDataTableRow>> = TEST_DATA_TABLE_FILTER_COLUMNS;
    public readonly pageOne: IPageModel = PAGE_ONE;

    public readonly setFilters: Array<IFilterModel<'title' | 'city'>> = [
        { propertyName: 'city', operatorType: EFilterOperatorType.EQUALS, value: 'Москва' },
    ];

    public readonly loadingCases: readonly ILoadingCase[] = LOADING_CASES;
    public readonly placeholderCases: readonly IPlaceholderCase[] = PLACEHOLDER_CASES;
    public readonly pageCases: readonly IPageCase[] = PAGE_CASES;
    public readonly selectionCases: readonly { readonly name: string; readonly selectAll: boolean; readonly multiple: boolean }[] =
        SELECTION_CASES;

    public readonly caseLabel: (value: { readonly name: string }) => string = (value: { readonly name: string }): string => value.name;
}
