import { ChangeDetectionStrategy, Component, computed, inject, input, InputSignal, output, OutputEmitterRef, Signal } from '@angular/core';
import { AdminTextService, TAdminLabelKey } from '@rt/message-bus-admin/common/core/util';
import { QUICK_PERIOD_DAYS, TQuickPeriodDays } from '@rt/message-bus-admin/usage/util';
import { IRtToggleButtonGroup, RtToggleButtonGroupComponent } from '@rt-tools/ui-kit-v2';

const BEM_BLOCK: string = 'admin-quick-period';

/** Ключ подписи по числу дней: подписи лежат в словаре, а не собираются из числа. */
const LABEL_KEYS: Readonly<Record<TQuickPeriodDays, TAdminLabelKey>> = Object.freeze({
    7: 'quickPeriod7',
    30: 'quickPeriod30',
    90: 'quickPeriod90',
});

/**
 * Быстрый выбор периода: последние 7, 30 или 90 дней одним нажатием.
 *
 * Переключатель кита, а не свои кнопки. Своего состояния нет: какой период стоит в адресе,
 * говорит вход, а нажатие уходит наверх числом дней — пару дней от сегодняшнего считает экран
 * чистой функцией, и момент «сегодня» здесь не читается.
 */
@Component({
    selector: 'admin-usage-quick-period',
    templateUrl: './admin-usage-quick-period.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtToggleButtonGroupComponent],
    host: { class: BEM_BLOCK },
})
export class AdminUsageQuickPeriodComponent {
    readonly #text: AdminTextService = inject(AdminTextService);

    protected readonly ariaLabel: Signal<string> = computed((): string => this.#text.text('quickPeriodAria'));
    protected readonly options: Signal<readonly IRtToggleButtonGroup.Option<TQuickPeriodDays>[]> = computed(
        (): readonly IRtToggleButtonGroup.Option<TQuickPeriodDays>[] =>
            QUICK_PERIOD_DAYS.map((days: TQuickPeriodDays): IRtToggleButtonGroup.Option<TQuickPeriodDays> => ({
                value: days,
                label: this.#text.text(LABEL_KEYS[days]),
            }))
    );

    /** Период из адреса, если он совпал с одним из быстрых; иначе ни один не подсвечен. */
    public readonly days: InputSignal<TQuickPeriodDays | undefined> = input<TQuickPeriodDays | undefined>(undefined);

    public readonly daysChange: OutputEmitterRef<TQuickPeriodDays> = output<TQuickPeriodDays>();
}
