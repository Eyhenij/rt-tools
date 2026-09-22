import { ChangeDetectionStrategy, Component } from '@angular/core';

import { EFilterOperatorType, EListSortOrder, IFilterModel, ISortModel, TNullable } from '@rt-tools/utils';

import { StoryPresetsComponent } from '../../../../../showcase/story-presets.component';
import { StoryRowComponent } from '../../../../../showcase/story-row.component';
import { StoryThemesComponent } from '../../../../../showcase/story-themes.component';
import { IRtDataTable } from '../../rt-data-table.model';
import { TestRtDataTableCellComponent } from './test-data-table-cell.component';
import {
    ITestDataTableRow,
    TEST_DATA_TABLE_COLUMNS,
    TEST_DATA_TABLE_FILTER_COLUMNS,
    TEST_DATA_TABLE_ROWS,
    TEST_DATA_TABLE_SHORT_COLUMNS,
} from './test-data-table.rows';

/** Какую матрицу рисовать: у каждой оси своя история, и выбирает её этот вход. */
export type TDataTableMatrixPart = 'columns' | 'sort' | 'filters' | 'selection' | 'actions' | 'clickable' | 'presets' | 'themes';

/** Случай оси порядка: свой заголовок и своё состояние. */
interface ISortCase {
    readonly name: string;
    readonly sort: TNullable<ISortModel<'title'>>;
}

/** Случай оси отбора: показана ли строка отбора и задано ли условие. */
interface IFilterCase {
    readonly name: string;
    readonly shown: boolean;
    readonly filters: Array<IFilterModel<'title' | 'city'>>;
}

/** Случай оси выбора строк: колонка выбора, её вид и её недоступность. */
interface ISelectionCase {
    readonly name: string;
    readonly shown: boolean;
    readonly multiple: boolean;
    readonly disabled: boolean;
}

const SORT_CASES: readonly ISortCase[] = [
    { name: 'без порядка', sort: null },
    { name: 'по возрастанию', sort: { propertyName: 'title', sortDirection: EListSortOrder.ASC } },
    { name: 'по убыванию', sort: { propertyName: 'title', sortDirection: EListSortOrder.DESC } },
];

const FILTER_CASES: readonly IFilterCase[] = [
    { name: 'строки отбора нет', shown: false, filters: [] },
    { name: 'строка отбора; «Сумма» без отбора держит место', shown: true, filters: [] },
    {
        name: 'условие задано — строк столько же, сужает приложение',
        shown: true,
        filters: [{ propertyName: 'city', operatorType: EFilterOperatorType.EQUALS, value: 'Москва' }],
    },
];

const SELECTION_CASES: readonly ISelectionCase[] = [
    { name: 'колонки выбора нет', shown: false, multiple: true, disabled: false },
    { name: 'выбор многих — флажки и флажок страницы', shown: true, multiple: true, disabled: false },
    { name: 'выбор по одной — радиокнопки, флажка страницы нет', shown: true, multiple: false, disabled: false },
    { name: 'колонка выбора недоступна', shown: true, multiple: true, disabled: true },
];

const ACTION_CASES: readonly { readonly name: string; readonly withActions: boolean }[] = [
    { name: 'без действий над строкой', withActions: false },
    { name: 'меню строки в полосе действий', withActions: true },
];

const CLICKABLE_CASES: readonly { readonly name: string; readonly clickable: boolean }[] = [
    { name: 'обычная строка', clickable: false },
    { name: 'строка отзывается на нажатие', clickable: true },
];

/**
 * Матрицы состояний `rt-data-table` для витрины.
 *
 * Колонки таблица берёт не входом, а у службы настроек, поэтому каждая ячейка матрицы несёт свою
 * службу и свой ключ хранения: под общим ключом настройка одной ячейки досталась бы соседним.
 *
 * Полос прокрутки среди осей нет намеренно: их размер приходит с корня страницы, туда его ставит
 * список — у таблицы самой такой оси не существует. Её показывает семья списка.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-data-table-matrix',
    template: `
        @switch (part) {
            @case ('columns') {
                <app-story-presets caption="Все виды колонок в обоих наборах">
                    <ng-template>
                        <app-data-table-cell storageKey="story-columns" [columns]="allColumns" [rows]="rows" />
                    </ng-template>
                </app-story-presets>
            }

            @case ('sort') {
                <app-story-presets caption="Порядок строк в обоих наборах">
                    <ng-template>
                        <app-story-row [items]="sortCases" [itemLabel]="caseLabel">
                            <ng-template let-item>
                                <app-data-table-cell
                                    [storageKey]="'story-sort-' + item.name"
                                    [columns]="shortColumns"
                                    [rows]="rows"
                                    [sort]="item.sort" />
                            </ng-template>
                        </app-story-row>
                    </ng-template>
                </app-story-presets>
            }

            @case ('filters') {
                <app-story-presets caption="Строка отбора в обоих наборах">
                    <ng-template>
                        <app-story-row [items]="filterCases" [itemLabel]="caseLabel">
                            <ng-template let-item>
                                <app-data-table-cell
                                    [storageKey]="'story-filters-' + item.name"
                                    [columns]="filterColumns"
                                    [rows]="rows"
                                    [filtersShown]="item.shown"
                                    [filters]="item.filters" />
                            </ng-template>
                        </app-story-row>
                    </ng-template>
                </app-story-presets>
            }

            @case ('selection') {
                <app-story-presets caption="Колонка выбора строк в обоих наборах">
                    <ng-template>
                        <app-story-row [items]="selectionCases" [itemLabel]="caseLabel">
                            <ng-template let-item>
                                <app-data-table-cell
                                    [storageKey]="'story-selection-' + item.name"
                                    [columns]="shortColumns"
                                    [rows]="rows"
                                    [selectorsShown]="item.shown"
                                    [multiSelect]="item.multiple"
                                    [selectorsDisabled]="item.disabled" />
                            </ng-template>
                        </app-story-row>
                    </ng-template>
                </app-story-presets>
            }

            @case ('actions') {
                <app-story-presets caption="Полоса действий строки в обоих наборах">
                    <ng-template>
                        <app-story-row [items]="actionCases" [itemLabel]="caseLabel">
                            <ng-template let-item>
                                <app-data-table-cell
                                    [storageKey]="'story-actions-' + item.name"
                                    [columns]="shortColumns"
                                    [rows]="rows"
                                    [withRowActions]="item.withActions" />
                            </ng-template>
                        </app-story-row>
                    </ng-template>
                </app-story-presets>
            }

            @case ('clickable') {
                <app-story-presets caption="Нажимаемость строки в обоих наборах">
                    <ng-template>
                        <app-story-row [items]="clickableCases" [itemLabel]="caseLabel">
                            <ng-template let-item>
                                <app-data-table-cell
                                    [storageKey]="'story-clickable-' + item.name"
                                    [columns]="shortColumns"
                                    [rows]="rows"
                                    [clickable]="item.clickable" />
                            </ng-template>
                        </app-story-row>
                    </ng-template>
                </app-story-presets>
            }

            @case ('presets') {
                <app-story-presets caption="Таблица в обоих наборах">
                    <ng-template>
                        <app-data-table-cell storageKey="story-presets" [columns]="shortColumns" [rows]="rows" />
                    </ng-template>
                </app-story-presets>
            }

            @case ('themes') {
                <app-story-presets caption="Таблица в обеих темах в обоих наборах">
                    <ng-template>
                        <app-story-themes>
                            <ng-template>
                                <app-data-table-cell storageKey="story-themes" [columns]="shortColumns" [rows]="rows" />
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
        TestRtDataTableCellComponent,
    ],
})
export class TestRtDataTableMatrixComponent {
    public part: TDataTableMatrixPart = 'columns';

    public readonly rows: ITestDataTableRow[] = TEST_DATA_TABLE_ROWS;
    public readonly allColumns: Array<IRtDataTable.Column<ITestDataTableRow>> = TEST_DATA_TABLE_COLUMNS;
    public readonly shortColumns: Array<IRtDataTable.Column<ITestDataTableRow>> = TEST_DATA_TABLE_SHORT_COLUMNS;
    public readonly filterColumns: Array<IRtDataTable.Column<ITestDataTableRow>> = TEST_DATA_TABLE_FILTER_COLUMNS;

    public readonly sortCases: readonly ISortCase[] = SORT_CASES;
    public readonly filterCases: readonly IFilterCase[] = FILTER_CASES;
    public readonly selectionCases: readonly ISelectionCase[] = SELECTION_CASES;
    public readonly actionCases: readonly { readonly name: string; readonly withActions: boolean }[] = ACTION_CASES;
    public readonly clickableCases: readonly { readonly name: string; readonly clickable: boolean }[] = CLICKABLE_CASES;

    public readonly caseLabel: (value: { readonly name: string }) => string = (value: { readonly name: string }): string => value.name;
}
