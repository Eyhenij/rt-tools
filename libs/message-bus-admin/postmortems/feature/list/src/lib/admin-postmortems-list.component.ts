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
import { ChangeDetectionStrategy, Component, computed, inject, Signal } from '@angular/core';
import { AdminListScreenBase } from '@rt/message-bus-admin/common/core/feature';
import {
    AdminListPageComponent,
    AdminListToolbarLeftDirective,
    AdminMomentPipe,
    AdminStateFilterComponent,
    AdminTreeFilterComponent,
    AdminVersionFilterComponent,
} from '@rt/message-bus-admin/common/core/ui';
import {
    adminColumns,
    adminStatedRows,
    AdminTextService,
    IAdminStateWord,
    provideAdminListHost,
} from '@rt/message-bus-admin/common/core/util';
import { PostmortemsStore } from '@rt/message-bus-admin/postmortems/data-access';
import { IPostmortem, POSTMORTEMS_COLUMNS, POSTMORTEMS_TABLE_ID } from '@rt/message-bus-admin/postmortems/util';
import { IRtTable, RtTableComponent, RtTableRowDirective, RtTableSortHeaderComponent } from '@rt-tools/ui-kit-v2';
import { ECargoKind, POSTMORTEM_SORTABLE } from '@rt/message-bus-common';

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
 * содержимому, и через посредника они до неё не доходят. Отборы — тем же порядком: экран кладёт
 * их в левый слот тулбара, а страница о видах отбора не знает ничего. Их трое — по дереву, по
 * состоянию записи и по версии выпуска, — и стоят они в том порядке, в каком объявлены в
 * шаблоне: от общего к частному.
 *
 * Хостом страницы экран называет себя одной строкой провайдера; отвечает на спрошенное общая
 * основа, и своего ответа он не пишет ни одного.
 */
@Component({
    selector: 'admin-postmortems-list',
    templateUrl: './admin-postmortems-list.component.html',
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
    providers: [provideAdminListHost((): typeof AdminPostmortemsListComponent => AdminPostmortemsListComponent)],
    host: { class: BEM_BLOCK },
})
export class AdminPostmortemsListComponent extends AdminListScreenBase<IPostmortem.Short.State, IPostmortem.Short.Api> {
    readonly #text: AdminTextService = inject(AdminTextService);

    protected readonly title: Signal<string> = computed((): string => this.#text.text('sectionPostmortems'));
    protected readonly hint: Signal<string> = computed((): string => this.#text.text('hintPostmortems'));
    protected readonly columns: Signal<readonly IRtTable.ColumnConfig[]> = adminColumns(POSTMORTEMS_COLUMNS);
    protected readonly tableId: string = POSTMORTEMS_TABLE_ID;
    protected readonly qaPrefix: string = 'postmortems';
    /** Приписка к состоянию: запись, закрытую не своим деревом, отправитель иначе читает как свою отметку. */
    protected readonly closedByPublisherLabel: Signal<string> = computed((): string => this.#text.text('closedByPublisher'));
    protected override readonly cargoKind: ECargoKind = ECargoKind.Postmortem;

    protected readonly store: PostmortemsStore = inject(PostmortemsStore);
    protected readonly sortable: readonly string[] = POSTMORTEM_SORTABLE;

    /** Строки со словом состояния: маппер кладёт само состояние, а слово о нём берётся из словаря. */
    protected override readonly rows: Signal<readonly (IPostmortem.Short.State & IAdminStateWord)[]> = adminStatedRows(
        computed((): readonly IPostmortem.Short.State[] => this.store.rows())
    );

    constructor() {
        super();
    }
}
