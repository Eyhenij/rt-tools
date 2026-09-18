import { computed, inject, input, output, ChangeDetectionStrategy, Component, InputSignal, OutputEmitterRef, Signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminTextService } from '@rt/message-bus-admin/common/core/util';
import { RtDatePickerComponent } from '@rt-tools/ui-kit-v2';

const BEM_BLOCK: string = 'admin-period-filter';

/** Период, как его отдаёт отбор: оба дня `ГГГГ-ММ-ДД` или обе пустоты. */
export interface IAdminPeriod {
    readonly from: string;
    readonly to: string;
}

/**
 * Отбор списка по периоду: два дня, оба включительно.
 *
 * Два выбора дня из кита, а не свой календарь: день в них — строка той же формы, какой его
 * читает приёмник, и переводить между отбором и адресом нечего.
 *
 * Своего состояния отбор не держит: оба дня приходят входами из адреса и уходят наверх событием
 * парой. Один выбранный день из двух наверх не уходит — приёмник на полупериод отвечает
 * отказом, а человек с одним днём ещё не сказал, чего хочет; снятый день снимает период целиком.
 */
@Component({
    selector: 'admin-period-filter',
    templateUrl: './admin-period-filter.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // angular
        FormsModule,

        // components
        RtDatePickerComponent,
    ],
    host: { class: BEM_BLOCK },
})
export class AdminPeriodFilterComponent {
    readonly #text: AdminTextService = inject(AdminTextService);

    // Подписи концов периода — производные: язык переключают над этим же экраном.
    protected readonly fromLabel: Signal<string> = computed((): string => this.#text.text('filterPeriodFrom'));
    protected readonly toLabel: Signal<string> = computed((): string => this.#text.text('filterPeriodTo'));

    /** Первый день периода. Пусто — период не назван. */
    public readonly from: InputSignal<string> = input<string>('');
    /** Последний день периода. Пусто — период не назван. */
    public readonly to: InputSignal<string> = input<string>('');

    public readonly periodChange: OutputEmitterRef<IAdminPeriod> = output<IAdminPeriod>();

    /** Первый день выбран заново; последний — тот, что стоит. Пара уходит, когда названы оба. */
    protected pickFrom(from: string | null): void {
        this.#emit(from ?? '', this.to());
    }

    /** Последний день выбран заново; первый — тот, что стоит. */
    protected pickTo(to: string | null): void {
        this.#emit(this.from(), to ?? '');
    }

    #emit(from: string, to: string): void {
        const named: boolean = from !== '' && to !== '';

        this.periodChange.emit(named ? { from, to } : { from: '', to: '' });
    }
}
