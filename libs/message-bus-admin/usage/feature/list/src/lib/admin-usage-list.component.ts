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
    AdminPeriodFilterComponent,
    AdminTreeFilterComponent,
    IAdminPeriod,
} from '@rt/message-bus-admin/common/core/ui';
import { adminLabel, provideAdminListHost } from '@rt/message-bus-admin/common/core/util';
import { UsageRowsStore } from '@rt/message-bus-admin/usage/data-access';
import { IUsage, USAGE_COLUMNS, USAGE_TABLE_ID } from '@rt/message-bus-admin/usage/util';
import { USAGE_SORTABLE } from '@rt/message-bus-common';
import { IRtTable, RtTableComponent, RtTableRowDirective, RtTableSortHeaderComponent } from '@rt-tools/ui-kit-v2';

import { SkillKindPipe } from './skill-kind.pipe';

const BEM_BLOCK: string = 'admin-usage-list';

/**
 * Раздел использования правил: строка на скил за период — род, загрузки, сессии, отказы гейта.
 *
 * Панель сессий скила открывается нажатием на строку и живёт своим маршрутом в аутлете `ro` —
 * объявленном у оболочки, а не здесь: рисует её правая шторка каркаса.
 *
 * Своего у экрана четверо: стор раздела, его столбцы, его поля порядка и отбор по периоду. Всё
 * остальное — общее: выборку из адреса, чтение, порядок, отбор, пустоту и уход в панель держит
 * основа списочного экрана, а заголовок, тулбар, переключатель страниц и отказ с повтором —
 * общий вид страницы.
 *
 * Период в отборе показан тот, который считан: адрес его может не называть, и тогда приёмник
 * подставляет свои тридцать дней и называет их в ответе. Показанная пустота на их месте читалась
 * бы как «за всё время».
 */
@Component({
    selector: 'admin-usage-list',
    templateUrl: './admin-usage-list.component.html',
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
        AdminPeriodFilterComponent,
        AdminTreeFilterComponent,
        RtTableComponent,
        RtTableRowDirective,
        RtTableSortHeaderComponent,

        // pipes
        SkillKindPipe,
    ],
    providers: [provideAdminListHost((): typeof AdminUsageListComponent => AdminUsageListComponent)],
    host: { class: BEM_BLOCK },
})
export class AdminUsageListComponent extends AdminListScreenBase<IUsage.Row.State, IUsage.Row.Api> {
    protected readonly title: string = adminLabel('sectionUsage');
    protected readonly hint: string = adminLabel('hintUsage');
    protected readonly columns: readonly IRtTable.ColumnConfig[] = USAGE_COLUMNS;
    protected readonly tableId: string = USAGE_TABLE_ID;
    protected readonly qaPrefix: string = 'usage';

    protected readonly store: UsageRowsStore = inject(UsageRowsStore);
    protected readonly sortable: readonly string[] = USAGE_SORTABLE;

    /** Период в отборе: названный адресом, а без него — тот, что считал приёмник. */
    protected readonly shownPeriod: Signal<IAdminPeriod> = computed(() => {
        const asked: IAdminPeriod = { from: this.query().from, to: this.query().to };

        return asked.from !== '' ? asked : this.store.period();
    });

    constructor() {
        super();
    }

    /** Период из отбора — в адрес. */
    protected pickPeriod(period: IAdminPeriod): void {
        this.changePeriod(period.from, period.to);
    }
}
