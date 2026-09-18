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
import { AdminListPageComponent, AdminListToolbarRightDirective, AdminMomentPipe } from '@rt/message-bus-admin/common/core/ui';
import { adminColumns, AdminTextService, provideAdminListHost } from '@rt/message-bus-admin/common/core/util';
import { InvitesStore } from '@rt/message-bus-admin/invites/data-access';
import {
    IInvite,
    INVITE_CREATE_ROUTE,
    INVITES_COLUMNS,
    INVITES_TABLE_ID,
    inviteRowHasActions,
    inviteStateKey,
} from '@rt/message-bus-admin/invites/util';
import { TREE_INVITE_SORTABLE } from '@rt/message-bus-common';
import {
    IRtTable,
    RtButtonDirective,
    RtMenuItemComponent,
    RtTableComponent,
    RtTableRowActionsDirective,
    RtTableSortHeaderComponent,
} from '@rt-tools/ui-kit-v2';

const BEM_BLOCK: string = 'admin-invites-list';

/** Строка таблицы с готовыми текстами: состояние словом и вопрос перед отзывом с именем дерева. */
interface IInviteRowView extends IInvite.Short.State {
    readonly stateLabel: string;
    readonly revokeQuestion: string;
}

/**
 * Раздел приглашений.
 *
 * Приглашение — то, чем дерево заводит себя само: владелец выдаёт его кнопкой над списком, а
 * здесь видно, что с ним сталось. Кода в списке нет никогда — в хранилище лежит только его хеш,
 * и показывает код одна панель создания, один раз сразу после выдачи.
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
 * не нажимается, а действие над строкой одно — отзыв: он живёт меню строки и спрашивает
 * подтверждение, потому что отозванное приглашение не возвращается, дереву понадобится новое.
 *
 * Действие над списком целиком — выдача — стоит в правом слоте тулбара, левее обновления и
 * настройки столбцов: те есть у всех разделов и одинаковы, а эта кнопка своя.
 */
@Component({
    selector: 'admin-invites-list',
    templateUrl: './admin-invites-list.component.html',
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
        AdminListToolbarRightDirective,
        RtButtonDirective,
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
    readonly #text: AdminTextService = inject(AdminTextService);

    protected readonly title: Signal<string> = computed((): string => this.#text.text('sectionInvites'));
    protected readonly hint: Signal<string> = computed((): string => this.#text.text('hintInvites'));
    protected readonly columns: Signal<readonly IRtTable.ColumnConfig[]> = adminColumns(INVITES_COLUMNS);
    protected readonly tableId: string = INVITES_TABLE_ID;
    protected readonly qaPrefix: string = 'invites';
    protected readonly createLabel: Signal<string> = computed((): string => this.#text.text('inviteCreate'));
    protected readonly revokeLabel: Signal<string> = computed((): string => this.#text.text('inviteRevoke'));
    protected readonly revokeTitle: Signal<string> = computed((): string => this.#text.text('inviteRevokeTitle'));

    protected readonly store: InvitesStore = inject(InvitesStore);
    protected readonly sortable: readonly string[] = TREE_INVITE_SORTABLE;

    /**
     * Есть ли у строки доступные действия. Предикат по строке, а не счёт по содержимому меню:
     * спроецированный шаблон известен только после отрисовки.
     */
    protected readonly hasRowActions: IRtTable.RowActionsPredicate<IInvite.Short.State> = inviteRowHasActions;

    /** Пустой список объясняет себя сам: отбора у раздела нет, и объяснять пустоту им нечем. */
    protected override readonly emptyMessage: Signal<string> = computed((): string => this.#text.text('listEmptyInvites'));

    /**
     * Откуда берутся приглашения. У груза их приносит дерево, а здесь — команда владельца, и
     * человеку называется она сама: раздел выдачи в админке не заводит.
     */
    protected override readonly emptyDescription: Signal<string> = computed((): string => this.#text.text('listEmptyInvitesFrom'));

    /**
     * Строки со словом состояния и с вопросом перед отзывом.
     *
     * Оба текста прежде лежали готовыми полями строки: маппер брал их один раз на ответ приёмника,
     * и смена языка их не трогала. Ключ и имя дерева живут в строке, а текст по ним собирается
     * здесь — на каждой отрисовке.
     */
    protected override readonly rows: Signal<readonly IInviteRowView[]> = computed((): readonly IInviteRowView[] =>
        this.store.rows().map((row: IInvite.Short.State): IInviteRowView => ({
            ...row,
            stateLabel: this.#text.text(inviteStateKey(row.state)),
            revokeQuestion: this.#text.text('inviteRevokeQuestion', { name: row.name }),
        }))
    );

    constructor() {
        super();
    }

    /**
     * Открыть панель создания.
     *
     * Панель живёт тем же аутлетом, что и панели подробностей соседних разделов, и открывается
     * тем же движением: на месте признака записи у неё стоит слово создания — записи, которую
     * она заводит, ещё нет. Выборка списка при этом остаётся в адресе нетронутой.
     */
    protected openCreate(): void {
        this.openDetails(INVITE_CREATE_ROUTE);
    }

    /** Отозвать приглашение. Список после удачи перечитывает стор, а не экран. */
    protected revoke(name: string): void {
        this.store.revoke(name);
    }
}
