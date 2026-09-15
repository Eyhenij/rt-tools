import { computed, Injectable, Signal, signal, WritableSignal } from '@angular/core';
import { AdminListStoreBase } from '@rt/message-bus-admin/common/core/data-access';
import { IUsage, USAGE_PATH, UsageRowMapper } from '@rt/message-bus-admin/usage/util';
import { IPage, IUsagePage } from '@rt/message-bus-common';

/** Период, за который считана страница. Пустой — страница ещё не читана. */
export interface IUsageCountedPeriod {
    readonly from: string;
    readonly to: string;
}

const NO_PERIOD: IUsageCountedPeriod = { from: '', to: '' };

/**
 * Таблица скилов.
 *
 * От общей основы отличается адресом, переводом строки и одним словом сверх: период, который
 * приёмник считал. Адрес его может не называть — тогда приёмник подставляет свои тридцать дней и
 * называет их в ответе, а экран показывает в отборе то, что считано, а не пустоту.
 *
 * Один экземпляр на приложение: список делят экран и панель сессий, и закрытая панель
 * возвращает тот же список, а не перечитывает его заново.
 */
@Injectable({ providedIn: 'root' })
export class UsageRowsStore extends AdminListStoreBase<IUsage.Row.State, IUsage.Row.Api> {
    readonly #mapper: UsageRowMapper = new UsageRowMapper();
    readonly #period: WritableSignal<IUsageCountedPeriod> = signal<IUsageCountedPeriod>(NO_PERIOD);

    protected readonly path: string = USAGE_PATH;

    /** Период, который считал приёмник, оба дня. Пуст, пока страница не читана ни разу. */
    public readonly period: Signal<IUsageCountedPeriod> = computed(() => this.#period());

    constructor() {
        super();
    }

    protected rowOf(raw: IUsage.Row.Api): IUsage.Row.State {
        return this.#mapper.mapFrom(raw);
    }

    /** Период приезжает в странице сверх строк; читается по форме, а не приведением страницы целиком. */
    protected override pageRead(page: IPage<IUsage.Row.Api>): void {
        const counted: Partial<IUsagePage> = page;

        this.#period.set({
            from: typeof counted.from === 'string' ? counted.from : '',
            to: typeof counted.to === 'string' ? counted.to : '',
        });
    }
}
