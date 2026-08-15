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
import { ProposalsStore } from '@rt/message-bus-admin/proposals/data-access';
import { IProposal, PROPOSALS_COLUMNS, PROPOSALS_SORTABLE, PROPOSALS_TABLE_ID } from '@rt/message-bus-admin/proposals/util';
import { IRtTable, RtTableComponent, RtTableRowDirective, RtTableSortHeaderComponent } from '@rt-tools/ui-kit-v2';

const BEM_BLOCK: string = 'admin-proposals-list';

/**
 * Раздел предложений по слою правил.
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
    selector: 'admin-proposals-list',
    templateUrl: './admin-proposals-list.component.html',
    styleUrl: './admin-proposals-list.component.scss',
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
export class AdminProposalsListComponent extends AdminListScreenBase<IProposal.Short.State, IProposal.Short.Api> {
    protected readonly title: string = adminLabel('sectionProposals');
    protected readonly columns: readonly IRtTable.ColumnConfig[] = PROPOSALS_COLUMNS;
    protected readonly tableId: string = PROPOSALS_TABLE_ID;

    protected readonly store: ProposalsStore = inject(ProposalsStore);
    protected readonly sortable: readonly string[] = PROPOSALS_SORTABLE;

    constructor() {
        super();
    }
}
