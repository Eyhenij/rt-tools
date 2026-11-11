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
import { BooleanInput } from '@angular/cdk/coercion';
import {
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    InputSignalWithTransform,
    Signal,
    ViewEncapsulation,
    computed,
    input,
} from '@angular/core';

import { IPageModel } from '@rt-tools/utils';

import { RtMenuItemComponent } from '../../../menu/rt-menu-item.component';
import { RtPaginationComponent } from '../../../pagination/rt-pagination.component';
import { RtTableComponent } from '../../../table/rt-table.component';
import { RtTableRowActionsDirective } from '../../../table/rt-table-row-actions.directive';
import { IRtTable } from '../../../table/rt-table.model';
import { RtTagComponent } from '../../../tag/rt-tag.component';
import { ITestPageRow, PAGE_ROWS } from './test-page-header-vertical.data';

/** Всего строк в подвале широкого кадра. */
const WIDE_TOTAL: number = 48;

const PAGE_SIZE: number = 20;

const COLUMNS: ReadonlyArray<IRtTable.ColumnConfig> = [
    { key: 'dates', label: 'Даты' },
    { key: 'place', label: 'Объект' },
    { key: 'guest', label: 'Гость' },
    { key: 'contact', label: 'Контакт' },
    { key: 'party', label: 'Состав' },
    { key: 'source', label: 'Источник' },
    { key: 'status', label: 'Статус' },
    { key: 'payment', label: 'Оплата' },
    { key: 'sum', label: 'Сумма' },
];

/** Страница кадров из готовых частей кита: таблица, на телефоне её карточки, и пагинация. */
@Component({
    selector: 'app-page-table',
    templateUrl: './test-page-table.component.html',
    styleUrl: './test-page-table.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: { class: 'app-page-table' },
    imports: [
        CdkCell,
        CdkCellDef,
        CdkColumnDef,
        CdkHeaderCell,
        CdkHeaderCellDef,
        CdkHeaderRow,
        CdkHeaderRowDef,
        CdkRow,
        CdkRowDef,
        RtMenuItemComponent,
        RtPaginationComponent,
        RtTableComponent,
        RtTableRowActionsDirective,
        RtTagComponent,
    ],
})
export class TestRtPageTableComponent {
    /** В карточке телефона кадры не показывают объект. */
    protected readonly columns: Signal<ReadonlyArray<IRtTable.ColumnConfig>> = computed((): ReadonlyArray<IRtTable.ColumnConfig> =>
        this.phone() ? COLUMNS.filter((column: IRtTable.ColumnConfig): boolean => column.key !== 'place') : COLUMNS
    );

    /** На телефоне кадры показывают две одинаковые карточки. */
    protected readonly rows: Signal<readonly ITestPageRow[]> = computed((): readonly ITestPageRow[] =>
        this.phone() ? [PAGE_ROWS[0], { ...PAGE_ROWS[0], id: 2 }] : PAGE_ROWS
    );

    protected readonly pageModel: Signal<IPageModel> = computed((): IPageModel => ({
        pageNumber: 1,
        pageSize: PAGE_SIZE,
        totalCount: this.phone() ? this.rows().length : WIDE_TOTAL,
    }));

    public readonly phone: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });
}
