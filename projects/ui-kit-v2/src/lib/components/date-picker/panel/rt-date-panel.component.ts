import { BooleanInput, NumberInput } from '@angular/cdk/coercion';
import {
    afterRenderEffect,
    booleanAttribute,
    computed,
    inject,
    input,
    linkedSignal,
    numberAttribute,
    output,
    signal,
    viewChildren,
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    InputSignal,
    InputSignalWithTransform,
    OutputEmitterRef,
    Signal,
    ViewEncapsulation,
    WritableSignal,
} from '@angular/core';

import { BlockDirective, ElemDirective } from '@rt-tools/core';

import { RT_KIT_LABELS, RT_KIT_LOCALE, TRtKitLabelMap } from '../../../i18n';
import { RtButtonDirective } from '../../button/rt-button.directive';
import { RtCalendarComponent } from '../../calendar/rt-calendar.component';
import { IRtCalendar } from '../../calendar/rt-calendar.model';
import { RtIconButtonComponent } from '../../icon-button/rt-icon-button.component';
import { RtToggleButtonGroupComponent } from '../../toggle-button-group/rt-toggle-button-group.component';
import { IRtToggleButtonGroup } from '../../toggle-button-group/rt-toggle-button-group.model';
import {
    rtDateAddMonths,
    rtDateCanPage,
    rtDateFirstDay,
    rtDateGridKey,
    rtDateInBounds,
    rtDateMonth,
    rtDateMonths,
    rtDateNow,
    rtDateSplit,
    rtDateTime,
    rtDateTimeColumns,
    rtDateWeekdays,
    rtDateWrite,
} from '../rt-date-panel.logic';
import { IRtDatePicker } from '../rt-date-picker.model';

const BEM_BLOCK: string = 'rt-date-panel';
const MONTH_LEN: number = 7;
const YEAR_LEN: number = 4;

type TView = 'days' | 'months';
type TTab = 'date' | 'time';

/**
 * Панель rt-date-picker: месяц с листанием и выбором месяца и года, колонки часов и минут,
 * подвал с «Сегодня», «Сейчас», «Готово» или «Применить» — по типу значения.
 *
 * Панель не пишет в форму: готовое значение уходит событием `picked`, просьба закрыться —
 * `closed`. Черновик живёт, пока панель открыта; поле создаёт её заново на каждое открытие.
 * Вся арифметика дат — в `rt-date-panel.logic`.
 */
@Component({
    selector: 'rt-date-panel',
    templateUrl: './rt-date-panel.component.html',
    styleUrl: './rt-date-panel.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        // rt-tools
        BlockDirective,
        ElemDirective,

        // components
        RtButtonDirective,
        RtCalendarComponent,
        RtIconButtonComponent,
        RtToggleButtonGroupComponent,
    ],
    host: {
        class: BEM_BLOCK,
        '[class.rt-date-panel--sheet]': 'sheet()',
        '[class.rt-date-panel--with-time]': "type() !== 'date'",
        '(keydown.escape)': 'closed.emit()',
    },
})
export class RtDatePanelComponent {
    /** Локаль кита: названия месяцев, дней недели и первый день недели идут по ней. */
    readonly #locale: Signal<string> = inject(RT_KIT_LOCALE);
    /** Минута открытия панели: от неё считается «сегодня», когда вход `now` не задан. */
    readonly #openedAt: Date = new Date();
    readonly #firstDay: Signal<number> = computed((): number => rtDateFirstDay(this.#locale()));

    protected readonly t: Signal<TRtKitLabelMap> = inject(RT_KIT_LABELS);
    protected readonly weekdays: Signal<readonly string[]> = computed((): readonly string[] => rtDateWeekdays(this.#locale()));

    protected readonly timeCells: Signal<readonly ElementRef<HTMLButtonElement>[]> =
        viewChildren<ElementRef<HTMLButtonElement>>('timeCell');

    protected readonly view: WritableSignal<TView> = signal<TView>('days');
    protected readonly tab: WritableSignal<TTab> = signal<TTab>('date');
    protected readonly activeKey: WritableSignal<string | null> = signal<string | null>(null);

    protected readonly today: Signal<string> = computed((): string => rtDateNow(this.now() ?? this.#openedAt, 1).day);

    protected readonly draftDay: WritableSignal<string | null> = linkedSignal(
        (): string | null => rtDateSplit(this.value(), this.type()).day
    );
    protected readonly draftTime: WritableSignal<string | null> = linkedSignal(
        (): string | null => rtDateSplit(this.value(), this.type()).time
    );
    protected readonly shownMonth: WritableSignal<string> = linkedSignal((): string =>
        (this.draftDay() ?? this.today()).slice(0, MONTH_LEN)
    );
    protected readonly year: WritableSignal<number> = linkedSignal((): number => Number(this.shownMonth().slice(0, YEAR_LEN)));

    protected readonly split: Signal<boolean> = computed((): boolean => this.sheet() && this.type() === 'datetime-local');
    protected readonly showDate: Signal<boolean> = computed(
        (): boolean => this.type() !== 'time' && !(this.split() && this.tab() === 'time')
    );
    protected readonly showTime: Signal<boolean> = computed(
        (): boolean => this.type() !== 'date' && !(this.split() && this.tab() === 'date')
    );

    protected readonly months: Signal<IRtCalendar.Month[]> = computed((): IRtCalendar.Month[] => [
        rtDateMonth(this.shownMonth(), {
            locale: this.#locale(),
            today: this.today(),
            chosen: this.draftDay(),
            min: this.min(),
            max: this.max(),
        }),
    ]);
    protected readonly canPrev: Signal<boolean> = computed((): boolean => rtDateCanPage(this.shownMonth(), -1, this.min(), this.max()));
    protected readonly canNext: Signal<boolean> = computed((): boolean => rtDateCanPage(this.shownMonth(), 1, this.min(), this.max()));

    protected readonly monthCells: Signal<IRtDatePicker.MonthCell[]> = computed((): IRtDatePicker.MonthCell[] =>
        rtDateMonths(this.year(), this.#locale(), this.min(), this.max())
    );
    protected readonly canPrevYear: Signal<boolean> = computed((): boolean =>
        rtDateInBounds(String(this.year() - 1), this.min(), this.max())
    );
    protected readonly canNextYear: Signal<boolean> = computed((): boolean =>
        rtDateInBounds(String(this.year() + 1), this.min(), this.max())
    );

    protected readonly draftHour: Signal<number | null> = computed((): number | null => this.#part(0));
    protected readonly draftMinute: Signal<number | null> = computed((): number | null => this.#part(1));
    protected readonly columns: Signal<IRtDatePicker.TimeColumns> = computed((): IRtDatePicker.TimeColumns =>
        rtDateTimeColumns({ step: this.minuteStep(), hour: this.draftHour(), day: this.draftDay(), min: this.min(), max: this.max() })
    );

    protected readonly todayOff: Signal<boolean> = computed((): boolean => !rtDateInBounds(this.today(), this.min(), this.max()));
    /** Черновик собирается в значение и лежит в границах. */
    protected readonly canApply: Signal<boolean> = computed((): boolean => this.#draftValue() !== '');
    protected readonly tabs: Signal<IRtToggleButtonGroup.Option<TTab>[]> = computed((): IRtToggleButtonGroup.Option<TTab>[] => [
        { value: 'date', label: this.t().uiDate },
        { value: 'time', label: this.t().uiTime },
    ]);

    /** Тип значения: дата, время или дата со временем. */
    public readonly type: InputSignal<IRtDatePicker.Type> = input.required<IRtDatePicker.Type>();
    /** Значение поля в форме нативного input'а; пустая строка — пусто. */
    public readonly value: InputSignal<string> = input<string>('');
    public readonly min: InputSignal<string | null> = input<string | null>(null);
    public readonly max: InputSignal<string | null> = input<string | null>(null);
    /** Шаг колонки минут. */
    public readonly minuteStep: InputSignalWithTransform<number, NumberInput> = input<number, NumberInput>(5, {
        transform: numberAttribute,
    });
    /** Раскладка нижней шторки: дни под палец, у даты со временем — переключатель «Дата | Время». */
    public readonly sheet: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });

    /**
     * Момент, от которого считаются «сегодня» и «Сейчас». Поле его не задаёт — панель читает часы
     * сама; задаёт витрина, чтобы кадр не менялся день ото дня.
     */
    public readonly now: InputSignal<Date | null> = input<Date | null>(null);

    /** Готовое значение: панель просит поле его записать. */
    public readonly picked: OutputEmitterRef<string> = output<string>();
    /** Панель просит закрыть себя. */
    public readonly closed: OutputEmitterRef<void> = output<void>();

    constructor() {
        // Колонки времени прокручены так, что выбранный час и минута стоят посередине. Прокрутка
        // задаётся самой колонке: `scrollIntoView` двигал бы и страницу под поповером.
        afterRenderEffect((): void => {
            for (const cell of this.timeCells()) {
                const node: HTMLButtonElement = cell.nativeElement;
                const column: HTMLElement | null = node.parentElement;
                if (column !== null && node.getAttribute('aria-pressed') === 'true') {
                    column.scrollTop = node.offsetTop - (column.clientHeight - node.offsetHeight) / 2;
                }
            }
        });
    }

    protected pickDay(day: IRtCalendar.Day): void {
        this.activeKey.set(day.key);
        if (this.type() === 'date') {
            this.#emit(day.key);
            return;
        }
        this.draftDay.set(day.key);
    }

    protected pickToday(): void {
        if (!this.todayOff()) {
            this.#emit(this.today());
        }
    }

    protected pickNow(): void {
        const now: IRtDatePicker.Moment = rtDateNow(this.now() ?? new Date(), this.minuteStep());
        this.draftTime.set(now.time);
        if (this.type() === 'datetime-local') {
            this.draftDay.set(now.day);
        }
    }

    protected pickHour(hour: number): void {
        this.draftTime.set(rtDateTime(hour, this.draftMinute() ?? 0));
    }

    protected pickMinute(minute: number): void {
        this.draftTime.set(rtDateTime(this.draftHour() ?? 0, minute));
    }

    protected onGridKey(event: IRtCalendar.GridKey): void {
        const next: string | null = rtDateGridKey(event.key, event.day.key, this.#firstDay(), this.min(), this.max());
        if (next !== null) {
            this.shownMonth.set(next.slice(0, MONTH_LEN));
            this.activeKey.set(next);
        }
    }

    protected page(delta: number): void {
        this.shownMonth.set(rtDateAddMonths(this.shownMonth(), delta));
    }

    protected openMonths(): void {
        this.year.set(Number(this.shownMonth().slice(0, YEAR_LEN)));
        this.view.set('months');
    }

    protected pageYear(delta: number): void {
        this.year.update((year: number): number => year + delta);
    }

    protected pickMonth(cell: IRtDatePicker.MonthCell): void {
        this.shownMonth.set(cell.key);
        this.view.set('days');
    }

    /** «Готово» и «Применить»: черновик уходит значением, панель закрывается. */
    protected apply(): void {
        const value: string = this.#draftValue();
        if (value !== '') {
            this.#emit(value);
        }
    }

    #emit(value: string): void {
        this.picked.emit(value);
        this.closed.emit();
    }

    #draftValue(): string {
        const value: string = rtDateWrite(this.type(), this.draftDay(), this.draftTime());
        return value !== '' && rtDateInBounds(value, this.min(), this.max()) ? value : '';
    }

    #part(index: number): number | null {
        const time: string | null = this.draftTime();
        return time === null ? null : Number(time.split(':')[index]);
    }
}
