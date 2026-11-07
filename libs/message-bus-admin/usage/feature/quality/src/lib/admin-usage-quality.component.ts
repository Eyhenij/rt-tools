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
    AdminListAboveTableDirective,
    AdminListPageComponent,
    AdminListToolbarLeftDirective,
    AdminPeriodFilterComponent,
    AdminTreeFilterComponent,
    AdminVersionFilterComponent,
    IAdminPeriod,
} from '@rt/message-bus-admin/common/core/ui';
import { adminColumns, AdminTextService, provideAdminListHost } from '@rt/message-bus-admin/common/core/util';
import { QualityReportStore } from '@rt/message-bus-admin/usage/data-access';
import { AdminUsageQualitySummaryComponent, AdminUsageQuickPeriodComponent } from '@rt/message-bus-admin/usage/ui';
import {
    IQualityDriverView,
    QUALITY_COLUMNS,
    QUALITY_TABLE_ID,
    qualityDriverView,
    quickPeriod,
    quickPeriodOf,
    TQuickPeriodDays,
} from '@rt/message-bus-admin/usage/util';
import { IQualityDriverRow, IQualityReport, QUALITY_SORTABLE } from '@rt/message-bus-common';
import { IRtTable, RtTableComponent } from '@rt-tools/ui-kit-v2';

const BEM_BLOCK: string = 'admin-usage-quality';

/**
 * Раздел «Качество»: три числа итога, полнота данных и таблица причин по ресурсам.
 *
 * Ответ операции является страницей, поэтому экран стоит на общей основе: выборка живёт в адресе, отказ
 * и повтор рисует страница, скелет строк и карточки на узком экране рисует таблица.
 *
 * Ни одной строки не приходило: сводки нет, а пустая таблица называет команду подключения дерева.
 * Строк нет только в этом периоде: плиток нет, потому что нули читались бы как итог, а полнота остаётся.
 * Дерево и версия сужают и числа итога, и таблицу: цикл сверяет одно дерево с самим собой.
 */
@Component({
    selector: 'admin-usage-quality',
    templateUrl: './admin-usage-quality.component.html',
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
        AdminUsageQualitySummaryComponent,
        AdminUsageQuickPeriodComponent,
        AdminVersionFilterComponent,
        RtTableComponent,
    ],
    providers: [provideAdminListHost((): typeof AdminUsageQualityComponent => AdminUsageQualityComponent)],
    host: { class: BEM_BLOCK },
})
export class AdminUsageQualityComponent extends AdminListScreenBase<IQualityDriverRow> {
    readonly #text: AdminTextService = inject(AdminTextService);

    protected readonly title: Signal<string> = computed((): string => this.#text.text('sectionQuality'));
    protected readonly hint: Signal<string> = computed((): string => this.#text.text('hintQuality'));
    protected readonly columns: Signal<readonly IRtTable.ColumnConfig[]> = adminColumns(QUALITY_COLUMNS);
    protected readonly tableId: string = QUALITY_TABLE_ID;
    protected readonly qaPrefix: string = 'quality';

    protected readonly store: QualityReportStore = inject(QualityReportStore);
    protected readonly sortable: readonly string[] = QUALITY_SORTABLE;

    protected readonly report: Signal<IQualityReport | null> = computed(() => this.store.report());

    /** Версии берутся из самого ответа: они встретились в строках дня, а не в записях груза. */
    protected override readonly versions: Signal<readonly string[]> = computed(() => this.report()?.versions ?? []);

    protected override readonly rows: Signal<readonly IQualityDriverView[]> = computed(() => this.store.rows().map(qualityDriverView));

    /** Ни одной строки дня: называть числа итога не про что. */
    protected readonly noLines: Signal<boolean> = computed(() => this.report()?.anyLine === false);

    /** Строки где-то есть, но не в этом периоде: нули здесь не итог. */
    protected readonly noPeriod: Signal<boolean> = computed(() => !this.noLines() && this.report()?.anyInPeriod === false);

    /** Сводка стоит и на первом чтении, скелетом, и не стоит при отказе: его показывает страница. */
    protected readonly summaryShown: Signal<boolean> = computed(() => !this.noLines() && this.fault() === null);

    /** Пустота таблицы: своя у раздела без строк и у периода без строк, остальное решает основа. */
    protected readonly tableEmptyMessage: Signal<string> = computed((): string => {
        if (this.noLines()) {
            return this.#text.text('qualityNoLines');
        }

        return this.noPeriod() ? this.#text.text('qualityNoPeriod') : this.emptyMessage();
    });

    protected readonly tableEmptyFrom: Signal<string> = computed((): string => {
        if (this.noLines()) {
            return this.#text.text('qualityNoLinesFrom');
        }

        return this.noPeriod() ? this.#text.text('qualityNoPeriodFrom') : this.emptyDescription();
    });

    /** Какой быстрый период стоит в адресе. */
    protected readonly quickDays: Signal<TQuickPeriodDays | undefined> = computed(() =>
        quickPeriodOf({ from: this.query().from, to: this.query().to }, new Date())
    );

    /** Период в отборе: названный адресом, а без него тот, что посчитал приёмник. */
    protected readonly shownPeriod: Signal<IAdminPeriod> = computed(() => {
        const asked: IAdminPeriod = { from: this.query().from, to: this.query().to };

        return asked.from !== '' ? asked : { from: this.report()?.from ?? '', to: this.report()?.to ?? '' };
    });

    constructor() {
        super();
    }

    /** Период из отбора в адрес. */
    protected pickPeriod(period: IAdminPeriod): void {
        this.changePeriod(period.from, period.to);
    }

    /** Быстрый период в адрес парой дней. */
    protected pickQuick(days: TQuickPeriodDays): void {
        const period: { from: string; to: string } = quickPeriod(days, new Date());

        this.changePeriod(period.from, period.to);
    }
}
