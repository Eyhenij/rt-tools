import { ChangeDetectionStrategy, Component, computed, inject, input, InputSignal, Signal } from '@angular/core';
import { AdminTextService, TAdminLabelKey, TAdminText } from '@rt/message-bus-admin/common/core/util';
import { IQualitySummaryView, qualitySummaryView } from '@rt/message-bus-admin/usage/util';
import { IQualityReport } from '@rt/message-bus-common';
import { BlockDirective, ElemDirective, ModDirective } from '@rt-tools/core';
import { RtSkeletonComponent, RtStatTileComponent, TRtKitLabelParams } from '@rt-tools/ui-kit-v2';

const BEM_BLOCK: string = 'admin-quality';

/**
 * Сводка над таблицей причин: три числа итога, строка полноты и сбои отправки.
 *
 * Ответа ещё нет: стоит скелет. При перечитывании прежние числа остаются притушенными.
 */
@Component({
    selector: 'admin-usage-quality-summary',
    templateUrl: './admin-usage-quality-summary.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // rt-tools
        BlockDirective,
        ElemDirective,
        ModDirective,
        RtSkeletonComponent,
        RtStatTileComponent,
    ],
    host: { class: BEM_BLOCK },
})
export class AdminUsageQualitySummaryComponent {
    readonly #text: AdminTextService = inject(AdminTextService);

    protected readonly placeholders: readonly number[] = [1, 2, 3];

    protected readonly view: Signal<IQualitySummaryView | null> = computed((): IQualitySummaryView | null => {
        const report: IQualityReport | null = this.report();
        const text: TAdminText = (key: TAdminLabelKey, params?: TRtKitLabelParams): string => this.#text.text(key, params);

        return report ? qualitySummaryView(report, text) : null;
    });

    public readonly report: InputSignal<IQualityReport | null> = input.required<IQualityReport | null>();
    public readonly reading: InputSignal<boolean> = input<boolean>(false);
    /** Плитки снимаются в периоде без строк, полнота от периода не зависит и остаётся. */
    public readonly tilesShown: InputSignal<boolean> = input<boolean>(true);
}
