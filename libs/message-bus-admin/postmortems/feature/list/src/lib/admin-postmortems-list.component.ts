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
    AdminTreeFilterComponent,
} from '@rt/message-bus-admin/common/core/ui';
import { adminLabel, provideAdminListHost } from '@rt/message-bus-admin/common/core/util';
import { PostmortemsStore } from '@rt/message-bus-admin/postmortems/data-access';
import { IPostmortem, POSTMORTEMS_COLUMNS, POSTMORTEMS_SORTABLE, POSTMORTEMS_TABLE_ID } from '@rt/message-bus-admin/postmortems/util';
import { IRtTable, RtTableComponent, RtTableRowDirective, RtTableSortHeaderComponent } from '@rt-tools/ui-kit-v2';

const BEM_BLOCK: string = 'admin-postmortems-list';

/**
 * Раздел разборов происшествий.
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
 * содержимому, и через посредника они до неё не доходят. Отбор по дереву — тем же порядком:
 * экран кладёт его в левый слот тулбара, а страница о видах отбора не знает ничего.
 *
 * Хостом страницы экран называет себя одной строкой провайдера; отвечает на спрошенное общая
 * основа, и своего ответа он не пишет ни одного.
 */
@Component({
    selector: 'admin-postmortems-list',
    templateUrl: './admin-postmortems-list.component.html',
    styleUrl: './admin-postmortems-list.component.scss',
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
        AdminTreeFilterComponent,
        RtTableComponent,
        RtTableRowDirective,
        RtTableSortHeaderComponent,

        // pipes
        AdminMomentPipe,
    ],
    providers: [provideAdminListHost((): typeof AdminPostmortemsListComponent => AdminPostmortemsListComponent)],
    host: { class: BEM_BLOCK },
})
export class AdminPostmortemsListComponent extends AdminListScreenBase<IPostmortem.Short.State, IPostmortem.Short.Api> {
    protected readonly title: string = adminLabel('sectionPostmortems');
    protected readonly hint: string = adminLabel('hintPostmortems');
    protected readonly columns: readonly IRtTable.ColumnConfig[] = POSTMORTEMS_COLUMNS;
    protected readonly tableId: string = POSTMORTEMS_TABLE_ID;

    protected readonly store: PostmortemsStore = inject(PostmortemsStore);
    protected readonly sortable: readonly string[] = POSTMORTEMS_SORTABLE;

    constructor() {
        super();
    }
}
