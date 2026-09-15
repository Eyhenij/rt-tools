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
import { PeopleStore } from '@rt/message-bus-admin/accounts/data-access';
import {
    IPerson,
    PEOPLE_COLUMNS,
    PEOPLE_TABLE_ID,
    PERSON_CREATE_ROUTE,
    PERSON_PASSWORD_ROUTE,
    personRowHasActions,
} from '@rt/message-bus-admin/accounts/util';
import { AuthStore } from '@rt/message-bus-admin/auth/data-access';
import { AdminListScreenBase } from '@rt/message-bus-admin/common/core/feature';
import { AdminListPageComponent, AdminListToolbarRightDirective, AdminMomentPipe } from '@rt/message-bus-admin/common/core/ui';
import { adminLabel, provideAdminListHost } from '@rt/message-bus-admin/common/core/util';
import { PERSON_SORTABLE } from '@rt/message-bus-common';
import {
    IRtTable,
    RtButtonDirective,
    RtMenuItemComponent,
    RtTableComponent,
    RtTableRowActionsDirective,
    RtTableSortHeaderComponent,
} from '@rt-tools/ui-kit-v2';

const BEM_BLOCK: string = 'admin-people-list';

/**
 * Раздел людей.
 *
 * Отвечает на один вопрос: кто дотягивается до груза. Имя, роль, действует ли запись и когда ею
 * входили в последний раз — по этим четырём владелец решает, кому права оставить, а у кого снять.
 *
 * Своего у экрана трое: стор раздела, его столбцы и его поля порядка. Выборку из адреса, чтение,
 * порядок и повтор держит основа списочного экрана, а заголовок, тулбар, переключатель страниц и
 * отказ с повтором — общий вид страницы.
 *
 * Отбора здесь нет, и левый слот тулбара пуст: сузить список людей нечем — дерева у человека нет,
 * а состояний всего два, и глазами они видны в самом списке. Поэтому же экран называет пустоту
 * своей строкой: общая говорит про отбор, которого у раздела не бывает.
 *
 * Строка не нажимается: панели подробностей у человека нет — всё, что о нём известно, стоит в
 * строке. Действия над строкой два и живут её меню: новый пароль открывает панель, отключение
 * спрашивает подтверждение, потому что отключённая запись не возвращается. Заведение — действие
 * над списком целиком — стоит в правом слоте тулбара, левее общих кнопок.
 *
 * Кнопку и меню экран рисует только с правом на правку людей: приёмник закрывает ими же
 * закрытые операции, а экран решает, что показывать, по правам, которые прислал приёмник. Пока
 * права не приехали, не прячется ничего. Своя запись отключения не получает: обрыв касается и
 * того входа, которым пришли.
 */
@Component({
    selector: 'admin-people-list',
    templateUrl: './admin-people-list.component.html',
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
    providers: [provideAdminListHost((): typeof AdminPeopleListComponent => AdminPeopleListComponent)],
    host: { class: BEM_BLOCK },
})
export class AdminPeopleListComponent extends AdminListScreenBase<IPerson.Short.State, IPerson.Short.Api> {
    protected readonly title: string = adminLabel('sectionPeople');
    protected readonly hint: string = adminLabel('hintPeople');
    protected readonly columns: readonly IRtTable.ColumnConfig[] = PEOPLE_COLUMNS;
    protected readonly tableId: string = PEOPLE_TABLE_ID;
    protected readonly qaPrefix: string = 'people';
    protected readonly createLabel: string = adminLabel('personCreate');
    protected readonly passwordLabel: string = adminLabel('personPasswordMenu');
    protected readonly disableLabel: string = adminLabel('personDisable');
    protected readonly disableTitle: string = adminLabel('personDisableTitle');

    protected readonly store: PeopleStore = inject(PeopleStore);
    protected readonly sortable: readonly string[] = PERSON_SORTABLE;

    readonly #auth: AuthStore = inject(AuthStore);

    /**
     * Показывать ли правки: право то же, что закрывает правки у приёмника. Считается от сигналов
     * стора входа, а не вызовом его метода из шаблона: до ответа о вошедшем права неизвестны, и
     * не прячется ничего.
     */
    protected readonly canManage: Signal<boolean> = computed(
        (): boolean => !this.#auth.rightsKnown() || this.#auth.rights().includes('accounts:manage')
    );

    /** Имя вошедшего: его строка отключения не получает. Пусто, пока ответ о вошедшем не приехал. */
    protected readonly selfName: Signal<string> = computed((): string => this.#auth.session()?.name ?? '');

    /**
     * Есть ли у строки доступные действия. Предикат по строке, а не счёт по содержимому меню:
     * спроецированный шаблон известен только после отрисовки. Право сюда не входит — без него
     * меню не объявляется вовсе.
     */
    protected readonly hasRowActions: IRtTable.RowActionsPredicate<IPerson.Short.State> = personRowHasActions;

    /** Пустой список объясняет себя сам: отбора у раздела нет, и объяснять пустоту им нечем. */
    protected override readonly emptyMessage: Signal<string> = computed(() => adminLabel('listEmptyPeople'));

    /** Откуда берутся записи: кнопкой над списком, и человеку называется она сама. */
    protected override readonly emptyDescription: Signal<string> = computed(() => adminLabel('listEmptyPeopleFrom'));

    constructor() {
        super();
    }

    /**
     * Открыть панель заведения.
     *
     * Панель живёт тем же аутлетом, что и панели подробностей соседних разделов, и открывается
     * тем же движением: на месте признака записи у неё стоит слово заведения — записи, которую
     * она заводит, ещё нет. Выборка списка при этом остаётся в адресе нетронутой.
     */
    protected openCreate(): void {
        this.openDetails(PERSON_CREATE_ROUTE);
    }

    /** Открыть панель нового пароля записи: адрес называет имя и сторону записи. */
    protected openPassword(name: string): void {
        this.openDetails(name, PERSON_PASSWORD_ROUTE);
    }

    /** Отключить запись. Список после удачи перечитывает стор, а не экран. */
    protected disable(name: string): void {
        this.store.disable(name);
    }
}
