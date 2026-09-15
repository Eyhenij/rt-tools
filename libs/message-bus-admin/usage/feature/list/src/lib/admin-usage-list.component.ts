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
import { ChangeDetectionStrategy, Component, computed, effect, inject, Signal, untracked } from '@angular/core';
import { AdminListScreenBase } from '@rt/message-bus-admin/common/core/feature';
import {
    AdminListAboveTableDirective,
    AdminListPageComponent,
    AdminListToolbarLeftDirective,
    AdminPeriodFilterComponent,
    AdminTreeFilterComponent,
    IAdminPeriod,
} from '@rt/message-bus-admin/common/core/ui';
import { adminLabel, provideAdminListHost } from '@rt/message-bus-admin/common/core/util';
import { UsageDigestStore, UsageRowsStore } from '@rt/message-bus-admin/usage/data-access';
import { AdminUsageDigestComponent, AdminUsageQuickPeriodComponent } from '@rt/message-bus-admin/usage/ui';
import { IUsage, quickPeriod, quickPeriodOf, TQuickPeriodDays, USAGE_COLUMNS, USAGE_TABLE_ID } from '@rt/message-bus-admin/usage/util';
import { USAGE_SORTABLE } from '@rt/message-bus-common';
import { IRtTable, RtEmptyStateComponent, RtTableComponent, RtTableRowDirective, RtTableSortHeaderComponent } from '@rt-tools/ui-kit-v2';

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
 *
 * Над таблицей — сводка периода: график по дням и три списка. Читает её свой стор по дереву и
 * периоду из адреса, и только по ним: порядок и номер страницы сводку не меняют, и эффект их не
 * читает. Быстрый период — 7, 30, 90 дней от сегодняшнего — считается чистой функцией и встаёт
 * в адрес той же дорогой, что и пара дней из отбора.
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
        AdminListAboveTableDirective,
        AdminListPageComponent,
        AdminListToolbarLeftDirective,
        AdminPeriodFilterComponent,
        AdminTreeFilterComponent,
        AdminUsageDigestComponent,
        AdminUsageQuickPeriodComponent,
        RtEmptyStateComponent,
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
    protected readonly digestStore: UsageDigestStore = inject(UsageDigestStore);

    protected readonly digest: Signal<IUsage.Digest.State | null> = computed(() => this.digestStore.digest());
    protected readonly digestReading: Signal<boolean> = computed(() => this.digestStore.pending());
    protected readonly digestFailed: Signal<boolean> = computed(() => this.digestStore.fault() !== null);
    protected readonly digestFailedText: string = adminLabel('digestFailed');

    /**
     * Чем сужена сводка — одной строкой: строка одна и та же, пока не сменились дерево или
     * период, и эффект чтения сводки не просыпается на смену порядка или страницы.
     */
    readonly #digestKey: Signal<string> = computed(() => `${this.query().tree}\n${this.query().from}\n${this.query().to}`);

    /** Какой быстрый период стоит в адресе; никакой — переключатель не подсвечен. */
    protected readonly quickDays: Signal<TQuickPeriodDays | undefined> = computed(() =>
        quickPeriodOf({ from: this.query().from, to: this.query().to }, new Date())
    );

    /** Период в отборе: названный адресом, а без него — тот, что считал приёмник. */
    protected readonly shownPeriod: Signal<IAdminPeriod> = computed(() => {
        const asked: IAdminPeriod = { from: this.query().from, to: this.query().to };

        return asked.from !== '' ? asked : this.store.period();
    });

    constructor() {
        super();

        effect((): void => {
            const [tree, from, to]: string[] = this.#digestKey().split('\n');

            untracked((): void => this.digestStore.read({ tree, from, to }));
        });
    }

    /** Период из отбора — в адрес. */
    protected pickPeriod(period: IAdminPeriod): void {
        this.changePeriod(period.from, period.to);
    }

    /** Быстрый период — пара дней от сегодняшнего в адрес. */
    protected pickQuick(days: TQuickPeriodDays): void {
        const period: { from: string; to: string } = quickPeriod(days, new Date());

        this.changePeriod(period.from, period.to);
    }
}
