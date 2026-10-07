import { BooleanInput } from '@angular/cdk/coercion';
import {
    booleanAttribute,
    computed,
    inject,
    input,
    linkedSignal,
    output,
    signal,
    ChangeDetectionStrategy,
    Component,
    InputSignal,
    InputSignalWithTransform,
    OutputEmitterRef,
    Signal,
    ViewEncapsulation,
    WritableSignal,
} from '@angular/core';

import { BlockDirective, ElemDirective } from '@rt-tools/core';

import { rtKitLabel, RT_KIT_LABELS, RT_KIT_LOCALE, TRtKitLabelKey, TRtKitLabelMap, TRtKitLabelParams } from '@rt-tools/ui-kit-v2/core';
import { RtButtonDirective } from '@rt-tools/ui-kit-v2/button';
import { RtCalendarComponent } from '@rt-tools/ui-kit-v2/calendar';
import { IRtCalendar } from '@rt-tools/ui-kit-v2/calendar';
import { rtDateAddMonths, rtDateCanPage, rtDateFirstDay, rtDateGridKey, rtDateNow, rtDateWeekdays } from '@rt-tools/ui-kit-v2/date-picker';
import {
    rtRangeDates,
    rtRangeDays,
    rtRangeMonth,
    rtRangeOrder,
    rtRangePlural,
    rtRangePresetCells,
    rtRangePresetOf,
} from '../rt-date-range.logic';
import { ERtDateRangePreset, IRtDateRange } from '../rt-date-range.model';

const BEM_BLOCK: string = 'rt-date-range-panel';
const MONTH_LEN: number = 7;

/** Подпись каждого быстрого варианта в наборе кита. */
const PRESET_LABELS: Readonly<Record<ERtDateRangePreset, TRtKitLabelKey>> = {
    [ERtDateRangePreset.Today]: 'uiToday',
    [ERtDateRangePreset.Yesterday]: 'uiYesterday',
    [ERtDateRangePreset.Last7]: 'uiLast7Days',
    [ERtDateRangePreset.Last30]: 'uiLast30Days',
    [ERtDateRangePreset.ThisMonth]: 'uiThisMonth',
    [ERtDateRangePreset.LastMonth]: 'uiLastMonth',
};

/** Подпись числа дней для каждой формы множественного числа. */
const DAY_LABELS: Readonly<Record<IRtDateRange.Plural, TRtKitLabelKey>> = {
    one: 'uiDaysOne',
    few: 'uiDaysFew',
    many: 'uiDaysMany',
    other: 'uiDaysOther',
};

/** Быстрый вариант, готовый к показу: подпись и выбран ли он. */
interface IPresetView {
    cell: IRtDateRange.PresetCell;
    label: string;
    chosen: boolean;
}

/**
 * Панель rt-date-range: быстрые варианты, два месяца рядом (в шторке — один) и подвал с итогом,
 * «Сбросить» и «Применить».
 *
 * Панель не пишет в форму: готовый диапазон уходит событием `picked`, просьба закрыться — `closed`.
 * Черновик живёт, пока панель открыта; поле создаёт её заново на каждое открытие. Вся арифметика
 * диапазона — в `rt-date-range.logic`.
 */
@Component({
    selector: 'rt-date-range-panel',
    templateUrl: './rt-date-range-panel.component.html',
    styleUrl: './rt-date-range-panel.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        // rt-tools
        BlockDirective,
        ElemDirective,

        // components
        RtButtonDirective,
        RtCalendarComponent,
    ],
    host: {
        class: BEM_BLOCK,
        '[class.rt-date-range-panel--sheet]': 'sheet()',
        '(keydown.escape)': 'closed.emit()',
    },
})
export class RtDateRangePanelComponent {
    /** Локаль кита: названия месяцев, дней недели, даты итога и форма числа дней идут по ней. */
    readonly #locale: Signal<string> = inject(RT_KIT_LOCALE);
    /** Минута открытия панели: от неё считается «сегодня», когда вход `now` не задан. */
    readonly #openedAt: Date = new Date();
    readonly #firstDay: Signal<number> = computed((): number => rtDateFirstDay(this.#locale()));

    protected readonly t: Signal<TRtKitLabelMap> = inject(RT_KIT_LABELS);
    protected readonly weekdays: Signal<readonly string[]> = computed((): readonly string[] => rtDateWeekdays(this.#locale()));
    protected readonly today: Signal<string> = computed((): string => rtDateNow(this.now() ?? this.#openedAt, 1).day);

    protected readonly start: WritableSignal<string | null> = linkedSignal((): string | null => this.value()?.start ?? null);
    protected readonly end: WritableSignal<string | null> = linkedSignal((): string | null => this.value()?.end ?? null);
    /** День под указателем: пока выбрано только начало, до него рисуется будущий диапазон. */
    protected readonly hover: WritableSignal<string | null> = signal<string | null>(null);
    protected readonly activeKey: WritableSignal<string | null> = signal<string | null>(null);

    protected readonly shownMonth: WritableSignal<string> = linkedSignal((): string =>
        (this.value()?.start ?? this.today()).slice(0, MONTH_LEN)
    );

    /** Готовый черновик: оба края выбраны. */
    protected readonly draft: Signal<IRtDateRange.Value | null> = computed((): IRtDateRange.Value | null => {
        const start: string | null = this.start();
        const end: string | null = this.end();
        return start === null || end === null ? null : { start, end };
    });

    protected readonly months: Signal<IRtCalendar.Month[]> = computed((): IRtCalendar.Month[] => {
        const ctx: IRtDateRange.MonthContext = {
            locale: this.#locale(),
            today: this.today(),
            start: this.start(),
            end: this.end(),
            hover: this.hover(),
            min: this.min(),
            max: this.max(),
        };
        return this.#shown().map((month: string): IRtCalendar.Month => rtRangeMonth(month, ctx));
    });
    protected readonly canPrev: Signal<boolean> = computed((): boolean => rtDateCanPage(this.shownMonth(), -1, this.min(), this.max()));
    /** Вперёд листается, пока последний показанный месяц не упёрся в границу. */
    protected readonly canNext: Signal<boolean> = computed((): boolean => rtDateCanPage(this.#lastShown(), 1, this.min(), this.max()));

    protected readonly presets: Signal<IPresetView[]> = computed((): IPresetView[] => {
        const labels: TRtKitLabelMap = this.t();
        const chosen: ERtDateRangePreset | null = rtRangePresetOf(this.draft(), this.today());
        return rtRangePresetCells(this.today(), this.min(), this.max()).map((cell: IRtDateRange.PresetCell): IPresetView => ({
            cell,
            label: labels[PRESET_LABELS[cell.preset]],
            chosen: cell.preset === chosen,
        }));
    });

    /** Число дней черновика подписью кита по форме множественного числа локали. */
    protected readonly daysText: Signal<string> = rtKitLabel(
        computed((): TRtKitLabelKey | '' => {
            const draft: IRtDateRange.Value | null = this.draft();
            return draft === null ? '' : DAY_LABELS[rtRangePlural(rtRangeDays(draft), this.#locale())];
        }),
        computed((): TRtKitLabelParams => {
            const draft: IRtDateRange.Value | null = this.draft();
            return { count: draft === null ? 0 : rtRangeDays(draft) };
        })
    );

    /** Итог подвала: даты и число дней, в шторке — только число; с одним началом — просьба о конце. */
    protected readonly summary: Signal<string> = computed((): string => {
        const draft: IRtDateRange.Value | null = this.draft();
        if (draft === null) {
            return this.start() === null ? this.t().uiPickStartDate : this.t().uiPickEndDate;
        }
        return this.sheet() ? this.daysText() : `${rtRangeDates(draft, this.#locale())} · ${this.daysText()}`;
    });

    /** Значение поля: с него начинается черновик. */
    public readonly value: InputSignal<IRtDateRange.Value | null> = input<IRtDateRange.Value | null>(null);
    public readonly min: InputSignal<string | null> = input<string | null>(null);
    public readonly max: InputSignal<string | null> = input<string | null>(null);
    /** Раскладка нижней шторки: один месяц, варианты строкой сверху, дни под палец. */
    public readonly sheet: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });
    /**
     * Момент, от которого считаются «сегодня» и быстрые варианты. Поле его не задаёт — панель
     * читает часы сама; задаёт витрина, чтобы кадр не менялся день ото дня.
     */
    public readonly now: InputSignal<Date | null> = input<Date | null>(null);

    /** Готовый диапазон: панель просит поле его записать. */
    public readonly picked: OutputEmitterRef<IRtDateRange.Value> = output<IRtDateRange.Value>();
    /** Панель просит закрыть себя. */
    public readonly closed: OutputEmitterRef<void> = output<void>();

    /** Первый выбор — начало, второй — конец; выбор после готового диапазона начинает новый. */
    protected pickDay(day: IRtCalendar.Day): void {
        this.activeKey.set(day.key);
        const start: string | null = this.start();
        if (start === null || this.end() !== null) {
            this.start.set(day.key);
            this.end.set(null);
            return;
        }
        const range: IRtDateRange.Value = rtRangeOrder(start, day.key);
        this.start.set(range.start);
        this.end.set(range.end);
        this.hover.set(null);
    }

    protected onHover(day: IRtCalendar.Day | null): void {
        this.hover.set(day?.key ?? null);
    }

    protected pickPreset(cell: IRtDateRange.PresetCell): void {
        if (cell.disabled) {
            return;
        }
        this.start.set(cell.range.start);
        this.end.set(cell.range.end);
        this.hover.set(null);
        this.shownMonth.set(cell.range.start.slice(0, MONTH_LEN));
    }

    /** Клавиша сетки: фокус переходит на день, и месяцы листаются, если он ушёл за показанные. */
    protected onGridKey(event: IRtCalendar.GridKey): void {
        const next: string | null = rtDateGridKey(event.key, event.day.key, this.#firstDay(), this.min(), this.max());
        if (next === null) {
            return;
        }
        const month: string = next.slice(0, MONTH_LEN);
        if (!this.#shown().includes(month)) {
            const before: boolean = Number(month.replace('-', '')) < Number(this.shownMonth().replace('-', ''));
            this.shownMonth.set(before ? month : rtDateAddMonths(month, 1 - this.#shown().length));
        }
        this.activeKey.set(next);
        this.hover.set(next);
    }

    protected page(delta: number): void {
        this.shownMonth.set(rtDateAddMonths(this.shownMonth(), delta));
    }

    protected reset(): void {
        this.start.set(null);
        this.end.set(null);
        this.hover.set(null);
    }

    /** «Применить»: готовый черновик уходит значением, панель закрывается. */
    protected apply(): void {
        const draft: IRtDateRange.Value | null = this.draft();
        if (draft !== null) {
            this.picked.emit(draft);
            this.closed.emit();
        }
    }

    /** Показанные месяцы `YYYY-MM`: два рядом, в шторке — один. */
    #shown(): string[] {
        const first: string = this.shownMonth();
        return this.sheet() ? [first] : [first, rtDateAddMonths(first, 1)];
    }

    #lastShown(): string {
        const shown: string[] = this.#shown();
        return shown[shown.length - 1];
    }
}
