import { computed, Injectable, Signal, signal, WritableSignal } from '@angular/core';
import { AdminListStoreBase } from '@rt/message-bus-admin/common/core/data-access';
import { isQualityReport, QUALITY_PATH } from '@rt/message-bus-admin/usage/util';
import { IPage, IQualityDriverRow, IQualityReport } from '@rt/message-bus-common';

/**
 * Таблица причин раздела «Качество» и всё, что стоит над ней.
 *
 * Ответ операции сам является страницей: основа читает его как любой список, а три числа, полнота и
 * версии приезжают сверх строк. При отказе прежние числа не показываются, как и прежние строки.
 */
@Injectable({ providedIn: 'root' })
export class QualityReportStore extends AdminListStoreBase<IQualityDriverRow> {
    readonly #report: WritableSignal<IQualityReport | null> = signal<IQualityReport | null>(null);

    protected readonly path: string = QUALITY_PATH;

    /** Последний прочитанный ответ. Пусто: ещё не читали или чтение отказало. */
    public readonly report: Signal<IQualityReport | null> = computed(() => (this.fault() === null ? this.#report() : null));

    constructor() {
        super();
    }

    protected rowOf(raw: IQualityDriverRow): IQualityDriverRow {
        return raw;
    }

    protected override pageRead(page: IPage<IQualityDriverRow>): void {
        if (isQualityReport(page)) {
            this.#report.set(page);
        }
    }
}
