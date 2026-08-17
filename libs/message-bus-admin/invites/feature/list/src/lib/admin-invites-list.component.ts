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
import { AdminListPageComponent, AdminMomentPipe } from '@rt/message-bus-admin/common/core/ui';
import { adminLabel, provideAdminListHost } from '@rt/message-bus-admin/common/core/util';
import { InvitesStore } from '@rt/message-bus-admin/invites/data-access';
import { IInvite, INVITES_COLUMNS, INVITES_TABLE_ID, inviteRowHasActions } from '@rt/message-bus-admin/invites/util';
import { TREE_INVITE_SORTABLE } from '@rt/message-bus-common';
import {
    IRtTable,
    RtMenuItemComponent,
    RtTableComponent,
    RtTableRowActionsDirective,
    RtTableSortHeaderComponent,
} from '@rt-tools/ui-kit-v2';

const BEM_BLOCK: string = 'admin-invites-list';

/**
 * Раздел приглашений.
 *
 * Приглашение — то, чем дерево заводит себя само: владелец выдаёт его командой строки запуска, а
 * здесь видно, что с ним сталось. Самого кода на экране нет никогда — в хранилище лежит только
 * его хеш, и показать код второй раз неоткуда.
 *
 * Своего у экрана трое: стор раздела, его столбцы и его поля порядка. Выборку из адреса, чтение,
 * порядок и повтор держит основа списочного экрана, а заголовок, тулбар, переключатель страниц и
 * отказ с повтором — общий вид страницы.
 *
 * Отбора по дереву здесь нет, и левый слот тулбара пуст: приглашение ждёт дерева, которого ещё
 * нет, и сузить им можно было бы одни погашенные. Поэтому же экран называет пустоту своей
 * строкой — общая говорит про отбор, которого у раздела не бывает.
 *
 * Панели подробностей у приглашения нет: всё, что о нём известно, стоит в строке. Строка поэтому
 * не нажимается, а единственное действие — отзыв — живёт меню строки и спрашивает подтверждение:
 * отозванное приглашение не возвращается, дереву понадобится новое.
 */
@Component({
    selector: 'admin-invites-list',
    templateUrl: './admin-invites-list.component.html',
    styleUrl: './admin-invites-list.component.scss',
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
        RtMenuItemComponent,
        RtTableComponent,
        RtTableRowActionsDirective,
        RtTableSortHeaderComponent,

        // pipes
        AdminMomentPipe,
    ],
    providers: [provideAdminListHost((): typeof AdminInvitesListComponent => AdminInvitesListComponent)],
    host: { class: BEM_BLOCK },
})
export class AdminInvitesListComponent extends AdminListScreenBase<IInvite.Short.State, IInvite.Short.Api> {
    protected readonly title: string = adminLabel('sectionInvites');
    protected readonly hint: string = adminLabel('hintInvites');
    protected readonly columns: readonly IRtTable.ColumnConfig[] = INVITES_COLUMNS;
    protected readonly tableId: string = INVITES_TABLE_ID;
    protected readonly qaPrefix: string = 'invites';
    protected readonly revokeLabel: string = adminLabel('inviteRevoke');
    protected readonly revokeTitle: string = adminLabel('inviteRevokeTitle');

    protected readonly store: InvitesStore = inject(InvitesStore);
    protected readonly sortable: readonly string[] = TREE_INVITE_SORTABLE;

    /**
     * Есть ли у строки доступные действия. Предикат по строке, а не счёт по содержимому меню:
     * спроецированный шаблон известен только после отрисовки.
     */
    protected readonly hasRowActions: IRtTable.RowActionsPredicate<IInvite.Short.State> = inviteRowHasActions;

    /** Пустой список объясняет себя сам: отбора у раздела нет, и объяснять пустоту им нечем. */
    protected override readonly emptyMessage: Signal<string> = computed(() => adminLabel('listEmptyInvites'));

    constructor() {
        super();
    }

    /** Отозвать приглашение. Список после удачи перечитывает стор, а не экран. */
    protected revoke(name: string): void {
        this.store.revoke(name);
    }
}
