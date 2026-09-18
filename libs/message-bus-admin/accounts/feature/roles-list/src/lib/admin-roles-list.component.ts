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
import { RolesStore } from '@rt/message-bus-admin/accounts/data-access';
import { IRole, ROLE_CREATE_ROUTE, ROLES_COLUMNS, ROLES_TABLE_ID } from '@rt/message-bus-admin/accounts/util';
import { AuthStore } from '@rt/message-bus-admin/auth/data-access';
import { AdminListScreenBase } from '@rt/message-bus-admin/common/core/feature';
import { AdminListPageComponent, AdminListToolbarRightDirective } from '@rt/message-bus-admin/common/core/ui';
import { adminColumns, adminLabel, provideAdminListHost } from '@rt/message-bus-admin/common/core/util';
import { ROLE_SORTABLE } from '@rt/message-bus-common';
import { BlockDirective, ElemDirective } from '@rt-tools/core';
import {
    IRtTable,
    RtButtonDirective,
    RtMenuItemComponent,
    RtTableComponent,
    RtTableRowActionsDirective,
    RtTableSortHeaderComponent,
} from '@rt-tools/ui-kit-v2';

const BEM_BLOCK: string = 'admin-roles-list';

/**
 * Раздел ролей.
 *
 * Отвечает на один вопрос: что открывает каждая роль и сколько людей её держат. Права стоят в
 * строке словами — по ним владелец решает, какую роль дать человеку, не открывая панели.
 *
 * Своего у экрана трое: стор раздела, его столбцы и его поле порядка. Выборку из адреса, чтение,
 * порядок и повтор держит основа списочного экрана, а заголовок, тулбар, переключатель страниц и
 * отказ с повтором — общий вид страницы.
 *
 * Отбора здесь нет, и левый слот тулбара пуст: ролей у приёмника единицы. Поэтому же экран
 * называет пустоту своей строкой: общая говорит про отбор, которого у раздела не бывает.
 *
 * Строка не нажимается: панель роли открывает пункт меню «Изменить», а не строка, — у роли нет
 * подробностей сверх строки, панель её правит. Удаление спрашивает подтверждение и рисуется
 * только у роли, которую никто не держит. Заведение стоит в правом слоте тулбара.
 *
 * Весь раздел закрыт правом на роли, и до ответа о вошедшем не прячется ничего.
 */
@Component({
    selector: 'admin-roles-list',
    templateUrl: './admin-roles-list.component.html',
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

        // directives
        BlockDirective,
        ElemDirective,

        // components
        AdminListPageComponent,
        AdminListToolbarRightDirective,
        RtButtonDirective,
        RtMenuItemComponent,
        RtTableComponent,
        RtTableRowActionsDirective,
        RtTableSortHeaderComponent,
    ],
    providers: [provideAdminListHost((): typeof AdminRolesListComponent => AdminRolesListComponent)],
    host: { class: BEM_BLOCK },
})
export class AdminRolesListComponent extends AdminListScreenBase<IRole.Short.State, IRole.Short.Api> {
    protected readonly title: string = adminLabel('sectionRoles');
    protected readonly hint: string = adminLabel('hintRoles');
    protected readonly columns: Signal<readonly IRtTable.ColumnConfig[]> = adminColumns(ROLES_COLUMNS);
    protected readonly tableId: string = ROLES_TABLE_ID;
    protected readonly qaPrefix: string = 'roles';
    protected readonly createLabel: string = adminLabel('roleCreate');
    protected readonly editLabel: string = adminLabel('roleEditMenu');
    protected readonly deleteLabel: string = adminLabel('roleDelete');
    protected readonly deleteTitle: string = adminLabel('roleDeleteTitle');

    protected readonly store: RolesStore = inject(RolesStore);
    protected readonly sortable: readonly string[] = ROLE_SORTABLE;

    readonly #auth: AuthStore = inject(AuthStore);

    /**
     * Показывать ли правки: право то же, что закрывает раздел. Считается от сигналов стора входа,
     * а не вызовом его метода из шаблона: до ответа о вошедшем права неизвестны, и не прячется
     * ничего.
     */
    protected readonly canManage: Signal<boolean> = computed(
        (): boolean => !this.#auth.rightsKnown() || this.#auth.rights().includes('roles:manage')
    );

    /** Пустой список объясняет себя сам: отбора у раздела нет, и объяснять пустоту им нечем. */
    protected override readonly emptyMessage: Signal<string> = computed(() => adminLabel('listEmptyRoles'));

    /** Откуда берутся записи: кнопкой над списком, и человеку называется она сама. */
    protected override readonly emptyDescription: Signal<string> = computed(() => adminLabel('listEmptyRolesFrom'));

    constructor() {
        super();
    }

    /** Открыть панель заведения: на месте ключа роли стоит слово заведения. */
    protected openCreate(): void {
        this.openDetails(ROLE_CREATE_ROUTE);
    }

    /** Открыть панель роли по её ключу. */
    protected openEdit(key: string): void {
        this.openDetails(key);
    }

    /** Удалить роль. Список после удачи перечитывает стор, а не экран. */
    protected remove(role: IRole.Short.State): void {
        this.store.remove(role);
    }
}
