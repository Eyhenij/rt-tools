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
import {
    AdminListPageComponent,
    AdminListToolbarLeftDirective,
    AdminMomentPipe,
    AdminStateFilterComponent,
    AdminTreeFilterComponent,
    AdminVersionFilterComponent,
} from '@rt/message-bus-admin/common/core/ui';
import { adminLabel, provideAdminListHost } from '@rt/message-bus-admin/common/core/util';
import { ProposalsStore } from '@rt/message-bus-admin/proposals/data-access';
import { IProposal, PROPOSALS_COLUMNS, PROPOSALS_TABLE_ID } from '@rt/message-bus-admin/proposals/util';
import { IRtTable, RtTableComponent, RtTableRowDirective, RtTableSortHeaderComponent } from '@rt-tools/ui-kit-v2';
import { ECargoKind, PROPOSAL_SORTABLE } from '@rt/message-bus-common';

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
 * содержимому, и через посредника они до неё не доходят. Отборы — тем же порядком: экран кладёт
 * их в левый слот тулбара, а страница о видах отбора не знает ничего. Их трое — по дереву, по
 * состоянию записи и по версии выпуска, — и стоят они в том порядке, в каком объявлены в
 * шаблоне: от общего к частному.
 *
 * Хостом страницы экран называет себя одной строкой провайдера; отвечает на спрошенное общая
 * основа, и своего ответа он не пишет ни одного.
 */
@Component({
    selector: 'admin-proposals-list',
    templateUrl: './admin-proposals-list.component.html',
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
        AdminListToolbarLeftDirective,
        AdminStateFilterComponent,
        AdminTreeFilterComponent,
        AdminVersionFilterComponent,
        RtTableComponent,
        RtTableRowDirective,
        RtTableSortHeaderComponent,

        // pipes
        AdminMomentPipe,
    ],
    providers: [provideAdminListHost((): typeof AdminProposalsListComponent => AdminProposalsListComponent)],
    host: { class: BEM_BLOCK },
})
export class AdminProposalsListComponent extends AdminListScreenBase<IProposal.Short.State, IProposal.Short.Api> {
    protected readonly title: string = adminLabel('sectionProposals');
    protected readonly hint: string = adminLabel('hintProposals');
    protected readonly columns: readonly IRtTable.ColumnConfig[] = PROPOSALS_COLUMNS;
    protected readonly tableId: string = PROPOSALS_TABLE_ID;
    protected readonly qaPrefix: string = 'proposals';
    protected override readonly cargoKind: ECargoKind = ECargoKind.Proposal;

    protected readonly store: ProposalsStore = inject(ProposalsStore);
    protected readonly sortable: readonly string[] = PROPOSAL_SORTABLE;

    constructor() {
        super();
    }
}
