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

import { StoryPresetsComponent } from '../../../../../showcase/story-presets.component';
import { StoryRowComponent } from '../../../../../showcase/story-row.component';
import { RtTableEmptyStateDirective, RtTableErrorDirective } from '../../rt-table-states.directive';
import { RtTableComponent } from '../../rt-table.component';
import { IRtTable } from '../../rt-table.model';
import { RtTableSortHeaderComponent } from '../../sort-header/rt-table-sort-header.component';

/** Строка витрины: то, что показывают ячейки. */
interface ITableStateRow {
    readonly id: number;
    readonly title: string;
    readonly city: string;
    readonly status: string;
    readonly date: string;
}

/** Случай таблицы: строки, ошибка и какой свой шаблон стоит. */
interface ITableStateCase {
    readonly name: string;
    readonly rows: readonly ITableStateRow[];
    readonly error: string | null;
    readonly ownEmpty: boolean;
    readonly ownError: boolean;
}

const ROWS: readonly ITableStateRow[] = [
    { id: 1, title: 'Договор №2024-118', city: 'Москва', status: 'Подписан', date: '12.03.2026' },
    { id: 2, title: 'Договор №2024-119', city: 'Санкт-Петербург', status: 'На проверке', date: '14.03.2026' },
];

const CASES: readonly ITableStateCase[] = [
    { name: 'Ошибка загрузки: error не null, retry по кнопке', rows: ROWS, error: '', ownEmpty: false, ownError: false },
    { name: 'Свой шаблон пустого: ng-template[rtTableEmptyState]', rows: [], error: null, ownEmpty: true, ownError: false },
    { name: 'Свой шаблон ошибки: ng-template[rtTableError]', rows: ROWS, error: 'Нет сети', ownEmpty: false, ownError: true },
];

const COLUMNS: readonly string[] = ['title', 'city', 'status', 'date'];

const COLUMNS_CONFIG: readonly IRtTable.ColumnConfig[] = [
    { key: 'title', label: 'Договор' },
    { key: 'city', label: 'Город' },
    { key: 'status', label: 'Статус' },
    { key: 'date', label: 'Дата', sortable: true },
];

/**
 * Ошибка загрузки и свои шаблоны `rt-table` — по одобренному кадру. При ошибке шапка остаётся,
 * строки спрятаны, вместо них заглушка.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-table-states',
    templateUrl: './test-table-states.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtTableComponent,
        RtTableSortHeaderComponent,

        // directives
        RtTableEmptyStateDirective,
        RtTableErrorDirective,
        CdkColumnDef,
        CdkHeaderCellDef,
        CdkHeaderCell,
        CdkCellDef,
        CdkCell,
        CdkHeaderRowDef,
        CdkHeaderRow,
        CdkRowDef,
        CdkRow,

        // showcase
        StoryPresetsComponent,
        StoryRowComponent,
    ],
})
export class TestRtTableStatesComponent {
    public readonly cases: readonly ITableStateCase[] = CASES;
    public readonly columns: readonly string[] = COLUMNS;
    public readonly columnsConfig: readonly IRtTable.ColumnConfig[] = COLUMNS_CONFIG;

    /** Рамка своего шаблона: пунктир показывает, где кончается разметка приложения. Отступ сверху даёт ячейка таблицы. */
    public readonly slotStyle: string =
        'display: grid; gap: var(--rt-space-2); inline-size: fit-content; margin-inline: auto; padding: var(--rt-space-4); border: 1px dashed var(--rt-color-border-strong); border-radius: var(--rt-radius-md); text-align: center';

    public readonly slotHintStyle: string = 'color: var(--rt-color-text-muted); font-size: var(--rt-text-sm)';

    public readonly caseLabel: (value: ITableStateCase) => string = (value: ITableStateCase): string => value.name;
}
