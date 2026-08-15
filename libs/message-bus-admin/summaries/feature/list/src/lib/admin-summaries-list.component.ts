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
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AdminListScreenBase } from '@rt/message-bus-admin/common/core/feature';
import { AdminListPageComponent, AdminMomentPipe } from '@rt/message-bus-admin/common/core/ui';
import { adminLabel } from '@rt/message-bus-admin/common/core/util';
import { MonthRecordsStore } from '@rt/message-bus-admin/summaries/data-access';
import { IMonthRecord, SUMMARIES_COLUMNS, SUMMARIES_SORTABLE, SUMMARIES_TABLE_ID } from '@rt/message-bus-admin/summaries/util';
import { IRtTable, RtTableComponent, RtTableRowDirective, RtTableSortHeaderComponent } from '@rt-tools/ui-kit-v2';

const BEM_BLOCK: string = 'admin-summaries-list';

/**
 * Раздел сводок деревьев.
 *
 * Панель подробностей открывается нажатием на строку и живёт своим маршрутом в аутлете `ro` —
 * объявленном у оболочки, а не здесь: рисует её правая шторка каркаса.
 *
 * Своего у экрана трое: стор раздела, его столбцы и его поля порядка. Всё остальное —
 * общее: выборку из адреса, чтение, порядок, отбор, пустоту и уход в панель держит основа
 * списочного экрана, а заголовок, тулбар, переключатель страниц и отказ с повтором — общий вид
 * страницы.
 *
 * Таблица объявлена здесь, а не внутри вида: столбцы она собирает собственным запросом по
 * содержимому, и через посредника они до неё не доходят.
 */
@Component({
    selector: 'admin-summaries-list',
    templateUrl: './admin-summaries-list.component.html',
    styleUrl: './admin-summaries-list.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // angular
        CdkCell,
        CdkCellDef,
        CdkColumnDef,
        CdkHeaderCell,
        CdkHeaderCellDef,
        CdkHeaderRow,
        CdkHeaderRowDef,
        CdkRow,
        CdkRowDef,

        // components
        AdminListPageComponent,
        RtTableComponent,
        RtTableRowDirective,
        RtTableSortHeaderComponent,

        // pipes
        AdminMomentPipe,
    ],
    host: { class: BEM_BLOCK },
})
export class AdminSummariesListComponent extends AdminListScreenBase<IMonthRecord.Short.State, IMonthRecord.Short.Api> {
    protected readonly title: string = adminLabel('sectionSummaries');
    protected readonly columns: readonly IRtTable.ColumnConfig[] = SUMMARIES_COLUMNS;
    protected readonly tableId: string = SUMMARIES_TABLE_ID;

    protected readonly store: MonthRecordsStore = inject(MonthRecordsStore);
    protected readonly sortable: readonly string[] = SUMMARIES_SORTABLE;

    constructor() {
        super();
    }
}
