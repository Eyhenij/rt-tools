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
import { IPerson, PEOPLE_COLUMNS, PEOPLE_TABLE_ID } from '@rt/message-bus-admin/accounts/util';
import { AdminListScreenBase } from '@rt/message-bus-admin/common/core/feature';
import { AdminListPageComponent, AdminMomentPipe } from '@rt/message-bus-admin/common/core/ui';
import { adminLabel, provideAdminListHost } from '@rt/message-bus-admin/common/core/util';
import { PERSON_SORTABLE } from '@rt/message-bus-common';
import { IRtTable, RtTableComponent, RtTableSortHeaderComponent } from '@rt-tools/ui-kit-v2';

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
 * Отбора здесь нет, и оба слота тулбара пусты: сузить список людей нечем — дерева у человека нет,
 * а состояний всего два, и глазами они видны в самом списке. Поэтому же экран называет пустоту
 * своей строкой: общая говорит про отбор, которого у раздела не бывает.
 *
 * Ни строка, ни меню строки не нажимаются, и это не упущение: панели подробностей у человека нет —
 * всё, что о нём известно, стоит в строке, — а заводит, отключает и меняет пароль команда строки
 * запуска на узле приёмника. Из веба такого действия нет вовсе.
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
        RtTableComponent,
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

    protected readonly store: PeopleStore = inject(PeopleStore);
    protected readonly sortable: readonly string[] = PERSON_SORTABLE;

    /** Пустой список объясняет себя сам: отбора у раздела нет, и объяснять пустоту им нечем. */
    protected override readonly emptyMessage: Signal<string> = computed(() => adminLabel('listEmptyPeople'));

    /**
     * Откуда берутся записи. Не из веба: их заводит команда строки запуска на узле приёмника, и
     * человеку называется она сама — иначе он ищет в админке кнопку, которой нет.
     */
    protected override readonly emptyDescription: Signal<string> = computed(() => adminLabel('listEmptyPeopleFrom'));

    constructor() {
        super();
    }
}
